# ng-collapse

Smooth collapse/expand wrapper component for Angular, animated via `max-height` CSS transitions (no Bootstrap dependency).

## Structure

- `src/lib/ng-collapse.component.ts` — entire component (inline template/styles, single file)
- `src/lib/ng-collapse.module.ts` — `NgCollapseModule` wrapper
- `src/public-api.ts` — exports `NgCollapseComponent`, `NgCollapseModule`

## Public API

- Selector: `ng-collapse`
- Inputs: `toggle: boolean` (controls expand/collapse, two-way driven by parent), `transitionDuration: number` (ms, default 500 — must match the CSS `.ng-collapse.show` transition duration)
- Content is projected via `<ng-content>`.

## How it works

- The component measures `collapseContainer.nativeElement.scrollHeight` (`calculateHeight()`) and animates `max-height` from `0` to that value (and back) on `[toggle]` changes.
- `updateCollapse()` runs a multi-step `setTimeout` sequence on expand: reset → set `isExpanded=true` (triggers CSS transition start) → next tick, set `maxHeightValue` to the measured height → after `transitionDuration`, set `showOverflow=true` (switches `overflow: hidden` → `visible` so dropdowns/tooltips inside the content aren't clipped post-animation). Collapse runs the inverse with a fixed 300ms before fully hiding (`isExpanded=false`).
- A `ResizeObserver` on the container recalculates `maxHeightValue` while expanded+overflow-visible, so dynamically-growing content (e.g. an accordion item whose content changes) doesn't get clipped.
- State (`isExpanded`, `showOverflow`, `maxHeightValue`) is in signals, so the view updates without zone.js. An `effect` reacts to `toggle` changes after the view is ready (`untracked` around the writes, which Angular 18 would otherwise reject without `allowSignalWrites`).
- `ngAfterViewInit`: if `toggle` starts `true`, the component initializes already-expanded **without** animating (sets `isExpanded`/`showOverflow`/`maxHeightValue` directly).

## Gotchas

- The `300ms` hardcoded delay before fully collapsing (`isExpanded = false`) is independent of `transitionDuration` — if you change the CSS collapse transition timing, this constant must be updated too (the CSS only defines a 0.3s collapse vs 0.5s expand transition).
- The `effect` only animates when `toggle` differs from `appliedToggle` (set in `ngAfterViewInit`) — initial state is handled entirely in `ngAfterViewInit`, and in Angular 18, where the effect's first run comes after it, a `true` start doesn't re-animate.
- All timers are tracked in `timers` and cleared in `clearTimer()`/`ngOnDestroy` to avoid stale callbacks firing after rapid toggle changes or component destruction.

## Dependencies

Peer deps only: `@angular/core`/`common` `>=18 <23` (2.x; 1.x covered 14+). Uses only APIs available in Angular 18: no `linkedSignal`, `resource` or `ChangeDetectionStrategy.Eager`. No Bootstrap, no third-party libs.

## Build & test

```bash
ng build ng-collapse
ng test ng-collapse
```

Specs are zoneless: Act → `await fixture.whenStable()` → Assert, no `detectChanges`. Fake timers fake only `setTimeout`/`clearTimeout`, so the real `requestAnimationFrame` lets the zoneless scheduler render.
