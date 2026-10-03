# Running a Go Fiber Backend as a Tauri Sidecar

Tauri cannot run Go code in-process. The supported approach is a **sidecar**: compile the Fiber server to a binary, bundle it with the app, and spawn it from `lib.rs`. The frontend then talks to it over `127.0.0.1`.

> **Mobile:** this sidecar approach is desktop-only. Android aarch64 and iOS builds are covered in [section 9](#9-android-aarch64-and-ios), where Go is built as a library instead.

```
Tauri app (Rust, lib.rs)
 ├── spawns ──► fiber-backend (Go binary, 127.0.0.1:PORT)
 └── WebView (frontend) ── fetch ──► http://127.0.0.1:PORT
```

---

## 1. Project layout

```
my-app/
├── backend/                      # Go Fiber source
│   ├── go.mod
│   └── main.go
├── src/                          # frontend
└── src-tauri/
    ├── Cargo.toml
    ├── tauri.conf.json
    ├── capabilities/default.json
    ├── binaries/                 # compiled Go binaries (gitignore this)
    │   └── fiber-backend-x86_64-unknown-linux-gnu
    └── src/lib.rs
```

> The sidecar name must not equal your Cargo package name, or the Tauri build fails.

---

## 2. Go side (`backend/main.go`)

```go
package main

import (
	"flag"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
)

func main() {
	port := flag.String("port", "4142", "port to listen on")
	flag.Parse()

	token := os.Getenv("SIDECAR_TOKEN")

	app := fiber.New(fiber.Config{DisableStartupMessage: true})

	// Health check (no auth) so Rust/frontend can wait for readiness
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	// Require the shared secret on everything else
	app.Use(func(c *fiber.Ctx) error {
		if token != "" && c.Get("Authorization") != "Bearer "+token {
			return c.SendStatus(fiber.StatusUnauthorized)
		}
		return c.Next()
	})

	app.Get("/api/hello", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "hello from Go"})
	})

	// Exit if the parent (Tauri) dies, e.g. after kill -9
	go watchParent(os.Getppid())

	// Bind to loopback ONLY, never 0.0.0.0
	log.Fatal(app.Listen("127.0.0.1:" + *port))
}

func watchParent(ppid int) {
	for {
		time.Sleep(2 * time.Second)
		if os.Getppid() != ppid {
			os.Exit(0)
		}
	}
}
```

`os.Getppid()` changes when the parent dies (on Linux it becomes 1 or a subreaper). This is a simple Unix-only guard. On Windows, use a different check, such as a named pipe or a stdin-close watcher.

If your frontend calls Fiber directly from the WebView (a different origin), add Fiber's CORS middleware:

```go
import "github.com/gofiber/fiber/v2/middleware/cors"

app.Use(cors.New(cors.Config{
	AllowOrigins: "http://tauri.localhost, tauri://localhost, http://localhost:1420",
	AllowHeaders: "Authorization, Content-Type",
}))
```

Put this before the auth middleware so preflight requests succeed. Check the exact origin your platform uses (it differs between Linux, macOS, and Windows).

---

## 3. Build the binary with the target-triple suffix

Tauri looks for `binaries/<name>-<target-triple>`.

**fish shell:**

```fish
set triple (rustc -vV | sed -n 's/host: //p')
cd backend
go build -ldflags "-s -w" -o ../src-tauri/binaries/fiber-backend-$triple .
```

**bash:**

```bash
triple=$(rustc -vV | sed -n 's/host: //p')
cd backend && go build -ldflags "-s -w" -o ../src-tauri/binaries/fiber-backend-$triple .
```

Wire it into the Tauri build so it always runs first. In `tauri.conf.json`:

```json
{
  "build": {
    "beforeDevCommand": "./scripts/build-sidecar.sh && npm run dev",
    "beforeBuildCommand": "./scripts/build-sidecar.sh && npm run build"
  }
}
```

(Put the build commands above into `scripts/build-sidecar.sh` and `chmod +x` it.)

Cross-compiling for release (do this in CI, one build per target):

| Target | Triple suffix | Go env |
|---|---|---|
| Linux x64 | `x86_64-unknown-linux-gnu` | `GOOS=linux GOARCH=amd64` |
| Windows x64 | `x86_64-pc-windows-msvc` (add `.exe`) | `GOOS=windows GOARCH=amd64` |
| macOS Intel | `x86_64-apple-darwin` | `GOOS=darwin GOARCH=amd64` |
| macOS Apple Silicon | `aarch64-apple-darwin` | `GOOS=darwin GOARCH=arm64` |

---

## 4. Tauri config

**`src-tauri/tauri.conf.json`:**

```json
{
  "bundle": {
    "externalBin": ["binaries/fiber-backend"]
  }
}
```

**`src-tauri/Cargo.toml`:**

```toml
[dependencies]
tauri = { version = "2" }
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
rand = "0.8"
```

**`src-tauri/capabilities/default.json`:** needed if you spawn from JS. Add it anyway if you hit a permission error:

```json
{
  "permissions": [
    "core:default",
    "shell:allow-open",
    {
      "identifier": "shell:allow-spawn",
      "allow": [{ "name": "binaries/fiber-backend", "sidecar": true, "args": true }]
    }
  ]
}
```

---

## 5. `lib.rs` (basic version)

Fixed port, kill on exit.

```rust
use std::sync::Mutex;
use tauri::{Manager, RunEvent};
use tauri_plugin_shell::{
    process::{CommandChild, CommandEvent},
    ShellExt,
};

struct Backend(Mutex<Option<CommandChild>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let (mut rx, child) = app
                .shell()
                .sidecar("fiber-backend")?
                .args(["--port", "4142"])
                .spawn()?;

            app.manage(Backend(Mutex::new(Some(child))));

            // Forward the sidecar's logs
            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(l) => println!("[go] {}", String::from_utf8_lossy(&l)),
                        CommandEvent::Stderr(l) => eprintln!("[go] {}", String::from_utf8_lossy(&l)),
                        CommandEvent::Terminated(p) => {
                            eprintln!("[go] exited: {:?}", p);
                            break;
                        }
                        _ => {}
                    }
                }
            });

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|handle, event| {
        if let RunEvent::Exit = event {
            if let Some(b) = handle.try_state::<Backend>() {
                if let Some(child) = b.0.lock().unwrap().take() {
                    let _ = child.kill();
                }
            }
        }
    });
}
```

---

## 6. `lib.rs` (hardened version)

Random free port, per-launch token, readiness wait, and a command so the frontend can get the connection info.

```rust
use std::{net::TcpListener, sync::Mutex, time::Duration};
use rand::{distributions::Alphanumeric, Rng};
use serde::Serialize;
use tauri::{Manager, RunEvent, State};
use tauri_plugin_shell::{
    process::{CommandChild, CommandEvent},
    ShellExt,
};

#[derive(Clone, Serialize)]
struct BackendInfo {
    base_url: String,
    token: String,
}

struct Backend {
    child: Mutex<Option<CommandChild>>,
    info: BackendInfo,
}

#[tauri::command]
fn backend_info(state: State<'_, Backend>) -> BackendInfo {
    state.info.clone()
}

fn free_port() -> u16 {
    TcpListener::bind("127.0.0.1:0")
        .expect("no free port")
        .local_addr()
        .unwrap()
        .port()
}

async fn wait_ready(port: u16) -> bool {
    let url = format!("http://127.0.0.1:{port}/health");
    for _ in 0..50 {
        // raw TCP connect is enough, which avoids pulling in an HTTP client
        if tokio::net::TcpStream::connect(("127.0.0.1", port)).await.is_ok() {
            let _ = &url;
            return true;
        }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    false
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![backend_info])
        .setup(|app| {
            let port = free_port();
            let token: String = rand::thread_rng()
                .sample_iter(&Alphanumeric)
                .take(32)
                .map(char::from)
                .collect();

            let (mut rx, child) = app
                .shell()
                .sidecar("fiber-backend")?
                .args(["--port", &port.to_string()])
                .env("SIDECAR_TOKEN", &token)
                .spawn()?;

            app.manage(Backend {
                child: Mutex::new(Some(child)),
                info: BackendInfo {
                    base_url: format!("http://127.0.0.1:{port}"),
                    token,
                },
            });

            tauri::async_runtime::spawn(async move {
                if !wait_ready(port).await {
                    eprintln!("[go] backend did not become ready in time");
                }
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(l) => println!("[go] {}", String::from_utf8_lossy(&l)),
                        CommandEvent::Stderr(l) => eprintln!("[go] {}", String::from_utf8_lossy(&l)),
                        CommandEvent::Terminated(p) => {
                            eprintln!("[go] exited: {:?}", p);
                            break;
                        }
                        _ => {}
                    }
                }
            });

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|handle, event| {
        if let RunEvent::Exit = event {
            if let Some(b) = handle.try_state::<Backend>() {
                if let Some(child) = b.child.lock().unwrap().take() {
                    let _ = child.kill();
                }
            }
        }
    });
}
```

This version uses `tokio::net::TcpStream`, so add `tokio = { version = "1", features = ["net", "time"] }` to `Cargo.toml`.

---

## 7. Frontend usage

```ts
import { invoke } from "@tauri-apps/api/core";

type BackendInfo = { base_url: string; token: string };

let info: BackendInfo | null = null;

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  info ??= await invoke<BackendInfo>("backend_info");
  const res = await fetch(`${info.base_url}${path}`, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${info.token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// usage
const data = await api<{ message: string }>("/api/hello");
```

Allow the loopback origin in your CSP (`tauri.conf.json` → `app.security.csp`), for example:

```
connect-src ipc: http://ipc.localhost http://127.0.0.1:*
```

---

## 8. Gotchas checklist

- **Orphaned process:** `kill()` is SIGTERM on POSIX and a hard terminate on Windows. If the app is force-killed, the sidecar can survive, so keep the parent-PID watcher in Go.
- **Readiness:** process alive does not mean Fiber is listening. Wait for the port or `/health` before the first request.
- **Loopback only:** always bind to `127.0.0.1`. Any local process can still reach it, which is why the token matters.
- **Database and files:** don't write next to the binary. Pass the app data dir from Rust (`app.path().app_data_dir()`) as an arg or env var.
- **Name clash:** the sidecar file name cannot match your Cargo package name.
- **Binary must exist before `tauri dev` / `tauri build`:** otherwise the build fails because the `-<triple>` file is missing.
- **Permissions on Linux/macOS:** `chmod +x src-tauri/binaries/*` if the executable bit gets lost (e.g. after CI artifact download).
- **Child processes:** if the Go binary forks workers, `kill()` only hits the immediate child.
- **Antivirus on Windows:** unsigned Go binaries sometimes get flagged. Sign your release builds.

---

## 9. Android (aarch64) and iOS

### 9.1 Read this first: sidecars do NOT work on mobile

Everything above (spawning a bundled binary with `tauri-plugin-shell`) is **desktop only**. A Tauri maintainer's answer on the upstream issue tracker is that sidecars are simply not supported on mobile, and that the binary isn't even included in the APK/AAB. iOS also doesn't let an app spawn arbitrary bundled executables, so the same limitation applies there.

So for mobile you can still build Go for `android/arm64` and `ios/arm64`, but the result must be a **library loaded inside the app process**, not a standalone binary:

| Platform | Go artifact | How it runs |
|---|---|---|
| Linux / Windows / macOS | executable (`externalBin`) | spawned sidecar process |
| Android aarch64 | `.so` (`c-shared`) or `.aar` (`gomobile bind`) | loaded into the app process |
| iOS arm64 | `.a` (`c-archive`) or `.xcframework` (`gomobile bind`) | statically linked into the app |

Requirements by host:

- **Android:** works from Arch Linux. You need the Android SDK and NDK installed.
- **iOS:** needs **macOS + Xcode**. You cannot build the iOS side on your Arch machine, so use a Mac or a macOS CI runner.

### 9.2 Restructure the Go code so desktop and mobile share it

Move the Fiber setup into a package both entry points can import:

```
backend/
├── go.mod
├── main.go                 # desktop sidecar entry (section 2)
├── internal/server/        # app := fiber.New(...), routes, auth middleware
│   └── server.go           # func New(token string) *fiber.App
└── ffi/
    └── ffi.go              # mobile entry (c-shared / c-archive)
```

`backend/ffi/ffi.go`:

```go
package main

/*
#include <stdlib.h>
*/
import "C"

import (
	"sync"

	"example.com/backend/internal/server"
	"github.com/gofiber/fiber/v2"
)

var (
	mu  sync.Mutex
	app *fiber.App
)

//export FiberStart
func FiberStart(port *C.char, token *C.char) C.int {
	mu.Lock()
	defer mu.Unlock()
	if app != nil {
		return 0 // already running
	}
	app = server.New(C.GoString(token))
	addr := "127.0.0.1:" + C.GoString(port)
	go func() { _ = app.Listen(addr) }()
	return 0
}

//export FiberStop
func FiberStop() {
	mu.Lock()
	defer mu.Unlock()
	if app != nil {
		_ = app.Shutdown()
		app = nil
	}
}

// required by -buildmode=c-shared / c-archive
func main() {}
```

Change `example.com/backend` to your real module path.

### 9.3 Build for Android aarch64 (c-shared)

Needs `CGO_ENABLED=1` and the NDK's clang as the C compiler. Run from the repo root.

**fish shell:**

```fish
set -x ANDROID_HOME $HOME/Android/Sdk
set NDK $ANDROID_HOME/ndk/(ls $ANDROID_HOME/ndk | tail -1)
set CC $NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android24-clang

mkdir -p src-tauri/gen/android/app/src/main/jniLibs/arm64-v8a

cd backend
env CGO_ENABLED=1 GOOS=android GOARCH=arm64 CC=$CC \
  go build -ldflags "-s -w" -buildmode=c-shared \
  -o ../src-tauri/gen/android/app/src/main/jniLibs/arm64-v8a/libfiberbackend.so \
  ./ffi
```

Notes:
- `aarch64-linux-android24-clang` means API level 24. Raise it if your `minSdk` is higher.
- Android Studio's NDK folder name is a version number, which is why the command picks the newest one. Pin it in CI.
- `jniLibs/arm64-v8a` is where Android loads native libraries from. Go also writes a `libfiberbackend.h` next to the `.so`, which you can delete.
- `src-tauri/gen/android` is created by `cargo tauri android init`. Run that first.

### 9.4 Build for iOS arm64 (c-archive, macOS only)

```sh
SDK=$(xcrun --sdk iphoneos --show-sdk-path)
CLANG=$(xcrun --sdk iphoneos --find clang)
FLAGS="-arch arm64 -isysroot $SDK -miphoneos-version-min=13.0"

mkdir -p src-tauri/gen/ios-libs

cd backend
CGO_ENABLED=1 GOOS=ios GOARCH=arm64 \
CC="$CLANG $FLAGS" CGO_CFLAGS="$FLAGS" CGO_LDFLAGS="$FLAGS" \
go build -ldflags "-s -w" -buildmode=c-archive \
  -o ../src-tauri/gen/ios-libs/libfiberbackend.a ./ffi
```

For the iOS **simulator** you need a separate build (`xcrun --sdk iphonesimulator`, the `-arch`/target for the simulator, and a different output file). Device and simulator slices can't live in the same `.a` unless you combine them into an `.xcframework`.

### 9.5 Link it into the Rust side

`src-tauri/build.rs`:

```rust
fn main() {
    let os = std::env::var("CARGO_CFG_TARGET_OS").unwrap_or_default();
    let dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();

    match os.as_str() {
        "android" => {
            println!("cargo:rustc-link-search=native={dir}/gen/android/app/src/main/jniLibs/arm64-v8a");
            println!("cargo:rustc-link-lib=dylib=fiberbackend");
        }
        "ios" => {
            println!("cargo:rustc-link-search=native={dir}/gen/ios-libs");
            println!("cargo:rustc-link-lib=static=fiberbackend");
            // Go's runtime/net on Apple platforms typically needs these
            println!("cargo:rustc-link-lib=framework=CoreFoundation");
            println!("cargo:rustc-link-lib=framework=Security");
            println!("cargo:rustc-link-lib=dylib=resolv");
        }
        _ => {}
    }

    tauri_build::build()
}
```

The extra Apple frameworks are what Go c-archive builds usually need; if you get undefined-symbol errors at link time, check this list first.

Make the shell plugin desktop-only in `src-tauri/Cargo.toml`:

```toml
[target.'cfg(not(any(target_os = "android", target_os = "ios")))'.dependencies]
tauri-plugin-shell = "2"
```

### 9.6 `lib.rs`: one `backend` module per platform

Keep the sidecar code from section 6 under `cfg(desktop)`, and add the FFI version under `cfg(mobile)`. Both expose the same `start` / `stop` so the rest of `lib.rs` doesn't care.

```rust
#[cfg(desktop)]
mod backend {
    // The sidecar spawn + CommandChild logic from section 6,
    // wrapped as: pub fn start(app: &tauri::App, port: u16, token: &str) -> Result<(), String>
    // and:        pub fn stop(handle: &tauri::AppHandle)
}

#[cfg(mobile)]
mod backend {
    use std::ffi::CString;
    use std::os::raw::{c_char, c_int};

    extern "C" {
        fn FiberStart(port: *const c_char, token: *const c_char) -> c_int;
        fn FiberStop();
    }

    pub fn start(port: u16, token: &str) -> Result<(), String> {
        let p = CString::new(port.to_string()).map_err(|e| e.to_string())?;
        let t = CString::new(token).map_err(|e| e.to_string())?;
        let rc = unsafe { FiberStart(p.as_ptr(), t.as_ptr()) };
        if rc == 0 { Ok(()) } else { Err(format!("FiberStart failed: {rc}")) }
    }

    pub fn stop() {
        unsafe { FiberStop() }
    }
}
```

Because Go runs in the same process on mobile, the hardened version's random port and token work unchanged: Rust generates both, calls `backend::start(port, &token)`, and the `backend_info` command hands them to the frontend exactly as in section 6.

Also gate the plugin registration in the builder:

```rust
let mut builder = tauri::Builder::default();
#[cfg(desktop)]
{
    builder = builder.plugin(tauri_plugin_shell::init());
}
```

### 9.7 Build commands

```fish
# Android: build Go first, then Tauri, targeting aarch64 only
./scripts/build-go-android.sh
cargo tauri android build --target aarch64

# iOS (on a Mac): build Go first, then Tauri
./scripts/build-go-ios.sh
cargo tauri ios build
```

Restricting Android to `--target aarch64` matters because the default builds several ABIs, and you only have an `arm64-v8a` Go library. For other ABIs, build more `.so` files (`GOARCH=arm`, `amd64`) and put each in its own `jniLibs/<abi>/` folder.

### 9.8 Mobile gotchas

- **Cleartext HTTP to loopback:** Android and iOS both restrict plain-HTTP traffic by default. You will likely need to allow cleartext to `127.0.0.1` (a network security config or `usesCleartextTraffic` on Android, and `NSAllowsLocalNetworking` under App Transport Security on iOS). Verify the exact settings on your target OS versions.
- **Background behavior:** mobile OSes suspend or kill background apps, which takes the Go server down with them. On resume, check `/health` and call `FiberStart` again if needed.
- **Single process:** a Go panic can take the whole app down, so wrap handlers with Fiber's `recover` middleware.
- **Binary size:** the Go runtime adds several MB per ABI. Keep `-ldflags "-s -w"`.
- **Files and database:** use the app data directory, never a relative path. Pass the directory from Rust as an extra `FiberStart` argument.
- **Untested here:** I researched the sidecar limitation and Go's mobile build tooling, but I haven't compiled this linking setup end to end. Expect to tune library paths and Apple link flags on the first build.

### 9.9 Alternatives if the FFI route is too much

- **`gomobile bind`:** produces an `.aar` (Android) or `.xcframework` (Apple) with generated Java/Kotlin/Swift bindings. By default it builds all Android ABIs; restrict with `-target android/arm64`. Use it if you'd rather start the server from `MainActivity.kt` / Swift than from Rust. You then need a separate way to share the port and token with the WebView, which is why the Rust FFI route above is simpler for Tauri.

  ```fish
  go install golang.org/x/mobile/cmd/gomobile@latest
  go install golang.org/x/mobile/cmd/gobind@latest
  gomobile init
  gomobile bind -target android/arm64 -androidapi 24 -o fiberbackend.aar ./backend/mobile
  gomobile bind -target ios -o Fiberbackend.xcframework ./backend/mobile   # macOS only
  ```

  `gomobile bind` needs `golang.org/x/mobile` in your module's dependency graph (`go get golang.org/x/mobile/bind`), and exported functions can only use types it supports.
- **Remote backend on mobile:** keep the sidecar for desktop and have the mobile apps call a hosted Fiber API instead. This is the least fragile option and avoids shipping a Go runtime inside the app.

---

## 10. References

- Tauri v2 docs, Embedding External Binaries: https://v2.tauri.app/develop/sidecar/
- Tauri sidecar name validation: commit `5cc1fd0` in tauri-apps/tauri
- Sidecars not supported on mobile: tauri-apps/tauri issue #9774
- `gomobile bind` (Android AAR / Apple xcframework): `cmd/gomobile` in golang.org/x/mobile
- Long-lived localhost sidecar pattern (health, token, kill-on-exit): `picoframe-core` on docs.rs
