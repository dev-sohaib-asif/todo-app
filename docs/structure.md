# Todo App: Project Structure

Stack: SvelteKit (Svelte 5) + Tailwind CSS v4 + shadcn-svelte + `@lucide/svelte`. Frontend only, with seeded mock data.

## File tree

```
todo-app/
├── src/
│   ├── modules/
│   │   └── todos/
│   │       ├── data/
│   │       │   └── api.ts
│   │       ├── domain/
│   │       │   ├── bindings.ts
│   │       │   ├── form.ts
│   │       │   ├── todo-route-controllers.svelte.ts
│   │       │   ├── types.ts
│   │       │   └── validator.ts
│   │       └── presentation/
│   │           ├── components/
│   │           │   ├── DetailTodoData.component.svelte
│   │           │   ├── TodoForm.component.svelte
│   │           │   └── TodosData.component.svelte
│   │           └── pages/
│   │               ├── DetailPage.skeleton.svelte
│   │               ├── EditPage.skeleton.svelte
│   │               ├── ListPage.skeleton.svelte
│   │               └── NewPage.skeleton.svelte
│   ├── network/
│   │   ├── features/
│   │   │   └── todos.ts
│   │   ├── mock/
│   │   │   ├── todos.mock.ts
│   │   │   └── todos.seed.ts
│   │   ├── transport/
│   │   │   └── http.ts
│   │   ├── index.ts
│   │   └── types.ts
│   ├── routes/
│   │   ├── (app)/
│   │   │   ├── todos/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── edit/
│   │   │   │   │   │   └── +page.svelte
│   │   │   │   │   └── +page.svelte
│   │   │   │   ├── new/
│   │   │   │   │   └── +page.svelte
│   │   │   │   └── +page.svelte
│   │   │   └── +layout.svelte
│   │   ├── +layout.svelte
│   │   ├── +layout.ts
│   │   └── +page.ts
│   ├── shared/
│   │   └── presentation/
│   │       └── ui/
│   │           ├── shadcn-ui/
│   │           │   └── lib.ts
│   │           ├── badge.base.svelte
│   │           ├── button.base.svelte
│   │           ├── checkbox.base.svelte
│   │           ├── empty-state.base.svelte
│   │           ├── form-card.base.svelte
│   │           ├── input.base.svelte
│   │           ├── page-header.base.svelte
│   │           └── textarea.base.svelte
│   ├── app.css
│   ├── app.d.ts
│   └── app.html
├── .env
├── .env.example
├── .gitignore
├── README.md
├── components.json
├── package.json
├── svelte.config.js
├── tsconfig.json
└── vite.config.ts
```

Empty folders not shown above: `src/shared/application/` and `static/`.
`src/shared/presentation/ui/shadcn-ui/` gets its components (button, input, card, ...) from `pnpm dlx shadcn-svelte@latest add ...`; only `lib.ts` is written by hand.

## Aliases (`svelte.config.js`)

| Alias      | Path           |
| ---------- | -------------- |
| `$modules` | `src/modules`  |
| `$network` | `src/network`  |
| `$shared`  | `src/shared`   |

## Layers and dependency direction

```
routes/(app)/todos/**/+page.svelte        one-line import of a page skeleton
        ↓
modules/todos/presentation/pages/*.skeleton.svelte      page composition
        ↓
modules/todos/presentation/components/*.component.svelte  feature UI
        ↓
shared/presentation/ui/*.base.svelte      wrappers (the only files that import shadcn-ui)
        ↓
shared/presentation/ui/shadcn-ui/*        CLI-generated shadcn components

modules/todos/domain/*  (types, validator, form, bindings, controllers)
        ↓
modules/todos/data/api.ts
        ↓
network/features/todos.ts  →  mock (todos.mock.ts + todos.seed.ts)  or  transport/http.ts
```

## What each folder does

| Path | Purpose |
| --- | --- |
| `routes/` | Routing only. Pages are one-line imports of skeletons. `+layout.ts` sets `ssr = false`; `+page.ts` redirects `/` to `/todos`. |
| `modules/todos/presentation/pages` | List, New, Detail and Edit skeletons. |
| `modules/todos/presentation/components` | `TodoForm`, `TodosData` (list), `DetailTodoData`. |
| `modules/todos/domain` | Types, validation, form defaults, UI bindings, and rune-based controllers (`.svelte.ts`). |
| `modules/todos/data/api.ts` | Thin layer that calls `$network` only. |
| `network/types.ts` | API contract: `Todo`, DTOs, the `TodosApi` interface, `ApiError`. |
| `network/features/todos.ts` | Chooses mock or real HTTP based on `VITE_USE_MOCK`. |
| `network/mock/` | Seed data and the in-memory mock implementation. |
| `network/transport/http.ts` | `fetch` wrapper using `VITE_BASE_URL`; `defaultHeaders()` is where auth goes later. |
| `shared/presentation/ui/*.base.svelte` | Wrappers over shadcn-ui: badge, button, checkbox, empty-state, form-card, input, page-header, textarea. |

## Environment (`.env`)

| Variable | Meaning |
| --- | --- |
| `VITE_BASE_URL` | Backend base URL, used when mock is off. |
| `VITE_USE_MOCK` | `true` = seeded in-memory data, `false` = real backend. |

## Routes

| URL | Skeleton |
| --- | --- |
| `/todos` | `ListPage` |
| `/todos/new` | `NewPage` |
| `/todos/[id]` | `DetailPage` |
| `/todos/[id]/edit` | `EditPage` |
