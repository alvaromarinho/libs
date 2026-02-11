# ng-collapse

[![npm version](https://badge.fury.io/js/ng-collapse.svg)](https://www.npmjs.com/package/ng-collapse)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Simple and smooth collapse/expand component for Angular with CSS transitions.

## ✨ Features

- 🎯 **Simple API** - Just one input property
- 🎨 **Smooth animations** - CSS-based transitions
- 📦 **Lightweight** - No dependencies (except Angular)
- 🔄 **Toggle control** - Easy show/hide content
- 🎭 **Content projection** - Use with any content
- ⚡ **Standalone component support** (Angular 14+)
- 🔧 **NgModule compatible** (backward compatible)

## 🔧 Compatibility

| ng-collapse | Angular       | Standalone |
|-------------|---------------|------------|
| 1.0.x       | 14.x - 18.x   | ✅ Yes     |
| 0.0.x       | 15.x          | ❌ No      |

## 📦 Installation

### NPM
```bash
npm install --save ng-collapse
```

### YARN
```bash
yarn add ng-collapse
```

## 🚀 Usage

### Method 1: Standalone Component (Angular 14+) ⚡ Recommended

**app.component.ts:**
```typescript
import { Component } from '@angular/core';
import { NgCollapseComponent } from 'ng-collapse';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgCollapseComponent],
  template: `
    <button (click)="isOpen = !isOpen">
      {{ isOpen ? 'Close' : 'Open' }}
    </button>
    
    <ng-collapse [toggle]="isOpen">
      <div class="p-3">
        <h3>Collapsed Content</h3>
        <p>This content will smoothly expand and collapse!</p>
      </div>
    </ng-collapse>
  `
})
export class AppComponent {
  isOpen = false;
}
```

---

### Method 2: NgModule (Traditional) 🔧

**Step 1: Import the module**

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgCollapseModule } from 'ng-collapse';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgCollapseModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

**Step 2: Use in your component**

**app.component.html:**
```html
<button (click)="toggle = !toggle">Toggle Collapse</button>

<ng-collapse [toggle]="toggle">
  <div class="content">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. 
    Quasi expedita quisquam necessitatibus vitae maxime temporibus minima ex officia 
    nostrum aspernatur deserunt dolorum quaerat sunt aliquam, repudiandae non in fugit! Tempore.
  </div>
</ng-collapse>
```

**app.component.ts:**
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  toggle = false;
}
```

---

## 📖 API Reference

### Inputs

| Input                | Type      | Default | Description                           |
|----------------------|-----------|---------|---------------------------------------|
| `toggle`             | `boolean` | `false` | Controls the collapse/expand state    |
| `transitionDuration` | `number`  | 500     | Durations of transition               |

### Component

```typescript
@Component({
  selector: 'ng-collapse'
})
class NgCollapseComponent {
  @Input() toggle?: boolean;
  @Input() transitionDuration = 500;
}
```

---

## 💡 Examples

### Basic Toggle

```typescript
import { Component } from '@angular/core';
import { NgCollapseComponent } from 'ng-collapse';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgCollapseComponent],
  template: `
    <button (click)="isOpen = !isOpen">
      {{ isOpen ? 'Hide' : 'Show' }} Details
    </button>
    
    <ng-collapse [toggle]="isOpen">
      <p>Here are the details you wanted to see!</p>
    </ng-collapse>
  `
})
export class ExampleComponent {
  isOpen = false;
}
```

### Accordion Style (Multiple Sections)

```typescript
import { Component } from '@angular/core';
import { NgCollapseComponent } from 'ng-collapse';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule, NgCollapseComponent],
  template: `
    <div class="accordion">
      <div class="accordion-item" *ngFor="let item of items; let i = index">
        <button (click)="toggleItem(i)" class="accordion-button">
          {{ item.title }}
        </button>
        <ng-collapse [toggle]="openItems[i]">
          <div class="accordion-content">
            {{ item.content }}
          </div>
        </ng-collapse>
      </div>
    </div>
  `,
  styles: [`
    .accordion-item { border: 1px solid #ddd; margin-bottom: 10px; }
    .accordion-button { width: 100%; padding: 15px; background: #f8f9fa; border: none; cursor: pointer; }
    .accordion-content { padding: 15px; background: white; }
  `]
})
export class AccordionComponent {
  openItems: boolean[] = [];
  
  items = [
    { title: 'Section 1', content: 'Content for section 1' },
    { title: 'Section 2', content: 'Content for section 2' },
    { title: 'Section 3', content: 'Content for section 3' }
  ];

  toggleItem(index: number) {
    this.openItems[index] = !this.openItems[index];
  }
}
```

### FAQ Component

```typescript
import { Component } from '@angular/core';
import { NgCollapseComponent } from 'ng-collapse';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, NgCollapseComponent],
  template: `
    <div class="faq-container">
      <h2>Frequently Asked Questions</h2>
      
      <div class="faq-item" *ngFor="let faq of faqs; let i = index">
        <button class="faq-question" (click)="toggle(i)">
          <span>{{ faq.question }}</span>
          <span class="icon">{{ openIndex === i ? '−' : '+' }}</span>
        </button>
        
        <ng-collapse [toggle]="openIndex === i">
          <div class="faq-answer">
            {{ faq.answer }}
          </div>
        </ng-collapse>
      </div>
    </div>
  `,
  styles: [`
    .faq-question {
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 15px;
      background: #f5f5f5;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }
    .faq-answer {
      padding: 15px;
      background: white;
      border: 1px solid #ddd;
      border-top: none;
    }
  `]
})
export class FaqComponent {
  openIndex: number | null = null;
  
