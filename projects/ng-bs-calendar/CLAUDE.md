# ng-bs-calendar

Weekly scheduling calendar component for Angular + Bootstrap 5, using Luxon for date handling.

## Structure

- `src/lib/ng-bs-calendar.component.ts` — standalone component, all logic
- `src/lib/ng-bs-calendar.component.html` / `.css` — template and styles
- `src/lib/ng-bs-calendar.module.ts` — `NgBsCalendarModule` wrapper for non-standalone consumers
- `src/public-api.ts` — exports `NgBsCalendarComponent`, `NgBsCalendarModule`, and the `CalendarData` interface

## Public API

- Selector: `ng-bs-calendar`
- Inputs: `data: CalendarData[]`, `loading: boolean`, `start: string ('yyyy-MM-dd')`, `showButtons: boolean`
- Outputs: `changeWeek: { start, end }`, `clickCell: CalendarData`
- `CalendarData`: `{ id, start, end, title, color }` (start/end are ISO datetime strings)

## Core logic (`ng-bs-calendar.component.ts`)

- `setSchedule()` rebuilds `schedule.week` (7 days × 30-minute slots from `hours30min`) from `data` for the week containing `start`. Each event is placed into `day.hours[hour]` or `day.allDay[]` depending on whether it spans the whole day.
- `overlaps()` detects same-day overlapping events so `_size` can be computed in `ngOnInit` for side-by-side rendering of concurrent events.
- `getIndexPosition()` caches a stable column index per event `id` (via `positionCache`) so an event doesn't visually jump columns between renders.
- Week navigation (`prevWeek`/`todayWeek`/`nextWeek`) recomputes `schedule` and emits `changeWeek` with the new `{ start, end }` range — the consumer is expected to fetch data for that range and update `data`.
- A Bootstrap `Tooltip` instance is created on `document.body` in the constructor (delegated via `[data-bs-toggle="tooltip"]`) and disposed in `ngOnDestroy`.

## Gotchas

- `start` is interpreted with `+1 day` offset before computing `startOf('week')` (Luxon weeks start Monday; the lib aligns to a Sunday-start display week). Don't "simplify" this offset without checking the rendered week boundaries.
- `data` is sorted and mutated (`_size` added) in `ngOnInit` only — changes to `data` after init won't recompute overlap sizing unless the component re-inits.
- There's a commented-out debug block in `overlaps()` (around line 197) — leftover from overlap-logic debugging, safe to ignore/remove if touching this method.

## Dependencies

Peer deps: `@angular/core`/`common` `>=14 <23`, `bootstrap ^5`, `luxon ^3`. Requires Bootstrap CSS/JS loaded by the host app (for tooltip styling/behavior).

## Build & test

```bash
ng build ng-bs-calendar
ng test ng-bs-calendar
```
