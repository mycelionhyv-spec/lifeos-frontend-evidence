# LifeOS frontend evidence (ROUND TWO)

MyHYv Nexus — transferable frontend reference. Synthetic data. Auth off.

**Repo:** https://github.com/mycelionhyv-spec/lifeos-frontend-evidence

## Verify

```bash
git clone https://github.com/mycelionhyv-spec/lifeos-frontend-evidence.git
cd lifeos-frontend-evidence
npm ci
npm test
npm run typecheck
npm run lint
npm run build:dev
```

## What is in this pack

- Public: Home, Products, Play, Join
- LifeOS: Today, Capture (Say it once), Tasks, Goals, Money, Health, Settings
- Mock adapter (`lifeos.mock.v2`) + deterministic Capture parser (not a model)
- Playwright tests + `handoff/` for Astra

See `EVIDENCE.md` and `handoff/07-astra.md`.
