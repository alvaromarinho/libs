# ng-bs-toast-service

Service-driven toast/notification system for Angular + Bootstrap 5.

## Structure

- `src/lib/ng-bs-toast-service.service.ts` — `NgBsToastService`, the public API (`send`/`dismiss`/`dismissAll`/`listen`) and `ToastMessage`/`ToastStyle`/`ToastTheme`/`ToastPosition` types
- `src/lib/ng-bs-toast-service.component.ts` — `NgBsToastServiceComponent`, host component that renders the toast containers/stacks
- `src/lib/ng-bs-toast-service.module.ts` — `NgBsToastServiceModule`
- `src/public-api.ts` — exports service, component, module

## How it works

- `NgBsToastService.send(title, message, style?, duration?, options?)` emits a `ToastMessage` to the listening component, or buffers it while none listens (see Gotchas), and returns an `Observable<void>` that completes when that specific toast closes — resolved via an internal `Map<id, Subject<void>>` and `notifyClosed(id)`, called by the component.
- `style?: ToastStyle` — all 8 Bootstrap colors: `primary secondary success danger warning info light dark`.
- `duration?: number` — when omitted, resolved by `resolveToastDuration(style)`: `warning` 7000ms, `danger` 10000ms, everything else 4000ms. Explicit `duration` always wins.
- `options?.theme: ToastTheme` (default: the component's `theme` input, itself defaulting to `'bootstrap'`) — independent from `style`, only 2 values:
  - `'bootstrap'` — solid `text-bg-{style}` toast (bootstrap's built-in contrast-computed text color, no dark-mode awareness — `text-bg-*` is static CSS, doesn't respond to `data-bs-theme`). Progress bar is a translucent white/black overlay, **not** `bg-{style}` — that would be the same color as the background and invisible (`progressStyle()` picks the contrasting side using the same `DARK_BG_STYLES` set as the close button).
  - `'bootstrap-dark'` — sets `data-bs-theme="dark"` on the toast and reuses the exact color pairing bootstrap's own `.alert-{style}` uses: `bg-{style}-subtle` / `text-{style}-emphasis` / `border border-{style}-subtle`. All three vars are dark-mode aware, so this is genuinely bootstrap's dark mode, not a hand-picked palette. Progress bar uses `var(--bs-{style}-text-emphasis)` inline (`progressStyle()`) — bootstrap already tunes that color to stay legible against `*-bg-subtle`, including for style `'dark'`, where a plain `bg-dark` bar would be nearly invisible dark-on-dark.
- `options?.position: ToastPosition` (default `'top-end'`) — 7 bootstrap-documented positions (`top/middle/bottom` × `start/center/end`, minus `middle-start`/`middle-end`). Component renders one `.toast-container` per position actually in use.
- `dismiss(id)` / `dismissAll()` — component listens via `listenDismiss()`/`listenDismissAll()` and calls `.hide()` on the matching Bootstrap `Toast` instance (or, if still queued, splices it out and calls `notifyClosed` directly).

## Component internals

- State is in signals: `toasts` (list, replaced on every add/remove) and a `paused` signal per toast; `positions` is a `computed` of the positions in use. View classes/styles are computed once per toast in `addToast()`. Inputs are signal inputs and template members are `protected`, so the view updates without zone.js.
- `maxToastsPerPosition` input (default 5) — toasts beyond this count for a given position wait in `pendingQueue` (a `Map<ToastPosition, ToastData[]>`); `dequeueNext()` shows the next queued one whenever a visible toast closes.
- Toasts are built with `new Toast(element, { autohide: false })` — auto-hide is **not** delegated to Bootstrap. Instead the component runs its own `setTimeout(() => instance.hide(), remainingMs)` per toast, which is what makes pause-on-hover possible (`pauseToast`/`resumeToast` clear/reschedule that timer and track `remainingMs`).
- The countdown progress bar is pure CSS (`--toast-duration` custom property + `animation-duration`), paused via `[data-paused="true"] { animation-play-state: paused }` in lockstep with the JS timer.
- `showToast()` adds the toast to `toasts` and registers `afterNextRender` to run `initializeToast()`, which finds the element by `toast_${id}` and constructs the Bootstrap `Toast` instance. No polling and no `ChangeDetectorRef`.
- On `hidden.bs.toast`, `removeToast()` clears the timer, disposes the Bootstrap instance, removes it from `toasts`, calls `toastService.notifyClosed(id)`, and dequeues the next pending toast for that position.
- `role`/`aria-live` are per-severity: `danger`/`warning` get `role="alert" aria-live="assertive"`; everything else gets `role="status" aria-live="polite"` (bootstrap's own accessibility recommendation).

## Gotchas

- Only **one** `NgBsToastServiceComponent` should exist in the app.
- `NgBsToastService` buffers toasts sent while no component listens (e.g. an app-initializer racing `ngOnInit`, or between a destroy and a new instance) and hands all of them, once and in order, to the next `listen()` subscriber. The buffer keeps the newest 20 (`BUFFER_LIMIT`); a dropped toast gets `notifyClosed`, so its `send()` Observable completes. `listen()` is a `defer` that counts listeners; `finalize` comes from `rxjs/operators` so rxjs 6 still works.
- Disposal errors (`instance.dispose()`) are intentionally swallowed in `disposeToast()` (used by `removeToast` and on destroy) — element may already be gone from the DOM.
- `bg-{style}-subtle`/`text-{style}-emphasis`/`data-bs-theme` dark-mode CSS vars require **Bootstrap ≥5.3** even though the peer dep is pinned `^5.0.0` — on Bootstrap 5.0–5.2 the `'bootstrap-dark'` theme will render but without the dark-mode color adaptation (falls back to light-mode subtle/emphasis colors). Installed dev dependency is 5.3.3.
- Mobile (`<576px`) forces every position's container to `top:0` full-width via CSS `!important`, regardless of the configured `position` — this is intentional per spec, not a bug if a `bottom-end` toast appears at the top on a phone.

## Dependencies

Peer deps: `@angular/core`/`common` `>=18 <23` (2.x; 1.x covered 14+), `bootstrap ^5`, `bootstrap-icons ^1`. Requires Bootstrap CSS/JS and Bootstrap Icons in the host app.

## Build & test

```bash
ng build ng-bs-toast-service
ng test ng-bs-toast-service
```

Specs are zoneless and drive a host component through the DOM: Act → `await fixture.whenStable()` → Assert, no `detectChanges`. `bootstrap` is mocked (`hide()` fires `hidden.bs.toast` at once). Fake timers fake only `setTimeout`/`clearTimeout`/`Date` (`advanceTimersByTimeAsync` + `whenStable`), so the real `requestAnimationFrame` lets the zoneless scheduler render.
