# ng-month-picker

[![npm version](https://badge.fury.io/js/ng-month-picker.svg)](https://www.npmjs.com/package/ng-month-picker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Month/year picker dropdown component for Angular and Bootstrap 5.

## ✨ Features

- 🎯 **Simple API** - Two-way bindable `value` in `YYYY-MM` format
- 📅 **Year navigation** - Browse years without changing the selected value
- 🌍 **Customizable month names** - Defaults to PT-BR, pass your own locale
- 🖱️ **Click-outside to close** - No extra wiring needed
- ⚡ **Standalone component support** (Angular 14+)
- 🔧 **NgModule compatible** (backward compatible)

## 🔧 Compatibility

| ng-month-picker | Angular       | Bootstrap | Standalone |
|------------------|---------------|-----------|------------|
| 1.0.x            | 14.x - 21.x   | 5.x       | ✅ Yes     |

## 📦 Installation

### NPM
```bash
npm install --save ng-month-picker
```

### YARN
```bash
yarn add ng-month-picker
```

### Peer Dependencies

This library requires:
```json
{
  "bootstrap": "^5.0.0",
  "bootstrap-icons": "^1.0.0"
}
```

Make sure Bootstrap CSS and Bootstrap Icons are included in your `angular.json`:
```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "node_modules/bootstrap-icons/font/bootstrap-icons.css",
  "src/styles.css"
]
```

## 🚀 Usage

### Method 1: Standalone Component (Angular 14+) ⚡ Recommended

**app.component.ts:**
```typescript
import { Component, signal } from '@angular/core';
import { NgMonthPickerComponent } from 'ng-month-picker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgMonthPickerComponent],
  template: `
    <ng-month-picker [value]="month()" (valueChange)="month.set($event)"></ng-month-picker>
  `
})
export class AppComponent {
  month = signal(new Date().toISOString().slice(0, 7));
}
```

---

### Method 2: NgModule (Traditional) 🔧

**Step 1: Import the module**

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgMonthPickerModule } from 'ng-month-picker';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgMonthPickerModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

**Step 2: Use in your component**

**app.component.html:**
```html
<ng-month-picker [value]="month" (valueChange)="month = $event"></ng-month-picker>
```

**app.component.ts:**
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  month = new Date().toISOString().slice(0, 7);
}
```

---

## 📖 API Reference

### Inputs

| Input        | Type       | Default                                              | Description                                                  |
|--------------|------------|-------------------------------------------------------|---------------------------------------------------------------|
| `value`      | `string`   | `''`                                                  | Selected month in `YYYY-MM` format                             |
| `label`      | `string`   | derived from `value` + `monthNames`                  | Overrides the text shown on the trigger button                |
| `monthNames` | `string[]` | `['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']` | Month names used in the grid and derived label |

### Outputs

| Output       | Type                   | Description                                  |
|--------------|------------------------|-----------------------------------------------|
| `valueChange`| `EventEmitter<string>`| Emitted with `YYYY-MM` when a month is picked |

---

## 💡 Examples

### Basic Usage

```typescript
import { Component, signal } from '@angular/core';
import { NgMonthPickerComponent } from 'ng-month-picker';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgMonthPickerComponent],
  template: `
    <div class="row">
      <div class="col-12 col-sm-4 col-md-3">
        <ng-month-picker [value]="month()" (valueChange)="month.set($event)"></ng-month-picker>
      </div>
    </div>

    <div class="alert alert-info py-1 mt-3 small">
      Selected value: <strong>{{ month() }}</strong>
    </div>
  `
})
export class ExampleComponent {
  month = signal(new Date().toISOString().slice(0, 7));
}
```

### Custom Month Names (English)

```typescript
import { Component, signal } from '@angular/core';
import { NgMonthPickerComponent } from 'ng-month-picker';

@Component({
  selector: 'app-example-en',
  standalone: true,
  imports: [NgMonthPickerComponent],
  template: `
    <ng-month-picker
      [value]="month()"
      [monthNames]="['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']"
      (valueChange)="month.set($event)">
    </ng-month-picker>
  `
})
export class ExampleEnComponent {
  month = signal(new Date().toISOString().slice(0, 7));
}
```

### Custom Label

```html
<ng-month-picker [value]="month()" label="Select a month" (valueChange)="month.set($event)"></ng-month-picker>
```

---

## ⚠️ Important Notes

1. **`value` is one-way**: the component never mutates it. Update it yourself from `valueChange`.

2. **Year navigation is independent**: browsing years with the chevrons only changes the dropdown's displayed year (`pickerYear`) — it doesn't affect `value` until a month is actually picked.

3. **Bootstrap Icons required**: the year navigation chevrons (`bi-chevron-left`/`bi-chevron-right`) require Bootstrap Icons to be loaded.

---

## 📄 License

MIT © Alvaro Marinho

## 🐛 Issues

Report issues at: https://github.com/alvaromarinho/libs/issues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
