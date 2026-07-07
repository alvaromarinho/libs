# ng-generate-table

Dynamic, column-config-driven table component for Angular with sorting, custom cell templates/pipes, and a mobile card view.

## Structure

- `src/lib/ng-generate-table.component.ts` — `NgGenerateTableComponent<T>`, all table logic
- `src/lib/ng-generate-table.component.html` / `.css` — template (desktop table + mobile card layout) and styles
- `src/lib/dynamic.pipe.ts` — `DynamicPipe` (`dynamicPipe`), applies an arbitrary injectable pipe class to a value at runtime
- `src/lib/safeHtml.pipe.ts` — `SafeHtmlPipe` (`safeHtml`), sanitizes/bypasses HTML or resource URLs via `DomSanitizer`
- `src/lib/ng-generate-table.module.ts` — `NgGenerateTableModule`
- `src/public-api.ts` — exports component, module, and both pipes

## Public API

- Selector: `ng-generate-table` (generic `<T>`)
- Inputs: `data: T[]`, `columns: NgGenerateTableColumns<T>[]`, `tableClass?`, `loading`, `mobileView`, `rowClickable`, `config: { emptyMessage, loadingMessage }` (also settable individually via `emptyMessage`/`loadingMessage` input setters), `expandedRows: Set<any>`, `expandableRow?: (row, index) => boolean`
- Outputs: `rowClick: { row, event }`, `cellClick: { row, column, event }`, `sortChange: { field, direction: 'ASC'|'DESC'|null }`, `expandedRowsChange: Set<any>`
- `ContentChild('cardMobile')`: optional template for custom mobile card rendering (context: `{ $implicit, rowData, index, expanded }`)
- `ContentChild('rowDetail')`: optional template rendered as a collapsible row/section below expandable data rows (context: `{ $implicit, rowData, index }`)
- `NgGenerateTableColumns<T>`: `label?`, `field?: keyof T`, `thClass?`/`tdClass?`, `pipe?`/`pipeArgs?`, `width?`, `align?`, `sortable?`, `isAction?`, `template?: (row) => string` (raw HTML, rendered via `safeHtml`), `click?: (row, event) => void`

## How it works

- Sorting is **not** applied to `data` by the component — `onSortClick()` cycles `ASC → DESC → null` per column and only emits `sortChange`; the consumer is responsible for re-sorting/re-fetching `data`.
- `getCellValue()` returns `null` for missing `field` or `null`/`undefined` values; `DynamicPipe` passes `null`/`undefined` through untouched (doesn't invoke the underlying pipe — avoids errors from pipes like `DatePipe` on `null`); the template falls back to `'---'` only after the pipe runs (`(getCellValue(...) | dynamicPipe:...) ?? '---'`).
- Column rendering order (see template): the expand toggle (only in the first column, when applicable) renders first inside the cell, followed by `template` (HTML string, sanitized via `SafeHtmlPipe`) > `pipe` (applied via `DynamicPipe`, which instantiates the pipe class through Angular's injector) > raw `field` value.
- `onCellClick` calls `event.stopPropagation()` before emitting, and `onColumnClick` (for column-level `click` handlers) does the same — both prevent triggering `rowClick` on the same interaction.
- `validateInputs()` (in `ngOnInit`) only `console.warn`s on missing `columns`, missing `field`/`template`/`isAction`, or `sortable` without `field` — these are non-fatal warnings, not errors.
- `trackByData` uses `row.id` if present, falling back to index — also used as the key for `expandedRows`.

## Expand/collapse rows

- Projecting a `#rowDetail` template enables expand/collapse for the whole table — there's no per-column flag for this. The toggle button always renders inside the **first column's** cell (desktop: prepended inside the `<td>`; mobile: absolute-positioned button on the card).
- `hasExpandToggle()` returns true only if `#rowDetail` is projected; `canExpandRow(row, index)` additionally checks the optional `expandableRow` input — if a row fails this check, no toggle and no detail row are rendered for it, but the first column renders a `.nggt-expand-spacer` (same size as the toggle, `visibility: hidden`) so columns stay aligned across rows.
- Clicking the toggle calls `toggleRowExpand()`, which toggles the row's key in `expandedRows` and emits the **new** `Set` via `expandedRowsChange` — state is fully owned by the consumer (`[(expandedRows)]` works via the matching input/output names).
- **Detail row** (`#rowDetail`): for rows where `canExpandRow()` is true, an extra row/section is always in the DOM (even collapsed) and animated open/closed via the `.nggt-show` class — see Gotchas for why.
- Desktop and mobile `@for` loops alias `let rowIndex = $index` (outer, data) / `let colIndex = $index` (inner, columns) to avoid `$index` shadowing — `rowIndex` must be used for `canExpandRow`/`isRowExpanded`/`toggleRowExpand`, `colIndex` for the first-column check.

## Gotchas

- `DynamicPipe.transform` creates a child `Injector` per call to instantiate the pipe class — this works for stateless/simple pipes but means the pipe instance isn't cached/reused across renders; avoid expensive constructors in pipes passed via `pipe`.
- `template` strings go through `SafeHtmlPipe` with Angular's `SecurityContext.HTML` sanitizer by default — script tags and dangerous attributes will be stripped. Use `bypassSecurity` only with trusted content.
- `refresh()` just calls `cdr.markForCheck()` — useful when mutating `data`/`columns` in place (since `OnPush`) without replacing the array reference.
- The `.nggt-detail-content`/`.nggt-show` collapse animation uses the CSS `grid-template-rows: 0fr → 1fr` trick (no JS height measurement, no `ng-collapse` dependency). It requires a reasonably modern browser (Chrome 107+/Firefox 67+/Safari 16.4+); on unsupported browsers the content just appears/disappears without animating.
- The padding for `#rowDetail` content lives on a separate `.nggt-detail-padding` wrapper *inside* `.nggt-detail-inner` (the `overflow: hidden` grid item). Padding can never shrink a box below its own size, so if it were on `.nggt-detail-inner` itself, that box (and the visible content) couldn't collapse fully to 0 height — there'd always be a leftover gap when collapsed.
- Detail rows are rendered for **every expandable row** (not just currently-open ones) so the collapse transition has something to animate from/to — don't put expensive logic directly in the `#rowDetail` template if `data` is large; it runs once per expandable row regardless of expanded state.

## Dependencies

Peer deps only: `@angular/core`/`common` `>=14 <23`. No third-party libs.

## Build & test

```bash
ng build ng-generate-table
ng test ng-generate-table
```
