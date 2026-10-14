# Todo App (SvelteKit + Tailwind v4 + shadcn-svelte + @lucide/svelte)

```bash
pnpm install
pnpm dlx shadcn-svelte@latest add button input textarea checkbox badge card --overwrite   # generates shadcn-ui/ (answer any prompts with defaults)
pnpm dev
```

## Switching to a real backend
In `.env`: `VITE_USE_MOCK=false` and `VITE_BASE_URL=https://your-api`.
The backend must satisfy `TodosApi` in `src/network/types.ts`
(GET/POST `/todos`, GET/PATCH/DELETE `/todos/:id`).
Add auth headers later in `src/network/transport/http.ts` (`defaultHeaders`).

## Layers
routes → modules/todos/presentation/pages → components → shared/presentation/ui/*.base → shadcn-ui
modules/todos/domain → data/api.ts → $network

## Mobile UI (Framework7)
- Phones/tablets get Framework7 (lazy-loaded from `src/mobile`); desktops get shadcn. Detection: `src/shared/application/device.ts`.
- Test on desktop with `?ui=mobile` (or `VITE_FORCE_UI=mobile`); `?ui=desktop` goes back.
- Mobile pages reuse `modules/*/domain` and `data` + `$network`; only `src/mobile/ui/*.base.svelte` imports `framework7-svelte`.
- Framework7 is UI only — no F7 router. SvelteKit owns URLs, history and the back button (`goto()`, `history.back()`, links), so the browser/system back gesture always pops in-app history and never exits the app.
- F7's click hijack is neutralized with `clicks: { externalLinks: 'a' }` (`src/mobile/f7.ts`), so F7 never `preventDefault`s an anchor and SvelteKit's link handling always runs.
- Each route file branches per UI (`detectUiMode()`): desktop skeleton via static import, mobile page via dynamic import (keeps `framework7-svelte` out of the desktop bundle).
- Navbar Back and pull-to-refresh are wired manually in `src/mobile/ui/page.base.svelte`, because F7's router hooks (`pageInit`, `onPageAfterIn`) never run.
