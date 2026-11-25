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
- State that the template reads is in signals (`modalData`, `currentImgIndex`); the queue and Bootstrap instances are plain private fields. `setModalData()` sets the signals and then calls `changeDetectorRef.detectChanges()` because Bootstrap needs the modal element in the DOM synchronously. Template members are `protected`; there is no `CommonModule` (`[class]`/`[class.x]` and `NgTemplateOutlet`).
- **Queueing**: if `open()` is called while a modal is showing, the new modal is queued (`modalQueue`). The current modal is hidden first; on `hidden.bs.modal` the queued one is shown. `closeAll` empties the queue and calls `notifyClosed()` on every queued modal (including ones never shown), so no caller's `open()` Observable is left dangling.
- **Carousel**: `options.carousel = { index, images }` renders a Bootstrap carousel inside the modal; arrow keys are wired via `setCarouselEvents()`/`cleanCarouselEvents()`.
- **Popover positioning**: `options.popoverTo: HTMLElement` repositions the modal dialog next to that element (`createPopoverStyle()`), computing left/right/top/bottom placement from `getBoundingClientRect()` and toggling an arrow via CSS custom properties (`--arrow-left`). `removePopoverStyle()` resets all inline styles when not in popover mode.

## Public API (`NgBsModalServiceOptions`)

`disabledBodyScroll`, `size: 'sm'|'lg'|'xl'`, `staticBackdrop`, `withoutClose`, `popoverTo`, `carousel: { index, images }`, `customClass: { modal, modalHeader, modalBody, modalFooter }`.

## Gotchas

- Only **one** `NgBsModalServiceComponent` should exist in the app — it's a singleton-by-convention host, not enforced in code. Multiple instances would each subscribe to the same service stream and fight over `document` listeners.
- `ngOnInit` attaches global `document` listeners for `shown.bs.modal`/`hidden.bs.modal` and removes the same function references in a `DestroyRef.onDestroy` callback.
- `setModalData()` uses `setTimeout(..., 0)` to read the backdrop element after Bootstrap creates it — required because the backdrop DOM node doesn't exist synchronously when `modal.show()` is called.
- Modal content is wrapped in `@for (current of [data]; track current)` (`data` is `modalData()`): each `open()` creates a new `modalData` object, so the body view (and any component inside a `TemplateRef`) is recreated and runs `ngOnInit` again — `ngTemplateOutlet` alone would reuse the view when the same `TemplateRef` is reopened. Only one modal is rendered at a time, so a modal coming back from the queue is also recreated (the old "keeps state" note only held when the top modal never rendered).
- Popover width is `min(modalWidth, innerWidth - 16)` and `left` is clamped to an 8px gutter, so on narrow (mobile) viewports it never overflows; the arrow follows the anchor via `--arrow-left`.
- IDs (`modalId`, `carouselId`) are random per component instance — fine for a singleton, but don't assume stable IDs across instances/SSR.

## Dependencies

Peer deps: `@angular/core`/`common` `>=18 <23` (2.x; 1.x covered 14+), `bootstrap ^5`. Requires Bootstrap CSS/JS in the host app.

## Build & test

```bash
ng build ng-bs-modal-service
ng test ng-bs-modal-service
```

Specs are zoneless and drive a host component through the DOM: Act → `await fixture.whenStable()` → Assert, no `detectChanges`. `bootstrap` is mocked: `show()`/`hide()` fire `shown.bs.modal`/`hidden.bs.modal` at once, bubbling. The template is published as a string and compiled by the consumer, so it must use only Angular 18.0 syntax (no `@let`).