  faqs = [
    {
      question: 'How do I install this library?',
      answer: 'You can install it using npm install ng-collapse'
    },
    {
      question: 'Is it compatible with Angular 17?',
      answer: 'Yes! It works with Angular 14 through 18.'
    },
    {
      question: 'Can I customize the animation?',
      answer: 'Yes, you can override the CSS styles to customize the transition.'
    }
  ];

  toggle(index: number) {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
```

### Conditional Content Loading

```typescript
import { Component } from '@angular/core';
import { NgCollapseComponent } from 'ng-collapse';

@Component({
  selector: 'app-lazy-content',
  standalone: true,
  imports: [NgCollapseComponent],
  template: `
    <button (click)="loadContent()">Load More</button>
    
    <ng-collapse [toggle]="showContent">
      <div *ngIf="content" class="content">
        {{ content }}
      </div>
    </ng-collapse>
  `
})
export class LazyContentComponent {
  showContent = false;
  content: string | null = null;

  loadContent() {
    if (!this.content) {
      // Simulate API call
      setTimeout(() => {
        this.content = 'Loaded content from server!';
        this.showContent = true;
      }, 500);
    } else {
      this.showContent = !this.showContent;
    }
  }
}
```

### Form Section Toggle

```typescript
import { Component } from '@angular/core';
import { NgCollapseComponent } from 'ng-collapse';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-section',
  standalone: true,
  imports: [NgCollapseComponent, FormsModule],
  template: `
    <div class="form-section">
      <label>
        <input type="checkbox" [(ngModel)]="showAdvanced">
        Show Advanced Options
      </label>
      
      <ng-collapse [toggle]="showAdvanced">
        <div class="advanced-options">
          <label>
            Option 1: <input type="text" [(ngModel)]="option1">
          </label>
          <label>
            Option 2: <input type="text" [(ngModel)]="option2">
          </label>
        </div>
      </ng-collapse>
    </div>
  `
})
export class FormSectionComponent {
  showAdvanced = false;
  option1 = '';
  option2 = '';
}
```

---

## 🎨 Customization

### Custom Animation Duration

You can customize the transition by overriding the CSS:

```css
ng-collapse ::ng-deep .ng-collapse {
  transition: max-height 0.5s ease-in-out !important;
}

ng-collapse ::ng-deep .ng-collapse.show {
  transition: max-height 0.7s ease-in !important;
}
```

### Custom Max Height

If your content is taller than 100vh:

```css
ng-collapse ::ng-deep .ng-collapse.show {
  max-height: 200vh; /* or any value you need */
}
```

### Custom Styling

```html
<ng-collapse [toggle]="isOpen">
  <div class="my-custom-content">
    <!-- Your styled content -->
  </div>
</ng-collapse>
```

```css
.my-custom-content {
  padding: 20px;
  background: #f0f0f0;
  border-radius: 8px;
}
```

---

## 🌍 Complete Standalone Example

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { NgCollapseComponent } from 'ng-collapse';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgCollapseComponent],
  template: `
    <div class="container">
      <h1>Collapse Demo</h1>
      
      <div class="demo-section">
        <h3>Simple Toggle</h3>
        <button class="btn" (click)="simple = !simple">
          Toggle
        </button>
        <ng-collapse [toggle]="simple">
          <div class="content">
            This is a simple collapsible content.
          </div>
        </ng-collapse>
      </div>
      
      <div class="demo-section">
        <h3>Multiple Sections</h3>
        <button class="btn" (click)="section1 = !section1">Section 1</button>
        <ng-collapse [toggle]="section1">
          <div class="content">Content 1</div>
        </ng-collapse>
        
        <button class="btn" (click)="section2 = !section2">Section 2</button>
        <ng-collapse [toggle]="section2">
          <div class="content">Content 2</div>
        </ng-collapse>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .demo-section { margin-bottom: 30px; }
    .btn { padding: 10px 20px; margin: 10px 5px; cursor: pointer; }
    .content { padding: 15px; background: #f8f9fa; margin: 10px 0; }
  `]
})
export class AppComponent {
  simple = false;
  section1 = false;
  section2 = false;
}
```

---

## ⚠️ Important Notes

1. **Max Height Limitation**: The component uses `max-height: 100vh` for the expanded state. If your content is taller, you may need to adjust this via CSS.

2. **Overflow Handling**: The component automatically sets `overflow: visible` after the animation completes to allow content like dropdowns to overflow correctly.

3. **Animation Timing**: Expand animation takes 0.5s, collapse takes 0.3s. You can customize these via CSS.

---

## 📄 License

MIT © Alvaro Marinho

## 🐛 Issues

Report issues at: https://github.com/alvaromarinho/libs/issues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.