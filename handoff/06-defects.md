# Remaining defects

1. **Latency is fake.** Adapter always waits 280ms.
2. **Persistence is localStorage** key `lifeos.mock.v2`. Two browsers do not share state.
3. **Failure mode does not block Settings.** Intentional so the QA switch can be turned off.
4. **Gold on cream** uppercase labels may fail strict AAA.
5. **Dates locked to Australia/Perth** in `isoDate()` / greeting.
6. **Seed dates are September 2026.** The utility bill stays overdue after that week.
7. **Play → Signal Path is a demonstration**, not a product.
8. **Join email check is naive** (`includes("@")`).
9. **`simulateFailure` must not ship** in production settings.
10. **Capture is not a model.** Sleep/mood mentions become unsaved notes on purpose.
11. **Habit catalogue is not user-editable** in this slice (seed habits only).
12. **No auth.** Join is a local form. Do not treat it as login.
