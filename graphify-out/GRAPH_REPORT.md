# Graph Report - todo_app  (2026-10-15)

## Corpus Check
- Corpus is ~31,584 words - fits in a single context window. You may not need a graph.

## Summary
- 409 nodes · 712 edges · 33 communities (17 shown, 16 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Desktop Skeleton Pages UI
- Mobile Page Controllers UI
- Mobile Todo Components
- Package Dependencies
- Mock Network Data Layer
- Project Documentation
- Routes and App Shell
- Android Gradle Build Task
- Tauri App Configuration
- Dev Dependencies
- shadcn Configuration
- Sidecar Guide Docs
- TypeScript Config
- Framework7 App Shell
- Android MainActivity
- Mobile Field Input
- Tauri Capabilities Config
- Desktop Input Base
- Desktop Textarea Base
- App Launcher Icons
- Root Layout Children
- Root Layout SSR Config
- Android Signing Script
- App Env Types
- App Package Metadata

## God Nodes (most connected - your core abstractions)
1. `svelte` - 31 edges
2. `cn()` - 13 edges
3. `WithElementRef` - 12 edges
4. `framework7-svelte` - 10 edges
5. `Todo` - 10 edges
6. `CreateTodoDto` - 10 edges
7. `Todo App: Project Structure` - 9 edges
8. `TodosApi` - 8 edges
9. `Running a Go Fiber Backend as a Tauri Sidecar` - 8 edges
10. `todoApi` - 7 edges

## Surprising Connections (you probably didn't know these)
- `TodosApi backend contract (src/network/types.ts)` --conceptually_related_to--> `Go Fiber backend (loopback HTTP)`  [AMBIGUOUS]
  README.md → docs/sidecar_guide.md
- `Todo App: Project Structure` --references--> `SvelteKit HTML shell (%sveltekit.head% / %sveltekit.body%)`  [EXTRACTED]
  docs/structure.md → src/app.html
- `Layered presentation architecture` --conceptually_related_to--> `Two UIs, one core`  [INFERRED]
  README.md → docs/structure.md
- `src/network (mock or HTTP transport)` --implements--> `TodosApi backend contract (src/network/types.ts)`  [EXTRACTED]
  docs/structure.md → README.md
- `detectUiMode() UI selection` --references--> `Framework7 mobile UI layer`  [EXTRACTED]
  docs/structure.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **** — readme_mobile_ui_framework7, docs_structure_two_ui_one_core, docs_structure_detect_ui_mode [EXTRACTED 1.00]
- **** — docs_sidecar_guide_sidecar, docs_sidecar_guide_backend_info, docs_sidecar_guide_parent_watcher [EXTRACTED 1.00]

## Communities (33 total, 16 thin omitted)

### Community 0 - "Desktop Skeleton Pages UI"
Cohesion: 0.07
Nodes (35): svelte, tailwind-variants, {
		fill = false,
		color,
		disabled = false,
		onclick,
		children
	}, { onclick, label = 'Add', children }, c, c, filters, {
		variant = 'default',
		children
	} (+27 more)

### Community 1 - "Mobile Page Controllers UI"
Cohesion: 0.08
Nodes (29): framework7-svelte, c, remove(), busy, c, error, save(), c (+21 more)

### Community 2 - "Mobile Todo Components"
Cohesion: 0.13
Nodes (22): filters, {
		todos,
		visible,
		loading,
		error,
		filter,
		remaining,
		onfilter,
		ontoggle,
		onremove
	}, errors, form, {
		initial,
		submitLabel = 'Save',
		busy = false,
		error = null,
		onsubmit
	}, submit(), {
		todos,
		ontoggle,
		onremove
	}, priorityBadge (+14 more)

### Community 3 - "Package Dependencies"
Cohesion: 0.07
Nodes (27): dependencies, framework7, framework7-svelte, @lucide/svelte, name, private, scripts, build (+19 more)

### Community 4 - "Mock Network Data Layer"
Cohesion: 0.11
Nodes (12): todosHttp, db, find(), todosMock, todosSeed, BASE_URL, defaultHeaders(), http() (+4 more)

### Community 5 - "Project Documentation"
Cohesion: 0.12
Nodes (24): Mock Data Guide for Tauri IPC, tauri-apps/tauri commit 97e3341 (mockIPC/mockWindows fix), __TAURI_INTERNALS__ + DEV mock guard, installMockBackend(), mockIPC (@tauri-apps/api/mocks), @tauri-apps/api/mocks reference, Mock scenarios (?mock=empty|error|slow), Tauri v2 docs: Mock Tauri APIs (+16 more)

### Community 6 - "Routes and App Shell"
Cohesion: 0.12
Nodes (9): bits-ui, @lucide/svelte, { children }, MobileApp, detectUiMode(), UiMode, {
		checked = false,
		label,
		onchange
	}, {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		class: className,
		...restProps
	} (+1 more)

### Community 7 - "Android Gradle Build Task"
Cohesion: 0.14
Nodes (3): BuildTask, Config, RustPlugin

### Community 8 - "Tauri App Configuration"
Cohesion: 0.10
Nodes (19): debugApplicationIdSuffix, app, security, windows, build, beforeBuildCommand, beforeDevCommand, devUrl (+11 more)

### Community 9 - "Dev Dependencies"
Cohesion: 0.11
Nodes (18): devDependencies, bits-ui, clsx, csstype, @internationalized/date, shadcn-svelte, svelte, svelte-check (+10 more)

### Community 10 - "shadcn Configuration"
Cohesion: 0.15
Nodes (12): aliases, components, hooks, lib, ui, utils, registry, $schema (+4 more)

### Community 11 - "Sidecar Guide Docs"
Cohesion: 0.39
Nodes (9): Running a Go Fiber Backend as a Tauri Sidecar, backend_info command (base_url + token), Go Fiber backend (loopback HTTP), gomobile bind (AAR / xcframework alternative), tauri-apps/tauri issue #9774 (sidecars unsupported on mobile), Go as mobile library (c-shared / c-archive FFI), Parent-PID watcher (watchParent), Tauri sidecar (spawned Go binary) (+1 more)

### Community 12 - "TypeScript Config"
Cohesion: 0.22
Nodes (8): ./.svelte-kit/tsconfig.json, compilerOptions, allowJs, checkJs, moduleResolution, skipLibCheck, strict, extends

### Community 13 - "Framework7 App Shell"
Cohesion: 0.32
Nodes (3): framework7, f7params, { children }

### Community 15 - "Mobile Field Input"
Cohesion: 0.33
Nodes (3): focused, id, {
		value = $bindable(''),
		label,
		type = 'text',
		options,
		error,
		clearable = false
	}

### Community 16 - "Tauri Capabilities Config"
Cohesion: 0.33
Nodes (5): description, identifier, permissions, $schema, windows

### Community 20 - "App Launcher Icons"
Cohesion: 0.67
Nodes (3): App Brand Mark: Interlocking Cyan/Amber Rings, Android Launcher Icon Set (mipmap densities), Tauri Desktop Icon Set

## Ambiguous Edges - Review These
- `TodosApi backend contract (src/network/types.ts)` → `Go Fiber backend (loopback HTTP)`  [AMBIGUOUS]
  docs/sidecar_guide.md · relation: conceptually_related_to

## Knowledge Gaps
- **17 isolated node(s):** `@internationalized/date`, `csstype`, `shadcn-svelte`, `svelte-check`, `tailwindcss` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 196 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `svelte` connect `Desktop Skeleton Pages UI` to `Mobile Page Controllers UI`, `Mobile Todo Components`, `Package Dependencies`, `Routes and App Shell`, `Framework7 App Shell`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **What connects `@internationalized/date`, `csstype`, `shadcn-svelte` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Desktop Skeleton Pages UI` be split into smaller, more focused modules?**
  _Cohesion score 0.0679563492063492 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `Dev Dependencies` to `Package Dependencies`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `Mobile Page Controllers UI` be split into smaller, more focused modules?**
  _Cohesion score 0.08078431372549019 - nodes in this community are weakly interconnected._
- **Why does `Todo` connect `Mobile Todo Components` to `Mobile Page Controllers UI`, `Mock Network Data Layer`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `TodosApi backend contract (src/network/types.ts)` and `Go Fiber backend (loopback HTTP)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._