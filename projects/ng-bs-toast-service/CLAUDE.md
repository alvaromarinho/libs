# ng-bs-toast-service

Service-driven toast/notification system for Angular + Bootstrap 5.

## Structure

- `src/lib/ng-bs-toast-service.service.ts` — `NgBsToastService`, the public API (`send`/`dismiss`/`dismissAll`/`listen`) and `ToastMessage`/`ToastStyle`/`ToastTheme`/`ToastPosition` types
- `src/lib/ng-bs-toast-service.component.ts` — `NgBsToastServiceComponent`, host component that renders the toast containers/stacks
- `src/lib/ng-bs-toast-service.module.ts` — `NgBsToastServiceModule`
- `src/public-api.ts` — exports service, component, module

## How it works

- `NgBsToastService.send(title, message, style?, duration?, options?)` emits a `ToastMessage` on a `ReplaySubject<InternalToastMessage>(1)` (see Gotchas) and returns an `Observable<void>` that completes when that specific toast closes — resolved via an internal `Map<id, Subject<void>>` and `notifyClosed(id)`, called by the component.
- `style?: ToastStyle` — all 8 Bootstrap colors: `primary secondary success danger warning info light dark`.
- `duration?: number` — when omitted, resolved by `resolveToastDuration(style)`: `warning` 7000ms, `danger` 10000ms, everything else 4000ms. Explicit `duration` always wins.
- `options?.theme: ToastTheme` (default: the component's `@Input() theme`, itself defaulting to `'bootstrap'`) — independent from `style`, only 2 values:
  - `'bootstrap'` — solid `text-bg-{style}` toast (bootstrap's built-in contrast-computed text color, no dark-mode awareness — `text-bg-*` is static CSS, doesn't respond to `data-bs-theme`). Progress bar is a translucent white/black overlay, **not** `bg-{style}` — that would be the same color as the background and invisible (`progressBarStyle()` picks the contrasting side using the same `DARK_BG_STYLES` set as the close button).
  - `'bootstrap-dark'` — sets `data-bs-theme="dark"` on the toast and reuses the exact color pairing bootstrap's own `.alert-{style}` uses: `bg-{style}-subtle` / `text-{style}-emphasis` / `border border-{style}-subtle`. All three vars are dark-mode aware, so this is genuinely bootstrap's dark mode, not a hand-picked palette. Progress bar uses `var(--bs-{style}-text-emphasis)` inline (`progressBarStyle()`) — bootstrap already tunes that color to stay legible against `*-bg-subtle`, including for style `'dark'`, where a plain `bg-dark` bar would be nearly invisible dark-on-dark.
- `options?.position: ToastPosition` (default `'top-end'`) — 7 bootstrap-documented positions (`top/middle/bottom` × `start/center/end`, minus `middle-start`/`middle-end`). Component renders one `.toast-container` per position actually in use.
- `dismiss(id)` / `dismissAll()` — component listens via `listenDismiss()`/`listenDismissAll()` and calls `.hide()` on the matching Bootstrap `Toast` instance (or, if still queued, splices it out and calls `notifyClosed` directly).

## Component internals

- `@Input() maxToastsPerPosition = 5` — toasts beyond this count for a given position wait in `pendingQueue` (a `Map<ToastPosition, ToastData[]>`); `dequeueNext()` shows the next queued one whenever a visible toast closes.
- Toasts are built with `new Toast(element, { autohide: false })` — auto-hide is **not** delegated to Bootstrap. Instead the component runs its own `setTimeout(() => instance.hide(), remainingMs)` per toast, which is what makes pause-on-hover possible (`pauseToast`/`resumeToast` clear/reschedule that timer and track `remainingMs`).
- The countdown progress bar is pure CSS (`--toast-duration` custom property + `animation-duration`), paused via `[data-paused="true"] { animation-play-state: paused }` in lockstep with the JS timer.
- `initializeToast()` retries (up to 10 attempts, exponential backoff 0/10/20/40/80...ms capped at 100ms) to find the toast's DOM element by `toast_${id}` before constructing the Bootstrap `Toast` instance — needed because the element doesn't exist synchronously after `cdr.detectChanges()` in some change-detection timings.
- On `hidden.bs.toast`, `removeToast()` clears the timer, disposes the Bootstrap instance, splices it out of `toastData`, calls `toastService.notifyClosed(id)`, and dequeues the next pending toast for that position.
- `role`/`aria-live` are per-severity: `danger`/`warning` get `role="alert" aria-live="assertive"`; everything else gets `role="status" aria-live="polite"` (bootstrap's own accessibility recommendation).

## Gotchas

- Only **one** `NgBsToastServiceComponent` should exist in the app.
- `NgBsToastService`'s stream is a `ReplaySubject(1)`, not a plain `Subject` — a toast fired before the component finishes subscribing (e.g. an app-initializer racing `ngOnInit`) is still delivered. This *does* mean a second `NgBsToastServiceComponent` mounted later would immediately replay the last-sent toast — stick to the single-instance rule above.
- If `initializeToast` exhausts its 10 attempts without finding the element, it logs an error and the toast is silently never shown/auto-removed (stays in `toastData` indefinitely).
- Disposal errors (`instance.dispose()`) are intentionally swallowed in `ngOnDestroy`, `removeToast`, and pending-queue cleanup — element may already be gone from the DOM.
- `bg-{style}-subtle`/`text-{style}-emphasis`/`data-bs-theme` dark-mode CSS vars require **Bootstrap ≥5.3** even though the peer dep is pinned `^5.0.0` — on Bootstrap 5.0–5.2 the `'custom'`/`'bootstrap-dark'` themes will render but without the dark-mode color adaptation (falls back to light-mode subtle/emphasis colors). Installed dev dependency is 5.3.3.
- Mobile (`<576px`) forces every position's container to `top:0` full-width via CSS `!important`, regardless of the configured `position` — this is intentional per spec, not a bug if a `bottom-end` toast appears at the top on a phone.

## Dependencies

Peer deps: `@angular/core`/`common` `>=14 <23`, `bootstrap ^5`, `bootstrap-icons ^1`. Requires Bootstrap CSS/JS and Bootstrap Icons in the host app.

## Build & test

```bash
ng build ng-bs-toast-service
ng test ng-bs-toast-service
```
