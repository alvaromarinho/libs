# ng-month-picker

Month/year picker dropdown component for Angular and Bootstrap 5.

## Structure

- `src/lib/ng-month-picker.component.ts` — `NgMonthPickerComponent` (logic + inputs/outputs)
- `src/lib/ng-month-picker.component.html` — template (trigger button + dropdown grid)
- `src/lib/ng-month-picker.component.css` — dropdown positioning/grid styles
- `src/lib/ng-month-picker.module.ts` — `NgMonthPickerModule` wrapper
- `src/public-api.ts` — exports `NgMonthPickerComponent`, `NgMonthPickerModule`

## Public API

- Selector: `ng-month-picker`
- Inputs: `value: string` (format `YYYY-MM`), `label?: string` (overrides the button text; if omitted, derived from `value` + `monthNames`), `monthNames: string[]` (default PT-BR `['Jan', ..., 'Dez']`)
- Outputs: `valueChange` (emits `YYYY-MM` when a month is picked)

## How it works

- The trigger is a single button showing `displayLabel`; clicking it toggles `showPicker` and sets `pickerYear` from `value` (or current year if `value` is empty).
- The dropdown shows a year header (prev/next via chevron buttons, changing only `pickerYear`) and a 4-column grid of `monthNames` buttons.
- Selecting a month emits `valueChange` with `${pickerYear}-MM` and closes the dropdown. `value` itself is never mutated internally — the parent owns it via `valueChange`.
- A `@HostListener('document:click')` closes the dropdown on any outside click; the dropdown's own click handler calls `stopPropagation()` so clicks inside it don't trigger this.
- `ngOnChanges` resyncs `pickerYear` to `value`'s year whenever `value` changes while the picker is closed (so reopening shows the right year), but leaves `pickerYear` alone while open (so browsing years isn't reset by an external `value` update).

## Gotchas

- `isSelected()` compares against `pickerYear`, not the current year — the highlighted month only matches `value` when `pickerYear === selectedYear`.
- Chevron icons (`bi-chevron-left`/`bi-chevron-right`) require **Bootstrap Icons** to be loaded in the host app.
- `:host` is `display: inline-flex; width: 100%` — the component fills its container's width; the dropdown is absolutely positioned and centered under the trigger.

## Dependencies

Peer deps: `@angular/core`/`common` `>=14 <22`, `bootstrap ^5`, `bootstrap-icons ^1`. Requires Bootstrap CSS and Bootstrap Icons in the host app.

## Build & test

```bash
ng build ng-month-picker
ng test ng-month-picker
```
