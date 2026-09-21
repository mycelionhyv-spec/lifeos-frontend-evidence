# Inventory

## Public
- `/` Home — approved square lockup, no command-centre copy
- `/products` LifeOS / Signal Path / Vacate Ready cards
- `/play` Signal Path demonstration
- `/join` local request form (not auth)

## LifeOS (`/app`, `ssr: false`)
- `/app` Today
- `/app/capture` Nexus Capture — Say it once
- `/app/tasks` create / edit / complete
- `/app/goals` create / edit
- `/app/money` log transactions
- `/app/health` habits, mood, sleep (daily replace)
- `/app/settings` seed/empty reset, simulateFailure QA switch

## Adapter
- `src/lib/api/types.ts` contract
- `src/lib/api/mock-adapter.ts` localStorage `lifeos.mock.v2`, 280ms latency
- `src/lib/capture/parse.ts` deterministic classifier (not a model)

## Brand
- `public/brand/logo-square.png` `logo-wide.png` `logo-parent.png` — approved, unchanged
