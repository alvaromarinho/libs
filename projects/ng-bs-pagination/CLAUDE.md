# ng-bs-pagination

Configurable pagination component for Angular and Bootstrap 5.

## Structure

- `src/lib/ng-bs-pagination.component.ts` — `NgBsPaginationComponent` (logic + inputs/outputs)
- `src/lib/ng-bs-pagination.component.html` — template (Bootstrap `pagination` markup)
- `src/lib/ng-bs-pagination.model.ts` — `PaginationLayout`, `PaginationPrevNext`, `PaginationFirstLast`, `PaginationInfoContext` types and their `DEFAULT_*` constants
- `src/lib/ng-bs-pagination.module.ts` — `NgBsPaginationModule` wrapper
- `src/public-api.ts` — exports component, module, and model types

## Public API

- Selector: `ng-bs-pagination`
- Inputs: `total`, `current` (1-based, controlled by parent), `itemPerPage` (default 10), `maxPagesToShow` (default 5), `size: 'sm'|'md'|'lg'`, `layout: PaginationLayout`, `prevNext: PaginationPrevNext`, `firstLast: PaginationFirstLast`
- Outputs: `change` (page number from clicking a page/prev/next), `first`, `last` (emitted by the first/last buttons)
- Content projection: a single `<ng-template let-start let-end let-total let-current let-totalPages>` can be passed to customize the "Mostrando X–Y de Z" info block (`PaginationInfoContext`), picked up via `@ContentChild(TemplateRef) infoTemplate`

## How it works

- `current` is **one-way**: the component never mutates it. Clicking a page/prev/next/first/last only emits (`change`/`first`/`last`); the parent must update `current` itself.
- `layout`, `prevNext`, and `firstLast` are exposed as input setters that shallow-merge the incoming value (and nested `labels`) onto `DEFAULT_LAYOUT`/`DEFAULT_PREV_NEXT`/`DEFAULT_FIRST_LAST`, so consumers only need to override the keys they care about.
- `pages` getter computes a sliding window of page numbers of size `maxPagesToShow`, centered on `current` and clamped to `[1, totalPages]`.
- `wrapperClasses` builds the Bootstrap flex classes from `layout.type` (`split`/`center`/`stacked`) and `layout.infoPosition`.
- The whole component renders nothing (`totalPages <= 1` hides everything).

## Gotchas

- `goTo`/`goFirst`/`goLast` no-op (don't emit) if the target page is out of range or equal to `current` — callers don't need to guard against redundant updates.
- `prevNext.mode`/`firstLast.mode` only affect `aria-hidden` on the label span (for `icon` mode); the actual label characters/text still come from `labels`, so swapping `mode` to `'text'` requires also passing custom `labels`.

## Dependencies

Peer deps: `@angular/core`/`common` `>=14 <23`, `bootstrap ^5`. Requires Bootstrap CSS in the host app (uses `.pagination`, `.page-item`, `.page-link` classes).

## Build & test

```bash
ng build ng-bs-pagination
ng test ng-bs-pagination
```
