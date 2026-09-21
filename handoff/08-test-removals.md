# Tests removed from `npm test`

These still exist on disk as platform chrome (required for the Grok preview host). They are **not** part of `npm test` because they assert template OG titles and fail once `src/lib/og/site.json` is branded “MyHYv Nexus LifeOS”.

Removed from the script:

- `scripts/grok-pwa-plugin.test.mjs` — expects injected `og:title` from the document title; branded `site.json` overrides it
- `scripts/brand-check.test.mjs`, `scripts/browser-smoke-verdict.test.mjs`, `scripts/preview.test.mjs`, `scripts/write-atomic.test.mjs`, `scripts/with-app-env.test.mjs`, `scripts/migration-plan.test.mjs`, `scripts/sign-out-plan.test.mjs`, `scripts/check-auth-invariant.test.mjs`
- `src/lib/app-data/*.test.ts`, `src/lib/auth/*.test.ts` — template auth/app-data. Auth is OFF for this product.

`npm test` now runs:

1. `src/lib/api/mock-adapter.test.ts`
2. `src/lib/capture/parse.test.ts`
3. `playwright test` (HTML report → `playwright-report/`)
