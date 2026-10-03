# Mock Data Guide for Tauri IPC (Svelte frontend, Rust backend)

How to develop and test a Svelte frontend in a normal browser, with **no Tauri app running**, by faking the IPC layer with `mockIPC`.

---

## 1. What this is (and isn't)

- `mockIPC` is **JavaScript**, from `@tauri-apps/api/mocks`. It ships inside the npm package you already use. No Rust runs.
- It replaces Tauri's IPC inside the browser. Every `invoke("some_command", args)` goes to a handler **you write in TypeScript**, and whatever it returns becomes the result.
- The data is fake. Think of it as a stunt double: the frontend believes it's talking to Rust, but nothing real is behind the answer.

| | Browser + mock | Real Tauri app |
|---|---|---|
| Start with | `npm run dev` (Vite) | `cargo tauri dev` |
| `invoke()` goes to | your TS mock handlers | real Rust commands |
| Good for | UI/UX, layout, states, component tests | real behavior, permissions, final checks |

---

## 2. The one rule: mock only in the browser, only in dev

```ts
if (import.meta.env.DEV && !("__TAURI_INTERNALS__" in window)) {
  // install mock
}
```

Tauri injects `__TAURI_INTERNALS__` into its own window. So:

- In plain Chrome it is missing, so the mock installs.
- Inside `cargo tauri dev` or a built app it exists, so the mock is **never installed** and real IPC runs.
- `import.meta.env.DEV` keeps the mock out of production builds.

Sanity check: after running `cargo tauri dev`, confirm you see **real** data and not mock data.

---

## 3. Suggested layout

```
src/lib/mock/
├── index.ts          # installMockBackend()
├── state.ts          # in-memory "database" + scenario flags
├── handlers/
│   ├── todos.ts      # one file per feature/domain
│   └── settings.ts
└── plugins.ts        # plugin:* commands (dialog, fs, store, ...)
```

Keep handlers grouped by feature so the mock mirrors your Rust command modules.

---

## 4. Install it

### SvelteKit (SPA mode)
Tauri needs SvelteKit with the static adapter and SSR off.

```ts
// src/routes/+layout.ts
export const ssr = false;
export const prerender = false;

export async function load() {
  if (import.meta.env.DEV && !("__TAURI_INTERNALS__" in window)) {
    const { installMockBackend } = await import("$lib/mock");
    installMockBackend();
  }
}
```

### Plain Svelte + Vite
Put the same block at the top of `src/main.ts`, **before** the app mounts and before any code calls `invoke`.

---

## 5. The mock backend

```ts
// src/lib/mock/state.ts
export const db = {
  todos: [{ id: 1, title: "demo", done: false }],
};

// ?mock=normal | empty | error | slow
const params = new URLSearchParams(location.search);
export const scenario = params.get("mock") ?? "normal";
```

```ts
// src/lib/mock/handlers/todos.ts
import { emit } from "@tauri-apps/api/event";
import { db, scenario } from "../state";

export const todoHandlers = {
  list_todos: () => (scenario === "empty" ? [] : db.todos),

  add_todo: ({ title }: { title: string }) => {
    if (scenario === "error") throw new Error("mock failure: could not save");
    const t = { id: Date.now(), title, done: false };
    db.todos.push(t);
    emit("todos_changed", db.todos);   // fake a backend-pushed event
    return t;
  },
};
```

```ts
// src/lib/mock/index.ts
import { mockIPC, mockWindows, mockConvertFileSrc } from "@tauri-apps/api/mocks";
import { scenario } from "./state";
import { todoHandlers } from "./handlers/todos";
import { pluginHandlers } from "./plugins";

type Handler = (args: any) => unknown | Promise<unknown>;

const handlers: Record<string, Handler> = {
  ...todoHandlers,
  ...pluginHandlers,
  get_app_version: () => "0.0.0-mock",
};

export function installMockBackend() {
  mockWindows("main");               // needed before using @tauri-apps/api/window
  mockConvertFileSrc("linux");       // only if you use convertFileSrc()

  mockIPC(
    async (cmd, args) => {
      const handler = handlers[cmd];
      if (!handler) {
        console.warn("[mock] unmocked command:", cmd, args);
        throw new Error(`unmocked command: ${cmd}`);
      }
      const delay = scenario === "slow" ? 2000 : 150;   // fake latency
      await new Promise((r) => setTimeout(r, delay));
      return handler(args ?? {});
    },
    { shouldMockEvents: true }       // makes listen()/emit() work in the browser
  );

  console.info(`[mock] backend installed (scenario: ${scenario})`);
}
```

Why this shape:

- **Unmocked commands fail loudly.** Open the app in the browser and the console lists every command you still need to fake.
- **Latency is simulated**, so you can see loading spinners and skeletons.
- **Scenarios** (`?mock=empty`, `?mock=error`, `?mock=slow`) let you design empty states, error toasts and loading UI without touching code. Open `http://localhost:5173/?mock=error`.

---

