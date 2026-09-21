# Acceptance matrix

Evidence: `npx playwright test` HTML report in `playwright-report/`. Screenshots in `screenshots/evidence/`.

| ID | Claim | Proof | Result |
|---|---|---|---|
| A1 | Home branded, no “command centre” copy | `tests/lifeos.spec.ts` nav test + 1440/390-home.png | PASS |
| A2 | Public + LifeOS navigation, desktop and 390 | same spec, both projects | PASS |
| A3 | Task create / edit / complete | spec “task create, edit, complete and validation” | PASS |
| A4 | Task name validation | empty submit → field-error | PASS |
| A5 | Transaction create | spec logs “Market veg” | PASS |
| A6 | Habit complete | `habit-HAB-1` checked | PASS |
| A7 | Mood entry | `M6` row | PASS |
| A8 | Empty state | Empty board → “Inbox is clear.” | PASS |
| A9 | Simulated API failure | Settings switch → error-block on Today | PASS |
| A10 | No horizontal overflow at 390 | `noOverflow()` | PASS |
| A11 | No uncaught page/console errors | `collectErrors` (ignores grok.com extension noise) | PASS |
| A12 | Goal create / edit | “Read 12 books” → 25% → rename | PASS |
| A13 | Sleep log + same-day replace | one row after second save | PASS |
| A14 | Nexus Capture canonical sentence | task + txn + habit committed | PASS |
| A15 | Capture labelled deterministic, not AI | copy on `/app/capture` | PASS |
| A16 | `npm ci` / `typecheck` / `lint` / `build:dev` / `npm test` | run in this workspace | PASS |

Mobile project skips the mutation specs (desktop already proves them) and still runs navigation, overflow, and screenshot capture.
