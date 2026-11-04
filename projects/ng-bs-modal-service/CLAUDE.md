# ng-bs-modal-service

Service-driven modal/dialog system for Angular + Bootstrap 5, with a queue, image carousel, and "popover" positioning mode.

## Structure

- `src/lib/ng-bs-modal-service.service.ts` — `NgBsModalService`, the public API consumers call (`open`/`close`/`closeAll`)
- `src/lib/ng-bs-modal-service.component.ts` — `NgBsModalServiceComponent`, a single host component that must be placed once in the app and renders whatever modal is currently active
- `src/lib/ng-bs-modal-service.model.ts` — `NgBsModalServiceData`, `NgBsModalServiceContent`, `NgBsModalServiceOptions`
- `src/lib/ng-bs-modal-service.module.ts` — `NgBsModalServiceModule` (registers component + provides the service)
- `src/public-api.ts` — exports service, component, module, and model types

## How it works

- `NgBsModalService` is a thin `Subject<NgBsModalServiceData>` wrapper (`open`/`close`/`closeAll` just emit actions). It holds **no state** — all state (queue, current modal, Bootstrap `Modal`/`Carousel` instances) lives in `NgBsModalServiceComponent`.
- Consumers must mount `<ng-bs-modal-service>` once (e.g. in the root app component). Calling `open()` from anywhere injects content into that single instance.
- `open()` returns an `Observable<void>` — a `Subject<void>` (`NgBsModalServiceData.closed`) created per-call, threaded through to the component and completed by `closeModal()`'s `notifyClosed()` however the modal actually closes (X, backdrop, ESC, `close()`, or `closeAll()`).
- `content` can be a plain object (`NgBsModalServiceContent` with header/body/footer as strings or `TemplateRef`) or a raw `TemplateRef` for a fully custom modal body.
- **Queueing**: if `open()` is called while a modal is showing, the new modal is queued (`modalQueue`). The current modal is hidden first; on `hidden.bs.modal` the queued one is shown. `closeAll` empties the queue and calls `notifyClosed()` on every queued modal (including ones never shown), so no caller's `open()` Observable is left dangling.
- **Carousel**: `options.carousel = { index, images }` renders a Bootstrap carousel inside the modal; arrow keys are wired via `setCarouselEvents()`/`cleanCarouselEvents()`.
- **Popover positioning**: `options.popoverTo: HTMLElement` repositions the modal dialog next to that element (`createPopoverStyle()`), computing left/right/top/bottom placement from `getBoundingClientRect()` and toggling an arrow via CSS custom properties (`--arrow-left`). `removePopoverStyle()` resets all inline styles when not in popover mode.

## Public API (`NgBsModalServiceOptions`)

`disabledBodyScroll`, `size: 'sm'|'lg'|'xl'`, `staticBackdrop`, `withoutClose`, `popoverTo`, `carousel: { index, images }`, `customClass: { modal, modalHeader, modalBody, modalFooter }`.

## Gotchas

- Only **one** `NgBsModalServiceComponent` should exist in the app — it's a singleton-by-convention host, not enforced in code. Multiple instances would each subscribe to the same service stream and fight over `document` listeners.
- `ngOnInit` attaches global `document` listeners for `shown.bs.modal`/`hidden.bs.modal` — these are bound functions stored (`boundShownHandler`/`boundHiddenHandler`) specifically so `ngOnDestroy` can remove the exact same reference.
- `setModalData()` uses `setTimeout(..., 0)` to read the backdrop element after Bootstrap creates it — required because the backdrop DOM node doesn't exist synchronously when `modal.show()` is called.
- Modal content is wrapped in `@for (current of [modalData]; track current)`: each `open()` creates a new `modalData` object, so the body view (and any component inside a `TemplateRef`) is recreated and runs `ngOnInit` again — `ngTemplateOutlet` alone would reuse the view when the same `TemplateRef` is reopened. A modal coming back from the queue is the same object, so its state is kept.
- Popover width is `min(modalWidth, innerWidth - 16)` and `left` is clamped to an 8px gutter, so on narrow (mobile) viewports it never overflows; the arrow follows the anchor via `--arrow-left`.
- IDs (`modalId`, `carouselId`) are random per component instance — fine for a singleton, but don't assume stable IDs across instances/SSR.

## Dependencies

Peer deps: `@angular/core`/`common` `>=14 <23`, `bootstrap ^5`. Requires Bootstrap CSS/JS in the host app.

## Build & test

```bash
ng build ng-bs-modal-service
ng test ng-bs-modal-service
```
