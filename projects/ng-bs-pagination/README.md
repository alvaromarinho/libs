# ng-bs-pagination

[![npm version](https://badge.fury.io/js/ng-bs-pagination.svg)](https://www.npmjs.com/package/ng-bs-pagination)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Configurable pagination component for Angular and Bootstrap 5.

## ✨ Features

- 🎯 **Simple API** - Just pass `total`, `current` and `itemPerPage`
- 🎨 **Multiple layouts** - `split`, `center` or `stacked`
- 🔢 **Smart page window** - Configurable `maxPagesToShow` around the current page
- ⏮️ **First/Last navigation** - Optional, with icon or text labels
- 📝 **Custom info text** - Override "Mostrando X–Y de Z" via content projection
- 📏 **Sizes** - `sm`, `md`, `lg` (Bootstrap pagination sizes)
- ⚡ **Signals and zoneless** - Signal inputs, works with or without zone.js (Angular 18+)
- 🔧 **NgModule compatible** (backward compatible)

## 🔧 Compatibility

| ng-bs-pagination | Angular       | Bootstrap | Standalone |
|-------------------|---------------|-----------|------------|
| 2.x               | 18.x - 22.x   | 5.x       | ✅ Yes     |
| 1.x               | 14.x - 22.x   | 5.x       | ✅ Yes     |

## 📦 Installation

### NPM
```bash
npm install --save ng-bs-pagination
```

### YARN
```bash
yarn add ng-bs-pagination
```

### Peer Dependencies

This library requires:
```json
{
  "bootstrap": "^5.0.0"
}
```

Make sure Bootstrap CSS is included in your `angular.json`:
```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.css"
]
```

## 🚀 Usage

### Method 1: Standalone Component (Angular 18+) ⚡ Recommended

**app.component.ts:**
```typescript
import { Component, signal } from '@angular/core';
import { NgBsPaginationComponent } from 'ng-bs-pagination';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgBsPaginationComponent],
  template: `
    <ng-bs-pagination
      [total]="124" [current]="current()" [itemPerPage]="10"
      (change)="current.set($event)"
      (first)="current.set($event)"
      (last)="current.set($event)">
    </ng-bs-pagination>
  `
})
export class AppComponent {
  current = signal(1);
}
```

---

### Method 2: NgModule (Traditional) 🔧

**Step 1: Import the module**

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgBsPaginationModule } from 'ng-bs-pagination';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgBsPaginationModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

**Step 2: Use in your component**

**app.component.html:**
```html
<ng-bs-pagination
  [total]="totalItems" [current]="currentPage" [itemPerPage]="10"
  (change)="currentPage = $event"
  (first)="currentPage = $event"
  (last)="currentPage = $event">
</ng-bs-pagination>
```

**app.component.ts:**
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  totalItems = 124;
  currentPage = 1;
}
```

---

## 📖 API Reference

### Inputs

| Input            | Type                 | Default | Description                                              |
|------------------|----------------------|---------|-----------------------------------------------------------|
| `total`          | `number`             | `0`     | Total number of items                                     |
| `current`        | `number`             | `1`     | Current page (1-based). One-way: update it from `change`/`first`/`last` |
| `itemPerPage`     | `number`             | `10`    | Items per page                                            |
| `maxPagesToShow`  | `number`             | `5`     | Max number of page buttons shown around the current page |
| `size`           | `'sm' \| 'md' \| 'lg'` | `'md'`  | Bootstrap pagination size                                 |
| `layout`         | `PaginationLayout`   | see below | Controls layout type and info block position           |
| `prevNext`       | `PaginationPrevNext` | see below | Customizes the prev/next buttons                       |
| `firstLast`      | `PaginationFirstLast`| see below | Customizes/toggles the first/last buttons              |

### Outputs

| Output   | Type                 | Description                                  |
|----------|----------------------|-----------------------------------------------|
| `change` | `OutputEmitterRef<number>` | Emitted when a page number / prev / next is clicked |
| `first`  | `OutputEmitterRef<number>` | Emitted when the "first page" button is clicked     |
| `last`   | `OutputEmitterRef<number>` | Emitted when the "last page" button is clicked      |

### Upgrading from 1.x

2.0 uses signal inputs and `contentChild`, so it runs in zoneless apps (Angular 22 default) and still works with zone.js.

- Template bindings and outputs don't change. Partial `layout`/`prevNext`/`firstLast` objects still merge with the defaults (now via input `transform`).
- Setting an input from code (`ref.instance.current = 2`) no longer works: use `ref.setInput('current', 2)`.
- Internal members (`totalPages`, `pages`, `infoContext`, `sizeClass`, `wrapperClasses`, `infoTemplate`, `goTo()`, `goFirst()`, `goLast()`) are no longer public.
- Angular 14 to 17 stay on 1.x.

### Interfaces

```typescript
interface PaginationLayout {
  /** 'split' = info and buttons on opposite sides; 'center' = both centered; 'stacked' = one above the other. */
  type?: 'split' | 'center' | 'stacked';
  /** Info position: side (split/center) or top/bottom (stacked). */
  infoPosition?: 'start' | 'end';
  /** Show the info block ("Mostrando X-Y de Z"). */
  showInfo?: boolean;
}

