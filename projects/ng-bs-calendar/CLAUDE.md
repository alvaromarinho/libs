# ng-bs-calendar

Weekly (or single-day) scheduling calendar component for Angular + Bootstrap 5, using
dayjs for date handling.

## Structure

- `src/lib/ng-bs-calendar.component.ts` — standalone component, all logic
- `src/lib/ng-bs-calendar.component.html` / `.css` — template and styles
- `src/lib/ng-bs-calendar.module.ts` — `NgBsCalendarModule` wrapper for non-standalone consumers
- `src/public-api.ts` — exports `NgBsCalendarComponent`, `NgBsCalendarModule`, the `CalendarData` interface, and the `CalendarView` type

## Public API

- Selector: `ng-bs-calendar`
- Inputs: `data: CalendarData[]`, `loading: boolean`, `start: string ('yyyy-MM-dd')`, `showButtons: boolean`, `view: CalendarView` (`'week' | 'day'`, default `'week'`), `startHour`/`endHour: string ('HH:mm', default '00:00'/'24:00')` — trims the rendered hour rows to `[startHour, endHour)`, doesn't touch event placement (see Gotchas), `slotMinutes: number` (default `30`) — row granularity; must evenly divide 1440 (24h), common presets `10`/`15`/`20`/`30`/`60`, `breakHours: BreakHour[] = []` (`{ start, end }`, both `'HH:mm'`) — blocks a recurring time range (e.g. lunch) on every displayed day; each range validated independently, an invalid one is dropped (warned), the rest still applies
- Outputs: `changeWeek: { start, end }` (fires on navigation and whenever `view` toggles), `clickCell: CalendarData` (fires when a cell/event with data is clicked), `clickEmptyCell: { day, hour }` (fires when an empty hour-slot cell is clicked, via mouse or keyboard Enter/Space — `day` is the cell's `yyyy-MM-dd` label, `hour` is the `HH:mm` slot)
- `CalendarData`: `{ id, start, end, title, color, description? }` (start/end are ISO datetime strings; `description` is optional, shown in the event tooltip below the title)

## Core logic (`ng-bs-calendar.component.ts`)

- 2.x is signal-based: inputs are signal inputs and the grid is a chain of `computed` — `validSlotMinutes` → `slots` → `validStartHour`/`validEndHour`/`blockedSlots`/`hours`; `events` (sorted copies of `data` with `_size`); `schedule` = `buildSchedule(anchor() ?? defaultStart())`. `anchor` is a private signal set on init and by navigation/view toggles. There is no `ngOnChanges` and no `ChangeDetectorRef`. Template members are `protected`; `prevWeek`/`todayWeek`/`nextWeek` stay public. The only `effect` watches `view`: on a change after the first run it re-anchors (`onViewChange(previousView)`, using `visibleRange()` of the *previous* view, since `schedule()` already reflects the new one) and emits `changeWeek`, inside `untracked` (Angular 18 rejects signal writes in effects otherwise).
- `daysCount` (computed) resolves `view` to `1` (day) or `7` (week) — the single source of truth for how many columns `buildSchedule()`/`gridCols` build.
- `buildSchedule()` rebuilds `schedule.week` (`daysCount` days × `slots`) from `data`. It branches on `daysCount`: `week` keeps the isoWeek-aligned math (see Gotchas); `day` just walks `start ± 1 day`, no week alignment at all. Each event is placed into `day.hours[hour]` or `day.allDay[]` depending on whether it spans the whole day — this placement loop is agnostic to how many days are in `schedule.week`.
- `schedule.week`/`schedule.startWeek` field names are unchanged in day view — they hold 1 day instead of 7, not renamed to avoid churning the template/specs for a cosmetic gain.
- `overlaps()` detects same-day overlapping events so `_size` can be computed in `events` for side-by-side rendering of concurrent events.
- `getIndexPosition()` caches a stable column index per event `id` (via `positionCache`, a `WeakMap` keyed by the current `events()` array, so a new `data` starts a fresh cache) so an event doesn't visually jump columns between renders.
- Navigation (`prevWeek`/`todayWeek`/`nextWeek`) sets `anchor` (so `schedule` recomputes) and emits `changeWeek` by reading the resulting `schedule.week[0].label`/`schedule.week[last].label` directly (`emitChangeWeek()`) — single source of truth, no parallel boundary computation. In `view: 'day'` these step 1 day at a time (not 7) and `changeWeek` emits `start === end`.
- Every input except `start` is reactive after init (it's all `computed`); `start` is read once in `ngOnInit` (see Gotchas below). Toggling `view` (e.g. from a host's `BreakpointObserver`) rebuilds the schedule anchored on the currently visible first day and calls `emitChangeWeek()` too, so the host gets a fresh `{ start, end }` to (re)fetch `data` for the new range — don't drop that call, without it e.g. day→week can show a mostly-empty week if the host only ever fetched 1 day of data. A `data` change (e.g. `[data]="events$ | async"` resolving) recomputes `events` and `schedule` with the same `anchor`, but does **not** call `emitChangeWeek()` — the change came from a fetch the consumer already initiated, re-emitting would loop.
- Empty-cell clicks (the `clickEmptyCell` `@else` branch) also set `selectedEmptyCell` (`{ day, hour }`), and the template applies a `.cell-selected` border to the matching cell — a simple "last clicked" visual indicator, cleared only by clicking another empty cell (not reset on `data`/`view` changes).
- A Bootstrap `Tooltip` instance is created on `document.body` in the constructor (delegated via `[data-bs-toggle="tooltip"]`) and disposed in `ngOnDestroy`.
- The empty-cell click target (`clickEmptyCell`'s `@else` branch in the template) has `role="button"` + `tabindex="0"` + `(keydown.enter)`/`(keydown.space)` handlers, so it's actually keyboard-operable, not just screen-reader-labeled. `clickCell`'s event/badge targets aren't keyboard-operable yet (mouse-only, pre-existing) — keep that gap in mind if extending keyboard support further.
- `:host.cal-day-view` (via the `host` object) drives the CSS that lets a single day column fill the available width and drops the 60rem `min-width` that otherwise forces horizontal scroll in week view — without it, `view: 'day'` would still be squeezed/scrollable on mobile, defeating the point.
- `hours` is a `computed` that filters the full-day `slots` array down to `[startHour, endHour)`, prefixed with the same 2 `null`s the template indexes into for the month cell and the "Dia" row — those 2 are never filtered. `startHour`/`endHour` are validated by `validStartHour`/`validEndHour`: must be `'HH:mm'` matching an actual slot in `slots` (`endHour` also accepts `'24:00'` for "end of day"); an invalid value falls back to the default and logs a `console.warn` instead of silently mis-cutting the grid.
- `slots` (`computed`, `hours`' source array) is built by `buildHourSlots(validSlotMinutes())`. Valid `slotMinutes` must be a positive integer dividing 1440 (`24 * 60`) with no remainder — that's what guarantees every slot is the same size and the last one ends exactly at `24:00` (e.g. `17` is rejected: `1440 / 17` isn't integer); invalid falls back to `30` with a `console.warn`. Because `day.hours` in `buildSchedule()` is keyed off `slots`, changing `slotMinutes` after init recomputes the whole schedule. `startHour`/`endHour` are re-validated too on a `slotMinutes` change (they depend on `slots`) since a previously-valid boundary may no longer land on a slot (e.g. `startHour: '08:15'` was valid at 15min slots, isn't at 30min).
- `breakHours` blocks are expanded into `blockedSlots` (a `computed` `Set<string>`) against the current `slots` — so it re-expands on a `slotMinutes` change (a break boundary valid at one slot size may not land on a slot at another). A blocked slot with **no** event still renders (template `isBlocked(hour)` branch: a `.cell-blocked` div, no `role="button"`/click handlers, so `clickEmptyCell` never fires there) — but a blocked slot that already has an event in `day.hours` renders the event exactly as normal, blocking never hides real data, only suppresses new-event affordance on empty cells.
- The hours-column cell (`HOURS COLUMN` template branch) has `text-nowrap` — without it, a narrow mobile `col-1` wraps the `HH:mm` label onto two lines and breaks the grid's row alignment with the rest of that row.
- The header row (`.cal-header`, wrapping `<ng-content>` + the prev/today/next buttons in `.cal-header-buttons`) is `flex-wrap` with a `max-width: 768px` media query that stacks it (buttons go full-width, centered, below the projected content) — without the wrap, a wide `<ng-content>` (e.g. host filters/title) plus the 3 buttons overflow/squish sideways on mobile instead of stacking.

## Gotchas

- `start` is interpreted with `+1 day` offset before computing `startOf('isoWeek')` (dayjs `isoWeek` — via the `dayjs/plugin/isoWeek` plugin — is always Monday-start; the lib aligns to a Sunday-start display week). Don't "simplify" this offset without checking the rendered week boundaries — it's about Monday-vs-Sunday display, unrelated to which date library is used.
- `events` copies `data` (`null`/non-array → `[]`), sorts the copies and writes `_size` on them — the host's objects are never mutated. `schedule` always has days, even without `data`, so the template never sees an empty schedule.
- `positionCache` (backing `getIndexPosition`) is per `events()` array, so a stable per-`id` column position only holds within one `data` load, not across it — this avoids stale positions producing `marginLeft` past 100% when the same `id` reappears with a different `_size`.
- `getTooltipHtml()` escapes `data.title` before interpolating (tooltip is rendered via Bootstrap's `data-bs-html="true"`) — don't reintroduce raw interpolation there, it's an XSS vector since `title` is consumer-supplied.
- The Bootstrap `Tooltip` in the constructor is guarded by `isPlatformBrowser(platformId)` — needed for SSR/Angular Universal hosts, since it touches `document` directly.
- `start` is `input<string>()` with no default: unbound (or empty) means `defaultStart()` picks the Sunday of the current week, or today in `view: 'day'`. If the host binds `[start]` (even to a week-aligned value), that wins. It's read once in `ngOnInit` into `anchor`; later `[start]` changes are ignored (navigation owns the anchor). Pinned by the "start default" specs. `todayWeek()` (works the same in both views) still anchors on the actual current day at any point after init.
- The lib doesn't auto-switch `view` by viewport — that's intentional, left to the host (e.g. bind `[view]="isMobile() ? 'day' : 'week'"` from `BreakpointObserver`), so the lib stays free of viewport-detection logic/state.
- `buildSchedule()` still builds `day.hours` against the full unfiltered `slots`, independent of `startHour`/`endHour` — an event outside `[startHour, endHour)` gets placed in the dict same as any other, it just lands on a row `hours` no longer includes, so it renders nowhere and errors nowhere ("invisible", no indicator). Intentional/accepted for now (host is expected not to have events outside the displayed range); revisit if a host needs an "N events outside range" affordance.

## Dependencies

Peer deps: `@angular/core`/`common` `>=18 <23` (2.x; 1.x covered 14+), `bootstrap ^5`, `dayjs ^1.11`. Requires the `dayjs/plugin/isoWeek` plugin (bundled with dayjs, extended internally — consumer doesn't need to extend it themselves) and Bootstrap CSS/JS loaded by the host app (for tooltip styling/behavior).

## Build & test

```bash
ng build ng-bs-calendar
ng test ng-bs-calendar
```

Specs are zoneless: Act → `await fixture.whenStable()` → Assert, no `detectChanges`. Most read the `schedule()`/`hours()` computeds; the "through a host (DOM)" block drives a host component.
