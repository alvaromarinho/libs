# ng-month-year-picker

Month/year picker dropdown component for Angular. Self-contained — no Bootstrap or icon font required.

## Structure

- `src/lib/ng-month-year-picker.component.ts` — `NgMonthYearPickerComponent` (logic + inputs/outputs)
- `src/lib/ng-month-year-picker.component.html` — template (trigger button + dropdown grid)
- `src/lib/ng-month-year-picker.component.css` — all styling (trigger, dropdown, grid, chevron SVGs), themeable via `--ng-month-year-picker-*` CSS custom properties
- `src/lib/ng-month-year-picker.module.ts` — `NgMonthYearPickerModule` wrapper
- `src/public-api.ts` — exports `NgMonthYearPickerComponent`, `NgMonthYearPickerModule`

## Public API

- Selector: `ng-month-year-picker`
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
- The prev/next year chevrons are inline SVGs (no icon font dependency).
- `:host` is `display: inline-flex; width: 100%` — the component fills its container's width; the dropdown is absolutely positioned and centered under the trigger.
- Colors/spacing are controlled via `--ng-month-year-picker-*` CSS custom properties on `:host` (e.g. `--ng-month-year-picker-primary` for the selected month) — override them on the host element to theme the component.

## Dependencies

Peer deps: `@angular/core`/`common` `>=14 <22`. No Bootstrap or icon font required.

## Build & test

```bash
ng build ng-month-year-picker
ng test ng-month-year-picker
```
