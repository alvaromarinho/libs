# ng-bs-toast-service

Service-driven toast/notification system for Angular + Bootstrap 5.

## Structure

- `src/lib/ng-bs-toast-service.service.ts` — `NgBsToastService`, the public API (`send`/`listen`) and `ToastMessage` interface
- `src/lib/ng-bs-toast-service.component.ts` — `NgBsToastServiceComponent`, host component that renders the toast container/stack
- `src/lib/ng-bs-toast-service.module.ts` — `NgBsToastServiceModule`
- `src/public-api.ts` — exports service, component, module

## How it works

- `NgBsToastService` is a thin `Subject<ToastMessage>` wrapper. `send(title, message, style?, duration?)` emits; it holds no state.
- Consumers must mount `<ng-bs-toast-service>` once (e.g. in the root app component) — same singleton-host pattern as `ng-bs-modal-service`. Calling `send()` from anywhere displays a toast in that container.
- `ToastMessage`: `{ title, message, style?: 'success'|'warning'|'danger'|'primary', duration? (ms, default 5000) }`.
- Each emitted message becomes a `ToastData` (adds `id`, `instance`) pushed to `toastData[]` and rendered via `*ngFor`.
- `initializeToast()` retries (up to 10 attempts, exponential backoff 0/10/20/40/80...ms capped at 100ms) to find the toast's DOM element by `toast_${id}` before constructing the Bootstrap `Toast` instance — needed because the element doesn't exist synchronously after `cdr.detectChanges()` in some change-detection timings.
- On `hidden.bs.toast`, `removeToast()` disposes the Bootstrap instance and splices it out of `toastData`.

## Gotchas

- Only **one** `NgBsToastServiceComponent` should exist in the app.
- If `initializeToast` exhausts its 10 attempts without finding the element, it logs an error and the toast is silently never shown/auto-removed (stays in `toastData` indefinitely) — keep this in mind if toasts seem to "disappear" without animating.
- Disposal errors (`instance.dispose()`) are intentionally swallowed in both `ngOnDestroy` and `removeToast` — element may already be gone from the DOM by the time dispose runs.

## Dependencies

Peer deps: `@angular/core`/`common` `>=14 <23`, `bootstrap ^5`, `bootstrap-icons ^1`. Requires Bootstrap CSS/JS and Bootstrap Icons in the host app.

## Build & test

```bash
ng build ng-bs-toast-service
ng test ng-bs-toast-service
```
