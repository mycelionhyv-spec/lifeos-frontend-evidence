# Adapter endpoints

All methods on `LifeOsAdapter`. Mock: `createMockAdapter()` / `lifeOsApi`.

| Method | Failure gated | Notes |
|---|---|---|
| getSettings / updateSettings | no | QA switch must remain reachable |
| reset | no | `seed` \| `empty` |
| listTasks / createTask / updateTask | yes | name required, ≤80 |
| listGoals / createGoal / updateGoal | yes | name required; progress = current/target |
| listTransactions / createTransaction | yes | amount > 0 |
| listHabits / listHabitLogs / logHabit | yes | |
| listMood / createMood | yes | 1–10; same day replaced |
| listSleep / upsertSleep | yes | HH:MM; same date replaced |
| getToday | yes | derived snapshot |

Unsupported capture kinds (notes, free-text sleep/mood mentions) are **not** sent to the adapter.
