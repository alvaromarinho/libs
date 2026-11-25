# ng-bs-toast-service

[![npm version](https://badge.fury.io/js/ng-bs-toast-service.svg)](https://www.npmjs.com/package/ng-bs-toast-service)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Toast notification service for Angular and Bootstrap 5 with Bootstrap Icons support.

## ✨ Features

- 🎯 **Service-based notifications** - Show toasts from anywhere
- 🎨 **All 8 Bootstrap colors** - primary, secondary, success, danger, warning, info, light, dark
- 🖤 **2 render themes** - bootstrap (solid) and bootstrap-dark (native dark mode); default set via the `[theme]` input, overridable per `send()` call
- ⏱️ **Countdown progress bar** - visual auto-dismiss timer, pauses on hover
- 🔔 **Style-aware auto-dismiss** - warning 7s, danger 10s, rest 4s (or pass your own `duration`)
- 📍 **7 positions** - top/middle/bottom × start/center/end, one container per position
- 📚 **Queue support** - configurable max toasts per position, overflow queues
- ✋ **Programmatic dismiss** - `dismiss(id)`, `dismissAll()`, or subscribe to `send()`'s Observable
- 📱 **Mobile-friendly** - full width, glued to the top under 576px
- 🎭 **Bootstrap Icons** - Beautiful icon integration
- ⚡ **Signals and zoneless** - Signal state, works with or without zone.js (Angular 18+)
- 🔧 **NgModule compatible** (backward compatible)

## 🔧 Compatibility

| ng-bs-toast-service | Angular       | Bootstrap | Bootstrap Icons | Standalone |
|---------------------|---------------|-----------|-----------------|------------|
| 2.x                 | 18.x - 22.x   | 5.x       | 1.x             | ✅ Yes     |
| 1.x                 | 14.x - 22.x   | 5.x       | 1.x             | ✅ Yes     |
| 0.0.x               | 15.x          | 5.x       | 1.x             | ❌ No      |

## 📦 Installation

### NPM
```bash
npm install --save ng-bs-toast-service
```

### YARN
```bash
yarn add ng-bs-toast-service
```

### Peer Dependencies

This library requires:
```json
{
  "bootstrap": "^5.0.0",
  "bootstrap-icons": "^1.0.0"
}
```

Make sure Bootstrap CSS/JS and Bootstrap Icons are included in your `angular.json`:
```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "node_modules/bootstrap-icons/font/bootstrap-icons.css",
  "src/styles.css"
],
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
]
```

## 🚀 Usage

### Method 1: Standalone Component (Angular 18+) ⚡ Recommended

**app.component.ts:**
```typescript
import { Component } from '@angular/core';
import { NgBsToastServiceComponent, NgBsToastService } from 'ng-bs-toast-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgBsToastServiceComponent],
  template: `
    <button (click)="showSuccess()">Success Toast</button>
    <button (click)="showWarning()">Warning Toast</button>
    <button (click)="showDanger()">Danger Toast</button>
    
    <!-- Add this component to your root template -->
    <ng-bs-toast-service></ng-bs-toast-service>
  `
})
export class AppComponent {
  constructor(private toastService: NgBsToastService) {}

  showSuccess() {
    this.toastService.send('Success!', 'Operation completed successfully', 'success');
  }

  showWarning() {
    this.toastService.send('Warning!', 'Please check your input', 'warning');
  }

  showDanger() {
    this.toastService.send('Error!', 'Something went wrong', 'danger');
  }
}
```

**main.ts (Standalone App):**
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { NgBsToastService } from 'ng-bs-toast-service';

bootstrapApplication(AppComponent, {
  providers: [
    NgBsToastService
  ]
});
```

---

### Method 2: NgModule (Traditional) 🔧

**Step 1: Import the module**

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgBsToastServiceModule } from 'ng-bs-toast-service';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgBsToastServiceModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

**Step 2: Add component to root template**

**app.component.html:**
```html
<button (click)="showToast()">Show Toast</button>

<!-- Add this component ONCE in your root template -->
<ng-bs-toast-service></ng-bs-toast-service>
```

**app.component.ts:**
```typescript
import { Component } from '@angular/core';
import { NgBsToastService } from 'ng-bs-toast-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private toastService: NgBsToastService) {}

  showToast() {
    this.toastService.send('Hello!', 'This is a toast notification', 'primary');
  }
}
```

---

## 📖 API Reference

### Service Methods

```typescript
class NgBsToastService {
  // Show a toast. Returns an Observable that completes when the toast closes.
  send(
    title: string,
    message: string | null,
    style?: ToastStyle,
    duration?: number,
    options?: { theme?: ToastTheme; position?: ToastPosition }
  ): Observable<void>

  dismiss(id: number): void      // close one toast programmatically
  dismissAll(): void             // close every shown/queued toast
}
```

### Parameters

| Parameter  | Type                        | Required | Default            | Description                                                 |
|------------|------------------------------|----------|---------------------|---------------------------------------------------------------|
| `title`    | `string`                     | Yes      | -                   | Toast title                                                    |
| `message`  | `string \| null`              | Yes      | -                   | Toast message content                                          |
| `style`    | `ToastStyle`                  | No       | `'primary'`         | One of the 8 Bootstrap colors                                  |
| `duration` | `number`                     | No       | resolved from style | `warning` 7000ms, `danger` 10000ms, rest 4000ms                |
| `options.theme`    | `ToastTheme`          | No       | the component's `[theme]` input (`'bootstrap'` by default) | `'bootstrap'` \| `'bootstrap-dark'` |
| `options.position` | `ToastPosition`       | No       | `'top-end'`           | any of the 7 positions below                                   |

```typescript
type ToastStyle = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
type ToastTheme = 'bootstrap' | 'bootstrap-dark';
type ToastPosition = 'top-start' | 'top-center' | 'top-end'
                    | 'middle-center'
                    | 'bottom-start' | 'bottom-center' | 'bottom-end';
```

Getting a closed-notification instead of firing and forgetting:

```typescript
this.toastService.send('Saved', null, 'success').subscribe(() => {
  console.log('toast closed');
});
```

---

## 💡 Examples

### Success Toast

```typescript
showSuccess() {
  this.toastService.send(
    'Success!',
    'Your changes have been saved',
    'success'
  );
}
```

### Warning Toast

```typescript
showWarning() {
  this.toastService.send(
    'Warning!',
    'Please review your information',
    'warning'
  );
}
```

### Danger/Error Toast

```typescript
showError() {
  this.toastService.send(
    'Error!',
    'Failed to save changes',
    'danger'
  );
}
```

### Primary/Info Toast

```typescript
showInfo() {
  this.toastService.send(
    'Info',
    'New updates available',
    'primary'
  );
}
```

### Toast without Message

```typescript
showSimple() {
  this.toastService.send('Notification', null, 'success');
}
```

### Multiple Toasts (Queue)

```typescript
showMultiple() {
  this.toastService.send('First', 'This is the first toast', 'success');
  this.toastService.send('Second', 'This is the second toast', 'warning');
  this.toastService.send('Third', 'This is the third toast', 'danger');
}
```

### Form Validation Example

```typescript
onSubmit(form: any) {
  if (form.valid) {
    this.http.post('/api/data', form.value).subscribe({
      next: () => {
        this.toastService.send('Success!', 'Form submitted successfully', 'success');
      },
      error: (err) => {
        this.toastService.send('Error!', err.message, 'danger');
      }
    });
  } else {
    this.toastService.send('Validation Error', 'Please fill all required fields', 'warning');
  }
}
```

### API Call with Loading Toast

```typescript
async loadData() {
  this.toastService.send('Loading', 'Fetching data...', 'primary');
  
  try {
    const data = await this.apiService.getData();
    this.toastService.send('Success!', 'Data loaded successfully', 'success');
  } catch (error) {
    this.toastService.send('Error!', 'Failed to load data', 'danger');
  }
}
```

---

## 🎨 Toast Styles

All 8 Bootstrap colors, each with its own icon:

| Style       | Icon                        | Use Case                     |
|-------------|------------------------------|-------------------------------|
| `primary`   | `bi-chat-text-fill`           | General messages               |
| `secondary` | `bi-dash-circle-fill`         | Neutral notices                |
| `success`   | `bi-check-circle-fill`        | Successful operations          |
| `danger`    | `bi-x-circle-fill`            | Errors & failures              |
| `warning`   | `bi-exclamation-circle-fill`  | Warnings & caution             |
| `info`      | `bi-info-circle-fill`         | Informational messages         |
| `light`     | `bi-brightness-high-fill`     | Low-emphasis notices           |
| `dark`      | `bi-moon-stars-fill`          | Low-emphasis, dark accent      |

## 🖤 Themes

Independent from `style` — pick how the toast is rendered. Set a default for every toast via the component's `[theme]` input, or override per `send()` call:

- **`bootstrap`** (default) — solid `text-bg-{style}` toast, bootstrap's contrast-computed text color. The progress bar uses a translucent white/black overlay (not the style color) — `bg-{style}` would be the same color as the background and disappear.
- **`bootstrap-dark`** — the same color pairing bootstrap's own `.alert-{style}` uses: `bg-{style}-subtle` / `text-{style}-emphasis` / `border-{style}-subtle`, all dark-mode aware via `data-bs-theme="dark"`. The progress bar uses the style's own `*-text-emphasis` color, which bootstrap already tunes to stay legible against `*-bg-subtle` — including for style `'dark'`, where a plain `bg-dark` bar would be nearly invisible dark-on-dark.

```typescript
// Default for every toast (e.g. app.component.html):
// <ng-bs-toast-service [theme]="darkMode() ? 'bootstrap-dark' : 'bootstrap'" />

// Per-call override:
this.toastService.send('Erro', 'Algo deu errado', 'danger', undefined, { theme: 'bootstrap-dark', position: 'bottom-end' });
```

---

## 🌍 Complete Standalone Example

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { NgBsToastServiceComponent, NgBsToastService } from 'ng-bs-toast-service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgBsToastServiceComponent],
  template: `
    <div class="container mt-5">
      <h1>Toast Service Demo</h1>
      
      <div class="btn-group" role="group">
        <button class="btn btn-success" (click)="showSuccess()">
          Success
        </button>
        <button class="btn btn-warning" (click)="showWarning()">
          Warning
        </button>
        <button class="btn btn-danger" (click)="showDanger()">
          Danger
        </button>
        <button class="btn btn-primary" (click)="showPrimary()">
          Primary
        </button>
        <button class="btn btn-secondary" (click)="showMultiple()">
          Multiple
        </button>
      </div>
      
      <ng-bs-toast-service></ng-bs-toast-service>
    </div>
  `
})
export class AppComponent {
  constructor(private toastService: NgBsToastService) {}

  showSuccess() {
    this.toastService.send('Success!', 'Operation completed successfully', 'success');
  }

  showWarning() {
    this.toastService.send('Warning!', 'Please check your input', 'warning');
  }

  showDanger() {
    this.toastService.send('Error!', 'Something went wrong', 'danger');
  }

  showPrimary() {
    this.toastService.send('Info', 'This is an informational message', 'primary');
  }

  showMultiple() {
    this.toastService.send('Toast 1', 'First toast message', 'success');
    setTimeout(() => {
      this.toastService.send('Toast 2', 'Second toast message', 'warning');
    }, 500);
    setTimeout(() => {
      this.toastService.send('Toast 3', 'Third toast message', 'primary');
    }, 1000);
  }
}
```

---

## ⚙️ Configuration

### Auto-dismiss Duration

Resolved from `style` when omitted — `warning` 7s, `danger` 10s, rest 4s. Pass `duration` explicitly to override, in milliseconds:

```typescript
this.toastService.send('Salvando…', null, 'primary', 1500);
```

Hovering a toast pauses its countdown (and the progress bar); it resumes with the remaining time on mouse-leave.

### Toast Position

7 bootstrap-documented positions, passed per toast via `options.position` (default `'top-end'`). Each position gets its own `.toast-container`, so toasts in different corners don't push each other around:

```typescript
this.toastService.send('Copiado!', null, 'success', undefined, { position: 'bottom-center' });
```

### Queue / Max Toasts

`<ng-bs-toast-service [maxToastsPerPosition]="5" />` — toasts beyond the limit for a given position wait in a queue and appear as older ones close.

### Dismissing Programmatically

```typescript
const closed$ = this.toastService.send('Uploading…', null, 'primary', 999999);
// later, e.g. on upload complete:
this.toastService.dismissAll(); // or keep the id from an internal event and call dismiss(id)
```

---

### Upgrading from 1.x

2.0 keeps its state in signals, so toasts appear, count down and close in zoneless apps (Angular 22 default); it still works with zone.js.

- `send()`, `dismiss()`, `dismissAll()` and the component's `[theme]`/`[maxToastsPerPosition]` bindings don't change.
- Setting an input from code (`ref.instance.theme = ...`) no longer works: use `ref.setInput('theme', ...)`.
- Internal members (`toastData`, `toastsForPosition()`, `pauseToast()`, `resumeToast()`, `toastClasses()`, `iconClasses()`, `progressBarStyle()`, `closeButtonClass()`, ...) are no longer public.
- Toasts sent while no `<ng-bs-toast-service>` is listening are delivered, in order, to the next one (1.x kept only the last). Up to 20 wait; past that the oldest is dropped and its `send()` Observable completes. A component created later no longer re-shows a toast that was already shown.
- Angular 14 to 17 stay on 1.x.

---

## ⚠️ Important Notes

1. **Add component to root**: The `<ng-bs-toast-service>` component must be added to your root template (app.component.html or app.component.ts template).

2. **Service injection**: The service is `providedIn: 'root'` by default, so you don't need to add it to providers in most cases.

3. **Bootstrap Icons required**: Make sure Bootstrap Icons CSS is loaded for the icons to display properly.

4. **Bootstrap JavaScript required**: Bootstrap's JS is needed for toast animations.

---

## 📄 License

MIT © Alvaro Marinho

## 🐛 Issues

Report issues at: https://github.com/alvaromarinho/libs/issues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.