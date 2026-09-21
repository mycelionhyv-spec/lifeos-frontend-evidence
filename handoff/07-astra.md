# Astra — reuse, inspect, discard

## Reuse
- `src/lib/api/types.ts` + `src/lib/api/mock-adapter.ts` as the behavioural spec
- `src/lib/capture/parse.ts` as the deterministic Capture contract
- `src/styles.css` tokens
- `src/components/layout/*` shells, `src/components/lifeos/*`
- `public/brand/logo-*.png` — approved files, do not regenerate
- Playwright specs in `tests/lifeos.spec.ts`

## Inspect
- Join is not auth
- `simulateFailure` is a QA lever
- `/app` is `ssr: false` because the mock lives in localStorage
- Capture copy must keep the “not a model” label if the parser is replaced by a real model later
- Currency AUD / timezone Perth

## Discard
- Anything that reconstructs the faceless figure besides the PNG lockups
- ChatGPT Sites habitat orb as LifeOS chrome
- Prior navy dashboard, Sabi panel, Grand Final, prompt-engine, zustand stores — **deleted in this revision**
- Template `scripts/*.test.mjs` platform chrome tests — **removed from `npm test`** (see `handoff/08-test-removals.md`)