interface PaginationPrevNext {
  /** 'icon' = native arrows (‹ ›); 'text' = custom labels. */
  mode?: 'icon' | 'text';
  labels?: { prev?: string; next?: string };
}

interface PaginationFirstLast {
  /** Show the first/last page buttons. */
  show?: boolean;
  /** 'icon' = native double arrows (« »); 'text' = custom labels. */
  mode?: 'icon' | 'text';
  labels?: { first?: string; last?: string };
}
```

Defaults:

```typescript
const DEFAULT_LAYOUT = { type: 'stacked', infoPosition: 'start', showInfo: true };
const DEFAULT_PREV_NEXT = { mode: 'icon', labels: { prev: '‹', next: '›' } };
const DEFAULT_FIRST_LAST = { show: true, mode: 'icon', labels: { first: '«', last: '»' } };
```

> `layout`, `prevNext` and `firstLast` are shallow-merged onto these defaults — you only need to pass the keys you want to override.

---

## 💡 Examples

### Default (stacked: info above, buttons below)

```html
<ng-bs-pagination
  [total]="124" [current]="current()" [itemPerPage]="10"
  (change)="current.set($event)" (first)="current.set($event)" (last)="current.set($event)">
</ng-bs-pagination>
```

### Split, info on the left

```html
<ng-bs-pagination
  [total]="124" [current]="current()" [itemPerPage]="10"
  [layout]="{ type: 'split' }"
  (change)="current.set($event)" (first)="current.set($event)" (last)="current.set($event)">
</ng-bs-pagination>
```

### Split, info on the right

```html
<ng-bs-pagination
  [total]="124" [current]="current()" [itemPerPage]="10"
  [layout]="{ type: 'split', infoPosition: 'end' }"
  (change)="current.set($event)" (first)="current.set($event)" (last)="current.set($event)">
</ng-bs-pagination>
```

### Centered (buttons + info together)

```html
<ng-bs-pagination
  [total]="124" [current]="current()" [itemPerPage]="10"
  [layout]="{ type: 'center' }"
  (change)="current.set($event)" (first)="current.set($event)" (last)="current.set($event)">
</ng-bs-pagination>
```

### Stacked, info below the buttons

```html
<ng-bs-pagination
  [total]="124" [current]="current()" [itemPerPage]="10"
  [layout]="{ type: 'stacked', infoPosition: 'end' }"
  (change)="current.set($event)" (first)="current.set($event)" (last)="current.set($event)">
</ng-bs-pagination>
```

### Without first/last, text navigation, small size

```html
<ng-bs-pagination
  [total]="124" [current]="current()" [itemPerPage]="10" size="sm"
  [firstLast]="{ show: false }"
  [prevNext]="{ mode: 'text', labels: { prev: 'Previous', next: 'Next' } }"
  (change)="current.set($event)" (first)="current.set($event)" (last)="current.set($event)">
</ng-bs-pagination>
```

### Large size, first/last as text

```html
<ng-bs-pagination
  [total]="124" [current]="current()" [itemPerPage]="10" size="lg"
  [firstLast]="{ mode: 'text', labels: { first: 'Start', last: 'End' } }"
  (change)="current.set($event)" (first)="current.set($event)" (last)="current.set($event)">
</ng-bs-pagination>
```

### Custom info text (content projection)

```html
<ng-bs-pagination
  [total]="124" [current]="current()" [itemPerPage]="10"
  (change)="current.set($event)" (first)="current.set($event)" (last)="current.set($event)">
  <ng-template let-start="start" let-end="end" let-total="total">
    Showing <strong>{{ start }}</strong> to <strong>{{ end }}</strong> of <strong>{{ total }}</strong> entries
  </ng-template>
</ng-bs-pagination>
```

---

## ⚠️ Important Notes

1. **`current` is one-way**: the component never mutates it. You must update it yourself from the `change`/`first`/`last` events.

2. **No-op out-of-range clicks**: clicking a page/prev/next/first/last that is out of range or equal to the current page does not emit anything.

3. **Bootstrap classes**: the component renders standard `.pagination`, `.page-item` and `.page-link` markup, so any Bootstrap 5 theme/override applies automatically.

---

## 📄 License

MIT © Alvaro Marinho

## 🐛 Issues

Report issues at: https://github.com/alvaromarinho/libs/issues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
