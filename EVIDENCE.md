# LifeOS frontend evidence

Runnable reference. Synthetic data. Auth off. Database off.

## Run

```
npm ci
npm test
npm run typecheck
npm run lint
npm run build:dev
npm run dev
```

`npm test` = adapter + capture unit tests, then Playwright (starts or reuses `:8080`).

## What works

- Public: Home, Products, Play, Join
- LifeOS: Today, Capture, Tasks, Goals, Money, Health, Settings
- Task create/edit/complete, goal create/edit, money log, habit, mood, sleep (daily replace)
- Nexus Capture deterministic parser + commit through the adapter
- Loading / empty / validation / simulated failure
- Desktop 1440 and 390 screenshots in `screenshots/evidence/`
- HTML report in `playwright-report/index.html`

## Not built

- Real accounts / Google auth
- Live Sabi / workbook write-back
- Real model behind Capture
- Signal Path as a shipped game
- User-authored habits