## 6. Plugin commands

Plugin calls arrive as `plugin:<name>|<command>` strings (the docs show `plugin:event|emit`). The exact names depend on the plugin and version, so find them by running the app and reading the `[mock] unmocked command` warnings.

```ts
// src/lib/mock/plugins.ts
export const pluginHandlers = {
  "plugin:dialog|open": () => "/mock/path/file.txt",       // example name, verify yours
  "plugin:dialog|save": () => "/mock/path/export.json",    // example name, verify yours
};
```

Notes:

- Only the **IPC call** is faked. Anything that reads real files or uses real OS dialogs will not work in a browser, so return plausible fake paths or content.
- Event plugin commands (`plugin:event|...`) are consumed by `shouldMockEvents: true`. You don't mock those yourself.

---

## 7. Events and streaming

- **Plain events**: with `shouldMockEvents: true`, `listen()` and `emit()` work in the browser. To simulate Rust pushing an event, call `emit("name", payload)` from a handler (as in `add_todo` above) or from a `setInterval` for progress-style events.
- **`Channel` / streaming commands**: possible but fiddly. The official mocking page shows a pattern that grabs the callback function the frontend registered on `window` and calls it from the mock. Log `cmd` and `args` first to see the exact shape, then follow the official example. Mock these last.

---

## 8. Automated tests

### Component tests (Vitest)
The official pattern: `mockIPC` plus Vitest spies.

```ts
import { afterEach, expect, test, vi } from "vitest";
import { mockIPC, clearMocks } from "@tauri-apps/api/mocks";
import { invoke } from "@tauri-apps/api/core";

afterEach(() => clearMocks());

test("calls list_todos", async () => {
  mockIPC((cmd) => (cmd === "list_todos" ? [{ id: 1, title: "x", done: false }] : undefined));
  const spy = vi.spyOn(window.__TAURI_INTERNALS__, "invoke");

  const todos = await invoke("list_todos");

  expect(spy).toHaveBeenCalled();
  expect(todos).toHaveLength(1);
});
```

Vitest Browser Mode with `vitest-browser-svelte` also works for Tauri + SvelteKit projects, running components in a real browser.

### Full UI flows (Playwright)
Point Playwright at the Vite dev server, which already installs the mock. No Tauri needed.

```ts
// playwright.config.ts
export default {
  webServer: { command: "npm run dev", port: 5173, reuseExistingServer: true },
  use: { baseURL: "http://localhost:5173" },
};
```

Use `?mock=error` style URLs in tests to cover error and empty states.

### Real-app E2E (occasional)
Playwright only drives browsers. For end-to-end tests of the **real** Tauri app, use WebdriverIO or Selenium (via the Tauri WebDriver support). Keep a few as smoke tests.

---

## 9. What mocks cannot catch

- **Real Rust bugs.** The mock is only as correct as you write it.
- **Shape drift.** If a Rust struct changes and the mock doesn't, tests pass but the app breaks. Keep mock return shapes in sync with your Rust types (tools like `ts-rs` or `specta` can generate TS types; not evaluated here).
- **Permissions.** Tauri v2 enforces capabilities in the real runtime, and mocks skip that. A command can work in Chrome and be blocked in the app.
- **Platform differences.** Linux Tauri uses WebKitGTK, while Chrome is Chromium, so small rendering differences are expected.

**Before calling a UI change done:** run it once in the real app (`cargo tauri dev`) and click through the same flow.

---

## 10. Troubleshooting

| Symptom | Likely cause |
|---|---|
| `invoke` throws / `__TAURI_INTERNALS__` undefined | Mock installed too late. Install it before the app mounts and before any `invoke` call. |
| Window API errors in the browser | Call `mockWindows("main")` first. |
| `window is not defined` | SSR is on. Set `ssr = false` (SPA mode). |
| Console shows `unmocked command: ...` | Add a handler for that command name. |
| Events never arrive | Missing `{ shouldMockEvents: true }`. |
| Mock data shows inside `cargo tauri dev` | The guard is wrong. Re-check the `__TAURI_INTERNALS__` condition. |
| Tests leak into each other | Call `clearMocks()` in `afterEach`. |

---

## 11. Workflow cheat sheet

1. `npm run dev`, open Chrome, build the UI against the mock.
2. Check `?mock=empty`, `?mock=error`, `?mock=slow` for every screen.
3. Add Vitest component tests and a Playwright flow for critical paths.
4. `cargo tauri dev`, click through the same flow against real Rust.

---

## 12. References

- Tauri v2 docs, Mock Tauri APIs: https://v2.tauri.app/develop/tests/mocking/
- `@tauri-apps/api/mocks` reference: https://v2.tauri.app/reference/javascript/api/namespacemocks/
- Fix that lets `mockIPC` / `mockWindows` work when `__TAURI_INTERNALS__` is undefined: tauri-apps/tauri commit `97e3341`

> Written from the official docs and examples. The exact plugin command names and `Channel` mocking should be verified in your own project on first run.
