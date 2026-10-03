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
- Swipe-back: custom left-edge swipe (`src/mobile/edge-swipe-back.ts`, flag `EDGE_SWIPE_BACK`). F7's native gesture stays off because it needs `preloadPreviousPage`, which broke Back.
- SvelteKit link interception is cancelled on mobile (`blockSvelteKitLinkNavigation`), otherwise both routers navigate.
- Browser/system back button: `src/mobile/browser-back.svelte.ts` (flag `BROWSER_BACK` in `f7.ts`).
- F7 keeps its own navigation history (`browserHistory: false`); mobile always starts on the list; never use `backLinkUrl`/`backLinkForce` (they push a new page).
