# A11y and responsive

- Public and LifeOS menus are explicit buttons (not an unreferenced Trigger) with `aria-label`
- Sheet includes a visually hidden `Dialog.Title`
- Checkboxes have `aria-label` from the record name
- Hit targets 44px (`h-11` / `size-11`)
- Desktop ~1440: sidebar. 390: icon menu + sheet
- `overflow-x: hidden` on `html`/`body`; Playwright asserts `scrollWidth - clientWidth ≤ 1`
- Gold uppercase labels may fail strict AAA (known)
