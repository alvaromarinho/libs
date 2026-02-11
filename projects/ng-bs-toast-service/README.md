# ng-bs-toast-service

[![npm version](https://badge.fury.io/js/ng-bs-toast-service.svg)](https://www.npmjs.com/package/ng-bs-toast-service)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Toast notification service for Angular and Bootstrap 5 with Bootstrap Icons support.

## ✨ Features

- 🎯 **Service-based notifications** - Show toasts from anywhere
- 🎨 **Multiple styles** - success, warning, danger, primary
- 🔔 **Auto-dismiss** - Toasts automatically close after 5 seconds
- 📚 **Queue support** - Stack multiple toasts
- 🎭 **Bootstrap Icons** - Beautiful icon integration
- ⚡ **Standalone component support** (Angular 14+)
- 🔧 **NgModule compatible** (backward compatible)

## 🔧 Compatibility

| ng-bs-toast-service | Angular       | Bootstrap | Bootstrap Icons | Standalone |
|---------------------|---------------|-----------|-----------------|------------|
| 1.0.x               | 14.x - 18.x   | 5.x       | 1.x             | ✅ Yes     |
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

### Method 1: Standalone Component (Angular 14+) ⚡ Recommended

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
  // Show a toast notification
  send(
    title: string,
    message: string | null,
    style?: 'success' | 'warning' | 'danger' | 'primary',
    duration = 5000
  ): void
}
```

### Parameters

| Parameter  | Type                                              | Required | Default     | Description               |
|------------|---------------------------------------------------|----------|-------------|---------------------------|
| `title`    | `string`                                          | Yes      | -           | Toast title               |
| `message`  | `string \| null`                                  | Yes      | -           | Toast message content     |
| `style`    | `'success' \| 'warning' \| 'danger' \| 'primary'` | No       | `'primary'` | Toast color style         |
| `duration` | number                                            | No       | 5000        | Toast duration            |

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

The library uses Bootstrap's color scheme:

| Style     | Color | Use Case                |
|-----------|-------|-------------------------|
| `success` | Green | Successful operations   |
| `warning` | Yellow| Warnings & caution      |
| `danger`  | Red   | Errors & failures       |
| `primary` | Blue  | Info & general messages |

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

By default, toasts auto-dismiss after **7 seconds**. This is currently hardcoded in the component. If you need to customize this, you can modify the timeout in the component:

```typescript
// In ng-bs-toast-service.component.ts
setTimeout(() => {
  // ... cleanup logic
}, 7000); // Change this value (in milliseconds)
```

### Toast Position

Toasts appear in the default Bootstrap toast container position. You can customize the position with CSS:

```css
ng-bs-toast-service {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}
```

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