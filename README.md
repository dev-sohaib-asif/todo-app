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
