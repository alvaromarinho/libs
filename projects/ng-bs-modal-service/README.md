# ng-bs-modal-service

[![npm version](https://badge.fury.io/js/ng-bs-modal-service.svg)](https://www.npmjs.com/package/ng-bs-modal-service)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Modal service for Angular and Bootstrap 5 with advanced features like queue management, carousel support, and popover positioning.

## ✨ Features

- 🎯 **Service-based modal management** - Open modals from anywhere
- 📚 **Queue support** - Stack multiple modals
- 🎠 **Built-in carousel** - Image gallery support
- 📍 **Popover positioning** - Attach modals to elements
- 🎨 **Custom styling** - Flexible CSS classes
- 🔒 **Static backdrop** - Prevent closing on click outside
- 📱 **Responsive sizes** - sm, lg, xl
- ⚡ **Standalone component support** (Angular 14+)
- 🔧 **NgModule compatible** (backward compatible)

## 🔧 Compatibility

| ng-bs-modal-service | Angular       | Bootstrap | Standalone |
|---------------------|---------------|-----------|------------|
| 1.0.x               | 14.x - 18.x   | 5.x       | ✅ Yes     |
| 0.1.x               | 15.x          | 5.x       | ❌ No      |

## 📦 Installation

### NPM
```bash
npm install --save ng-bs-modal-service
```

### YARN
```bash
yarn add ng-bs-modal-service
```

### Peer Dependencies

This library requires:
```json
{
  "bootstrap": "^5.0.0"
}
```

Make sure Bootstrap CSS and JS are included in your `angular.json`:
```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
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
import { Component, TemplateRef } from '@angular/core';
import { NgBsModalServiceComponent, NgBsModalService } from 'ng-bs-modal-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgBsModalServiceComponent],
  template: `
    <button (click)="showModal(modalBody)">Open Modal</button>
    
    <ng-template #modalBody>
      <p>Modal content here!</p>
    </ng-template>
    
    <!-- Add this component to your root template -->
    <ng-bs-modal-service></ng-bs-modal-service>
  `
})
export class AppComponent {
  constructor(private modalService: NgBsModalService) {}

  showModal(body: TemplateRef<any>) {
    this.modalService.open({
      header: 'My Modal',
      body: body
    });
  }
}
```

**main.ts (Standalone App):**
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { NgBsModalService } from 'ng-bs-modal-service';

bootstrapApplication(AppComponent, {
  providers: [
    NgBsModalService
  ]
});
```

---

### Method 2: NgModule (Traditional) 🔧

**Step 1: Import the module**

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgBsModalServiceModule } from 'ng-bs-modal-service';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgBsModalServiceModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

**Step 2: Add component to root template**

**app.component.html:**
```html
<button (click)="showModal(modalBody)">Open Modal</button>

<ng-template #modalBody>
  <p>Modal content here!</p>
</ng-template>

<!-- Add this component ONCE in your root template -->
<ng-bs-modal-service></ng-bs-modal-service>
```

**app.component.ts:**
```typescript
import { Component, TemplateRef } from '@angular/core';
import { NgBsModalService } from 'ng-bs-modal-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private modalService: NgBsModalService) {}

  showModal(body: TemplateRef<any>) {
    this.modalService.open({
      header: 'My Modal',
      body: body
    });
  }
}
```

---

## 📖 API Reference

### Service Methods

```typescript
class NgBsModalService {
  // Open a modal
  open(content: NgBsModalServiceContent | TemplateRef<any>, options?: NgBsModalServiceOptions): void
  
  // Close current modal
  close(): void
  
  // Close all modals in queue
  closeAll(): void
}
```

### Interfaces

```typescript
interface NgBsModalServiceContent {
  header?: TemplateRef<any> | string;
  body: TemplateRef<any> | string;
  footer?: TemplateRef<any>;
}

interface NgBsModalServiceOptions {
  disabledBodyScroll?: boolean;          // Prevent body scroll when modal is open
  size?: 'sm' | 'lg' | 'xl';             // Modal size
  staticBackdrop?: boolean;              // Prevent closing on backdrop click
  withoutClose?: boolean;                // Hide close button
  popoverTo?: HTMLElement;               // Position modal relative to element
  carousel?: {                           // Enable carousel mode
    index: number;
    images: { url: string; name: string }[];
  };
  customClass?: {                        // Custom CSS classes
    modal?: string;
    modalHeader?: string;
    modalBody?: string;
    modalFooter?: string;
  };
}
```

---

## 💡 Examples

### Basic Modal with String Content

```typescript
this.modalService.open({
  header: 'Welcome',
  body: 'This is a simple modal with text content!'
});
```

### Modal with Template

```typescript
showModal(template: TemplateRef<any>) {
  this.modalService.open({
    header: 'User Details',
    body: template
  });
}
```

```html
<ng-template #userTemplate>
  <div class="user-info">
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
  </div>
</ng-template>
```

### Modal with Custom Footer

```typescript
openWithFooter(body: TemplateRef<any>, footer: TemplateRef<any>) {
  this.modalService.open({
    header: 'Confirm Action',
    body: body,
    footer: footer
  });
}
```

```html
<ng-template #footerTemplate>
  <button class="btn btn-secondary" (click)="modalService.close()">Cancel</button>
  <button class="btn btn-primary" (click)="confirm()">Confirm</button>
</ng-template>
```

### Large Modal with Custom Styling

```typescript
this.modalService.open({
  header: 'Large Modal',
  body: content
}, {
  size: 'xl',
  customClass: {
    modalHeader: 'bg-primary text-white',
    modalBody: 'p-4'
  }
});
```

### Static Backdrop (Can't close by clicking outside)

```typescript
this.modalService.open({
  header: 'Important!',
  body: 'You must complete this action.'
}, {
  staticBackdrop: true,
  withoutClose: true
});
```

### Image Carousel Modal

```typescript
openGallery(startIndex: number = 0) {
  this.modalService.open({
    body: ''
  }, {
    carousel: {
      index: startIndex,
      images: [
        { url: 'https://example.com/image1.jpg', name: 'Image 1' },
        { url: 'https://example.com/image2.jpg', name: 'Image 2' },
        { url: 'https://example.com/image3.jpg', name: 'Image 3' }
      ]
    }
  });
}
```

### Popover Modal (Attached to Element)

```typescript
openPopover(event: MouseEvent) {
  const element = event.target as HTMLElement;
  
  this.modalService.open({
    header: 'Quick Info',
    body: 'This modal is positioned near the clicked element!'
  }, {
    popoverTo: element,
    size: 'sm'
  });
}
```

### Modal Queue (Stack Multiple Modals)

```typescript
openMultiple() {
  // First modal
  this.modalService.open({
    header: 'First Modal',
    body: 'This is the first modal'
  });
  
  // Second modal (will stack on top)
  setTimeout(() => {
    this.modalService.open({
      header: 'Second Modal',
      body: 'This is stacked on top!'
    });
  }, 500);
}
```

### Close Modal Programmatically

```typescript
openWithTimer(body: TemplateRef<any>) {
  this.modalService.open({
    header: 'Auto Close',
    body: body
  });
  
  // Close after 3 seconds
  setTimeout(() => {
    this.modalService.close();
  }, 3000);
}
```

---

## 🎨 CSS Customization

### CSS Variables

```css
ng-bs-modal-service {
  --modal-image-height: 80vh;
}
```

### Custom Classes Example

```typescript
this.modalService.open({
  header: 'Styled Modal',
  body: content
}, {
  customClass: {
    modal: 'my-custom-modal',
    modalHeader: 'bg-success text-white border-0',
    modalBody: 'p-5 text-center',
    modalFooter: 'border-top-0'
  }
});
```

```css
.my-custom-modal {
  border-radius: 20px;
  overflow: hidden;
}
```

---

## 🌍 Complete Standalone Example

```typescript
// app.component.ts
import { Component, TemplateRef } from '@angular/core';
import { NgBsModalServiceComponent, NgBsModalService } from 'ng-bs-modal-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgBsModalServiceComponent],
  template: `
    <div class="container mt-5">
      <h1>Modal Service Demo</h1>
      
      <button class="btn btn-primary" (click)="openBasic()">
        Basic Modal
      </button>
      
      <button class="btn btn-success" (click)="openWithTemplate(myTemplate)">
        Template Modal
      </button>
      
      <button class="btn btn-warning" (click)="openGallery()">
        Image Gallery
      </button>
      
      <ng-template #myTemplate>
        <div class="alert alert-info">
          <h4>Custom Template Content</h4>
          <p>You can use any Angular template here!</p>
        </div>
      </ng-template>
      
      <ng-bs-modal-service></ng-bs-modal-service>
    </div>
  `
})
export class AppComponent {
  constructor(private modalService: NgBsModalService) {}

  openBasic() {
    this.modalService.open({
      header: 'Hello!',
      body: 'This is a basic modal.'
    });
  }

  openWithTemplate(template: TemplateRef<any>) {
    this.modalService.open({
      header: 'Template Modal',
      body: template
    }, {
      size: 'lg'
    });
  }

  openGallery() {
    this.modalService.open({
      body: ''
    }, {
      carousel: {
        index: 0,
        images: [
          { url: 'https://picsum.photos/800/600?random=1', name: 'Image 1' },
          { url: 'https://picsum.photos/800/600?random=2', name: 'Image 2' },
          { url: 'https://picsum.photos/800/600?random=3', name: 'Image 3' }
        ]
      }
    });
  }
}
```

---

## ⚠️ Important Notes

1. **Add component to root**: The `<ng-bs-modal-service>` component must be added to your root template (app.component.html or app.component.ts template).

2. **Service injection**: The service is `providedIn: 'root'` by default, so you don't need to add it to providers in most cases.

3. **Bootstrap dependency**: Make sure Bootstrap JavaScript is loaded (either via scripts in angular.json or via @ng-bootstrap).

---

## 📄 License

MIT © Alvaro Marinho

## 🐛 Issues

Report issues at: https://github.com/alvaromarinho/libs/issues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.