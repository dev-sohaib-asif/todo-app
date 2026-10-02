# Todo App: Project Structure

Stack: SvelteKit (Svelte 5) + Tailwind CSS v4 + shadcn-svelte (desktop UI) + Framework7 (mobile/tablet UI) + `@lucide/svelte`. Frontend only, with seeded mock data.

## File tree

```
todo-app/
├── src/
│   ├── mobile/
│   │   ├── modules/
│   │   │   └── todos/
│   │   │       └── presentation/
│   │   │           ├── components/
│   │   │           │   ├── TodoForm.mobile.svelte
│   │   │           │   └── TodosData.mobile.svelte
│   │   │           └── pages/
│   │   │               ├── DetailPage.mobile.svelte
│   │   │               ├── EditPage.mobile.svelte
│   │   │               ├── ListPage.mobile.svelte
│   │   │               └── NewPage.mobile.svelte
│   │   ├── ui/
│   │   │   ├── button.base.svelte
│   │   │   ├── fab.base.svelte
│   │   │   ├── field.base.svelte
│   │   │   ├── list-item.base.svelte
│   │   │   ├── list.base.svelte
│   │   │   └── page.base.svelte
│   │   ├── MobileApp.svelte
│   │   ├── f7.ts
│   │   ├── routes.ts
│   │   └── types.ts
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
│   │   ├── application/
│   │   │   └── device.ts
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

Empty folder not shown: `static/`. `src/shared/presentation/ui/shadcn-ui/` gets its components from `pnpm dlx shadcn-svelte@latest add ...`; only `lib.ts` is written by hand.
`docs/` holds this file.

## Aliases (`svelte.config.js`)

| Alias      | Path           |
| ---------- | -------------- |
| `$modules` | `src/modules`  |
| `$network` | `src/network`  |
| `$shared`  | `src/shared`   |
| `$mobile`  | `src/mobile`   |

## Two UIs, one core

```
                    routes/(app)/+layout.svelte
                    detectUiMode() (shared/application/device.ts)
                     /                                  \
            desktop  /                                   \  phone / tablet (lazy import)
                    ↓                                     ↓
   routes → modules/*/presentation/pages            mobile/MobileApp.svelte (Framework7 <App>)
          → modules/*/presentation/components        → mobile/modules/*/presentation/pages
          → shared/presentation/ui/*.base.svelte     → mobile/modules/*/presentation/components
          → shared/presentation/ui/shadcn-ui/*       → mobile/ui/*.base.svelte
                                                     → framework7-svelte
                    \                                   /
                     ↘                                 ↙
              modules/*/domain  (types, validator, form, bindings, controllers)
                                  ↓
                         modules/*/data/api.ts
                                  ↓
                 network/features/*.ts → mock (network/mock) or transport/http.ts
```

Rules:
- Only `shared/presentation/ui/*.base.svelte` imports shadcn-ui.
- Only `mobile/ui/*.base.svelte` imports `framework7-svelte`.
- `domain/`, `data/` and `network/` never import any UI library, so both UIs share them.

## What each folder does

| Path | Purpose |
| --- | --- |
| `routes/` | Desktop routing. Pages are one-line imports of skeletons. `(app)/+layout.svelte` also chooses desktop or mobile UI. `+layout.ts` sets `ssr = false`; `+page.ts` redirects `/` to `/todos`. |
| `modules/todos/presentation` | Desktop pages (List, New, Detail, Edit skeletons) and components (`TodoForm`, `TodosData`, `DetailTodoData`). |
| `modules/todos/domain` | Types, validation, form defaults, UI bindings, rune-based controllers (`.svelte.ts`). Shared by desktop and mobile. |
| `modules/todos/data/api.ts` | Thin layer that calls `$network` only. |
| `network/types.ts` | API contract: `Todo`, DTOs, the `TodosApi` interface, `ApiError`. |
| `network/features/todos.ts` | Chooses mock or real HTTP based on `VITE_USE_MOCK`. |
| `network/mock/` | Seed data and the in-memory mock implementation. |
| `network/transport/http.ts` | `fetch` wrapper using `VITE_BASE_URL`; `defaultHeaders()` is where auth goes later. |
| `shared/application/device.ts` | Decides `mobile` or `desktop` once at startup. |
| `shared/presentation/ui/*.base.svelte` | Desktop wrappers over shadcn-ui. |
| `mobile/MobileApp.svelte` | Framework7 `<App>` + main `<View>`; imports Framework7 CSS. |
| `mobile/f7.ts` | Framework7 params (theme auto, dark mode auto, own history) and deep-link `initialUrl()`. |
| `mobile/routes.ts` | Framework7 routes (async components), same paths as the desktop routes. |
| `mobile/types.ts` | Minimal `F7Router` / `F7Route` prop types. |
| `mobile/ui/*.base.svelte` | Mobile wrappers over framework7-svelte: page, list, list-item, field, button, fab. |
| `mobile/modules/todos/presentation` | Mobile pages and components that reuse the shared domain/data layers. |

## Device detection (`shared/application/device.ts`)

Phones and tablets get Framework7; everything else gets shadcn.
- Checked once at startup, never on resize, so page state is not destroyed.
- Signals: primary pointer is touch with no hover, a mobile user agent, or iPadOS (reports as Mac with touch points).
- Never decided by screen width alone.
- Test override: `?ui=mobile` or `?ui=desktop` in the URL (remembered for the session), or `VITE_FORCE_UI`.
- Framework7 JS and CSS are loaded with a dynamic import, so desktop users do not download them.

## Environment (`.env`)

| Variable | Meaning |
| --- | --- |
| `VITE_BASE_URL` | Backend base URL, used when mock is off. |
| `VITE_USE_MOCK` | `true` = seeded in-memory data, `false` = real backend. |
| `VITE_FORCE_UI` | `mobile`, `desktop`, or empty for auto-detect. |

## Routes

| URL | Desktop skeleton | Mobile page |
| --- | --- | --- |
| `/todos` | `ListPage` | `ListPage.mobile` |
| `/todos/new` | `NewPage` | `NewPage.mobile` |
| `/todos/[id]` | `DetailPage` | `DetailPage.mobile` |
| `/todos/[id]/edit` | `EditPage` | `EditPage.mobile` |

On mobile, Framework7 keeps its own navigation history (`browserHistory: false`); a deep link opens the matching page.
