# ng-month-year-picker

[![npm version](https://badge.fury.io/js/ng-month-year-picker.svg)](https://www.npmjs.com/package/ng-month-year-picker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Month/year picker dropdown component for Angular. Self-contained — no Bootstrap or icon font required.

## ✨ Features

- 🎯 **Simple API** - Two-way bindable `value` in `YYYY-MM` format
- 📅 **Year navigation** - Browse years without changing the selected value
- 🌍 **Customizable month names** - Defaults to PT-BR, pass your own locale
- 🖱️ **Click-outside to close** - No extra wiring needed
- ⏭️ **Jump to today** - Built-in "Hoje" button in the dropdown
- 🚫 **Disableable** - `disabled` input blocks opening the picker
- 🎨 **Themeable** - colors/spacing via `--ng-month-year-picker-*` CSS custom properties
- ⚡ **Standalone component support** (Angular 14+)
- 🔧 **NgModule compatible** (backward compatible)

## 🔧 Compatibility

| ng-month-year-picker | Angular       | Standalone |
|------------------|---------------|-----------|
| 1.0.x            | 14.x - 21.x   | ✅ Yes     |

## 📦 Installation

### NPM
```bash
npm install --save ng-month-year-picker
```

### YARN
```bash
yarn add ng-month-year-picker
```

No additional CSS or peer dependencies are required — just Angular.

## 🚀 Usage

### Method 1: Standalone Component (Angular 14+) ⚡ Recommended

**app.component.ts:**
```typescript
import { Component, signal } from '@angular/core';
import { NgMonthYearPickerComponent } from 'ng-month-year-picker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgMonthYearPickerComponent],
  template: `
    <ng-month-year-picker [value]="month()" (valueChange)="month.set($event)"></ng-month-year-picker>
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
import { NgMonthYearPickerModule } from 'ng-month-year-picker';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgMonthYearPickerModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

**Step 2: Use in your component**

**app.component.html:**
```html
<ng-month-year-picker [value]="month" (valueChange)="month = $event"></ng-month-year-picker>
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
| `disabled`   | `boolean`  | `false`                                               | Disables the trigger button and blocks opening the picker     |
| `todayLabel` | `string`   | `'Hoje'`                                              | Text shown on the "today" button                               |

### Outputs

| Output       | Type                   | Description                                  |
|--------------|------------------------|-----------------------------------------------|
| `valueChange`| `EventEmitter<string>`| Emitted with `YYYY-MM` when a month is picked |

---

## 💡 Examples

### Basic Usage

```typescript
import { Component, signal } from '@angular/core';
import { NgMonthYearPickerComponent } from 'ng-month-year-picker';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgMonthYearPickerComponent],
  template: `
    <div style="max-width: 200px">
      <ng-month-year-picker [value]="month()" (valueChange)="month.set($event)"></ng-month-year-picker>
    </div>

    <p>Selected value: <strong>{{ month() }}</strong></p>
  `
})
export class ExampleComponent {
  month = signal(new Date().toISOString().slice(0, 7));
}
```

### Custom Month Names (English)

```typescript
import { Component, signal } from '@angular/core';
import { NgMonthYearPickerComponent } from 'ng-month-year-picker';

@Component({
  selector: 'app-example-en',
  standalone: true,
  imports: [NgMonthYearPickerComponent],
  template: `
    <ng-month-year-picker
      [value]="month()"
      [monthNames]="['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']"
      (valueChange)="month.set($event)">
    </ng-month-year-picker>
  `
})
export class ExampleEnComponent {
  month = signal(new Date().toISOString().slice(0, 7));
}
```

### Custom Label

```html
<ng-month-year-picker [value]="month()" label="Select a month" (valueChange)="month.set($event)"></ng-month-year-picker>
```

### Disabled

```html
<ng-month-year-picker [value]="month()" [disabled]="true" (valueChange)="month.set($event)"></ng-month-year-picker>
```

### Theming

Override the CSS custom properties on the host element to match your design system:

```css
ng-month-year-picker {
  --ng-month-year-picker-primary: #198754;
  --ng-month-year-picker-primary-color: #fff;
  --ng-month-year-picker-border-color: #ced4da;
  --ng-month-year-picker-bg: #f8f9fa;
  --ng-month-year-picker-hover-bg: #e9ecef;
  --ng-month-year-picker-color: #212529;
  --ng-month-year-picker-radius: 0.375rem;
}
```

---

## ⚠️ Important Notes

1. **`value` is one-way**: the component never mutates it. Update it yourself from `valueChange`.

2. **Year navigation is independent**: browsing years with the chevrons only changes the dropdown's displayed year (`pickerYear`) — it doesn't affect `value` until a month is actually picked.

3. **"Hoje" ignores the browsed year**: clicking the "Hoje" button always jumps to the current month/year, regardless of what year the dropdown is currently showing.

---

## 📄 License

MIT © Alvaro Marinho

## 🐛 Issues

Report issues at: https://github.com/alvaromarinho/libs/issues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
