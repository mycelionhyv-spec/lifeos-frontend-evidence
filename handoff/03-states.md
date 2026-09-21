# States

- **Loading** — `LoadingBlock` while the first query has no data
- **Empty** — dashed `EmptyBlock` (tasks inbox, goals, sleep, money)
- **Validation** — `FieldError` under the field (`MockApiError.fields`)
- **Failure** — `ErrorBlock` when `simulateFailure` is on (Settings excluded)
- **Success** — toast + list refresh via TanStack Query

Capture: Parse → editable cards → Approve/Reject → Commit approved. Unsupported cards cannot be approved into the adapter.
