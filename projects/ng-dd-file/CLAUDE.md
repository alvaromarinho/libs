# ng-dd-file

Drag-and-drop file upload component for Angular, with size/type validation and image preview (no third-party deps).

## Structure

- `src/lib/ng-dd-file.component.ts` — `NgDdFileComponent`, the file list/upload UI and validation logic
- `src/lib/ng-dd-file.directive.ts` — `NgDdFileDirective` (`[ddFile]`), standalone host directive that handles native drag/drop events
- `src/lib/ng-dd-file.module.ts` — `NgDdFileModule`
- `src/public-api.ts` — exports component, directive, module

## Public API

- Component selector: `ng-dd-file`
- Directive selector: `[ddFile]` — applies `fileover` class on dragover and emits `droppedFile: FileList` on drop
- Inputs: `btnClass: { file?, remove? }`, `filesList?: FileWithBase64[]`, `labels: { text, btn }` (PT-BR defaults), `maxFiles?`, `maxFileSize?` (KB), `maxTotalSize?` (KB), `multiple?`, `typeFileAccept` (default `'*'`, same syntax as HTML `accept`)
- Outputs: `fileError: { type: 'size'|'total'|'type', message, file? }`, `fileRemove: { file, index }`, `filesAdd: FileWithBase64[]`

## How it works

- `fileBrowseHandler()` is the single entry point for both the file `<input>` (`change`) and drag/drop (`droppedFile` from the directive) — it accepts `FileList` or an event-like object with `.target.files`.
- Validation order per file: `maxTotalSize` (checked once for the whole batch including existing `filesList`, aborts entirely if exceeded) → `maxFileSize` (per file, skips file) → `typeFileAccept` (per file, skips file) → `maxFiles` (stops adding once reached).
- Images (`file.type.startsWith('image/')`) get a `base64` data URL attached via `FileReader` for preview; non-images are passed through as-is (`FileWithBase64` extends `File` with optional `base64`/`url`).
- `isValidFileType()` supports three `accept` syntaxes: extension (`.pdf`), MIME wildcard (`image/*`), and exact MIME type (`application/pdf`).
- The component does **not** maintain its own file list state — `filesList` is an `@Input` the consumer owns; `filesAdd`/`fileRemove` are emitted for the consumer to update it.

## Gotchas

- `$event.target.value = ''` is reset after processing so selecting the same file twice in a row still fires `change`.
- `maxTotalSize` check happens **before** per-file validation and uses the *entire* incoming `filesArray` plus existing `filesList` — a single oversized batch rejects all new files with one `fileError` (type `'total'`), even if some individual files would have passed.
- `fileBrowseHandler` is `async` (due to `getBase64`) — `filesAdd` emits only after all image previews resolve.

## Dependencies

Peer deps only: `@angular/core`/`common` `>=14 <22`. No third-party libs.

## Build & test

```bash
ng build ng-dd-file
ng test ng-dd-file
```
