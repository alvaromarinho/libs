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
- Inputs: `value: string` (format `YYYY-MM`), `label?: string` (overrides the button text; if omitted, derived from `value` + `monthNames`), `monthNames: string[]` (default PT-BR `['Jan', ..., 'Dez']`), `disabled: boolean` (default `false`; disables the trigger button and blocks opening the picker), `todayLabel: string` (default `'Hoje'`; text of the "today" button)
- Outputs: `valueChange` (emits `YYYY-MM` when a month is picked)

## How it works

- Inputs are signal inputs; `showPicker` and `pickerYear` are signals and `displayLabel` is a `computed`, so the view updates without zone.js. Internal members are `protected`.
- The trigger is a single button showing `displayLabel`; clicking it toggles `showPicker` and sets `pickerYear` from `value` (or current year if `value` is empty). `toggle()` is a no-op when `disabled` is `true`.
- The dropdown shows a year header (prev/next via chevron buttons, changing only `pickerYear`), a 4-column grid of `monthNames` buttons, and a "Hoje" button below the grid.
- Selecting a month emits `valueChange` with `${pickerYear}-MM` and closes the dropdown. `value` itself is never mutated internally — the parent owns it via `valueChange`.
- The "Hoje" button (`selectToday()`) sets `pickerYear` to the current year and calls `select()` with the current month, jumping straight to today regardless of what year is currently browsed.
- The `host` binding `(document:click)` closes the dropdown on any outside click; the dropdown's own click handler calls `stopPropagation()` so clicks inside it don't trigger this.
- `pickerYear` is only shown while the picker is open, so `toggle()` resyncs it from `value` on open and nothing reacts to `value` while open (browsing years isn't reset by an external `value` update). There is no `ngOnChanges`/`effect` for it.

## Gotchas

- `isSelected()` compares against `pickerYear`, not the current year — the highlighted month only matches `value` when `pickerYear === selectedYear`.
- The prev/next year chevrons are inline SVGs (no icon font dependency).
- `disabled` only guards `toggle()` (and the button's `disabled` attribute).
- `:host` is `display: inline-flex; width: 100%` — the component fills its container's width; the dropdown is absolutely positioned and centered under the trigger.
- Colors/spacing are controlled via `--ng-month-year-picker-*` CSS custom properties on `:host` (e.g. `--ng-month-year-picker-primary` for the selected month) — override them on the host element to theme the component.

## Dependencies

Peer deps: `@angular/core`/`common` `>=18 <23` (2.x; 1.x covered 14+). Uses only APIs available in Angular 18: no `linkedSignal`, `resource` or `ChangeDetectionStrategy.Eager`. No Bootstrap or icon font required.

## Build & test

```bash
ng build ng-month-year-picker
ng test ng-month-year-picker
```

Specs are zoneless and drive a host component through the DOM: Act → `await fixture.whenStable()` → Assert, no `detectChanges`.
