# ng-generate-table

[![npm version](https://badge.fury.io/js/ng-generate-table.svg)](https://www.npmjs.com/package/ng-generate-table)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Dynamic table generator for Angular with custom templates, pipes, mobile view, and advanced customization features.

## ✨ Features

- 🎯 **Dynamic generation** - Create tables from data and column config
- 🎨 **Custom templates** - Use functions to generate custom HTML
- 🔧 **Pipe support** - Apply any Angular pipe to columns
- 📱 **Mobile responsive** - Built-in card view for mobile devices
- 🖱️ **Clickable rows** - Handle row click events
- 🎭 **Custom classes** - Style individual columns
- 📊 **Loading state** - Built-in loading indicator
- 🔄 **Content projection** - Custom thead, tbody, tfoot
- ⚡ **Standalone component support** (Angular 14+)
- 🔧 **NgModule compatible** (backward compatible)

## 🔧 Compatibility

| ng-generate-table | Angular       | Standalone |
|-------------------|---------------|------------|
| 1.0.x             | 14.x - 18.x   | ✅ Yes     |
| 0.0.x             | 15.x          | ❌ No      |

## 📦 Installation

### NPM
```bash
npm install --save ng-generate-table
```

### YARN
```bash
yarn add ng-generate-table
```

## 🚀 Usage

### Method 1: Standalone Component (Angular 14+) ⚡ Recommended

**app.component.ts:**
```typescript
import { Component } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';
import { DatePipe } from '@angular/common';

interface User {
  name: string;
  email: string;
  date: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgGenerateTableComponent],
  template: `
    <ng-generate-table 
      [columns]="columns" 
      [data]="users"
      [loading]="loading">
    </ng-generate-table>
  `
})
export class AppComponent {
  loading = false;
  
  users: User[] = [
    { name: 'Álvaro', email: 'alvaro@email.com', date: '2023-08-23' },
    { name: 'Marinho', email: 'marinho@email.com', date: '2023-08-24' }
  ];

  columns: NgGenerateTableColumns[] = [
    { label: 'Name', field: 'name' },
    { label: 'Email', field: 'email' },
    { label: 'Date', field: 'date', pipe: DatePipe, pipeArgs: ['dd/MM/yyyy'] }
  ];
}
```

---

### Method 2: NgModule (Traditional) 🔧

**Step 1: Import the module**

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgGenerateTableModule } from 'ng-generate-table';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgGenerateTableModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

**Step 2: Use in your component**

**app.component.ts:**
```typescript
import { Component } from '@angular/core';
import { NgGenerateTableColumns } from 'ng-generate-table';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  data = [
    { name: 'John', email: 'john@example.com', date: '2023-08-23' },
    { name: 'Jane', email: 'jane@example.com', date: '2023-08-24' }
  ];

  columns: NgGenerateTableColumns[] = [
    { label: 'Name', field: 'name' },
    { label: 'Email', field: 'email' },
    { label: 'Date', field: 'date' }
  ];
}
```

**app.component.html:**
```html
<ng-generate-table [columns]="columns" [data]="data"></ng-generate-table>
```

---

## 📖 API Reference

### Inputs

| Input            | Type                        | Default                  | Description                 |
|------------------|-----------------------------|--------------------------|-----------------------------|
| `data`           | `any[]`                     | -                        | Array of data objects       |
| `columns`        | `NgGenerateTableColumns[]`  | -                        | Column configuration        |
| `tableClass`     | `string`                    | -                        | CSS class for table element |
| `loading`        | `boolean`                   | `false`                  | Show loading state          |
| `mobileView`     | `boolean`                   | `false`                  | Enable mobile card view     |
| `emptyMessage`   | `string`                    | `Nenhum dado encontrado` | Message when no data        |
| `loadingMessage` | `string`                    | `Carregando...`          | Loading message             |
| `rowClickable`   | `boolean`                   | `false`                  | Make rows clickable         |

### Outputs

| Output       | Type                  | Description |
|--------------|-----------------------|-------------|
| `rowClick`   | `EventEmitter<{ row: T; event: Event }>`  | Emitted when row is clicked (requires `rowClickable=true`) |
| `cellClick`  | `EventEmitter<{ row: T; column: NgGenerateTableColumns<T>; event: Event }>` | Emitted when a cell is clicked |
| `sortChange` | `EventEmitter<{ field: string; direction: SortDirection }>` | Emitted when sort changes |

### NgGenerateTableColumns Interface (adicionar propriedades)

| Property   | Type                                 | Description |
|------------|--------------------------------------|-------------|
| `width`    | `string`                             | Column width (e.g., '100px', '20%') |
| `align`    | `'left' \| 'center' \| 'right'`      | Text alignment |
| `sortable` | `boolean`                            | Enable column sorting |

### NgGenerateTableColumns Interface

```typescript
interface NgGenerateTableColumns {
  label?: string;                         // Column header label
  field?: keyof T & string;               // Data field name
  thClass?: string;                       // CSS class for th element
  tdClass?: string;                       // CSS class for td element
  pipe?: Type<PipeTransform>;             // Angular pipe to apply
  pipeArgs?: any[];                       // Arguments for the pipe
  template?: (row: T) => string;          // Custom HTML template function
  click?: (row: T, event: Event) => void; // Click handler for template
  width?: string;                         // Width column
  align?: 'left' | 'center' | 'right';    // Align text
  sortable?: boolean;                     // Column sortable
  isAction?: boolean;                     // Mark column as action column
}
```

---

## 💡 Examples

### Basic Table

```typescript
import { Component } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';

@Component({
  selector: 'app-basic-table',
  standalone: true,
  imports: [NgGenerateTableComponent],
  template: `
    <ng-generate-table [columns]="columns" [data]="data"></ng-generate-table>
  `
})
export class BasicTableComponent {
  data = [
    { id: 1, name: 'Product 1', price: 100 },
    { id: 2, name: 'Product 2', price: 200 }
  ];

  columns: NgGenerateTableColumns[] = [
    { label: 'ID', field: 'id' },
    { label: 'Name', field: 'name' },
    { label: 'Price', field: 'price' }
  ];
}
```

### With Angular Pipes

```typescript
import { Component } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';
import { DatePipe, CurrencyPipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-pipes-table',
  standalone: true,
  imports: [NgGenerateTableComponent],
  template: `
    <ng-generate-table [columns]="columns" [data]="data"></ng-generate-table>
  `
})
export class PipesTableComponent {
  data = [
    { name: 'john', amount: 1500.50, date: '2023-08-23' },
    { name: 'jane', amount: 2300.75, date: '2023-08-24' }
  ];

  columns: NgGenerateTableColumns[] = [
    { label: 'Name', field: 'name', pipe: UpperCasePipe },
    { label: 'Amount', field: 'amount', pipe: CurrencyPipe, pipeArgs: ['USD', 'symbol'] },
    { label: 'Date', field: 'date', pipe: DatePipe, pipeArgs: ['dd MMM yyyy'] }
  ];
}
```

### Custom Template with Actions

```typescript
import { Component } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';

@Component({
  selector: 'app-actions-table',
  standalone: true,
  imports: [NgGenerateTableComponent],
  template: `
    <ng-generate-table [columns]="columns" [data]="users"></ng-generate-table>
  `
})
export class ActionsTableComponent {
  users = [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' }
  ];

  columns: NgGenerateTableColumns[] = [
    { label: 'Name', field: 'name' },
    { label: 'Email', field: 'email' },
    {
      label: 'Actions',
      isAction: true,
      template: (user: any) => `
        <button class="btn btn-primary btn-sm">Edit</button>
        <button class="btn btn-danger btn-sm">Delete</button>
      `,
      click: (user: any, event?: MouseEvent) => {
        const target = event?.target as HTMLElement;
        if (target.textContent === 'Edit') {
          this.editUser(user);
        } else if (target.textContent === 'Delete') {
          this.deleteUser(user);
        }
      }
    }
  ];

  editUser(user: any) {
    console.log('Edit', user);
  }

  deleteUser(user: any) {
    console.log('Delete', user);
  }
}
```

### Custom CSS Classes

```typescript
columns: NgGenerateTableColumns[] = [
  { label: 'Name', field: 'name', thClass: 'bg-primary text-white', tdClass: 'fw-bold' },
  { label: 'Status', field: 'status', tdClass: 'text-success' },
  { label: 'Date', field: 'date', thClass: 'text-center', tdClass: 'text-center' }
];
```

### Loading State

```typescript
import { Component } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';

@Component({
  selector: 'app-loading-table',
  standalone: true,
  imports: [NgGenerateTableComponent],
  template: `
    <button (click)="loadData()">Load Data</button>
    <ng-generate-table 
      [columns]="columns" 
      [data]="data" 
      [loading]="loading">
    </ng-generate-table>
  `
})
export class LoadingTableComponent {
  data: any[] = [];
  loading = false;

  columns: NgGenerateTableColumns[] = [
    { label: 'Name', field: 'name' },
    { label: 'Email', field: 'email' }
  ];

  loadData() {
    this.loading = true;
    setTimeout(() => {
      this.data = [
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' }
      ];
      this.loading = false;
    }, 2000);
  }
}
```

### Clickable Rows

```typescript
import { Component } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';

@Component({
  selector: 'app-clickable-table',
  standalone: true,
  imports: [NgGenerateTableComponent],
  template: `
    <ng-generate-table 
      [columns]="columns" 
      [data]="data"
      [rowClickable]="true"
      (rowClick)="onRowClick($event)">
    </ng-generate-table>
  `
})
export class ClickableTableComponent {
  data = [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' }
  ];

  columns: NgGenerateTableColumns[] = [
    { label: 'Name', field: 'name' },
    { label: 'Email', field: 'email' }
  ];

  onRowClick(rowData: any) {
    console.log('Row clicked:', rowData);
    // Navigate or show details
  }
}
```

### Mobile Card View

```typescript
import { Component } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mobile-table',
  standalone: true,
  imports: [CommonModule, NgGenerateTableComponent],
  template: `
    <ng-generate-table 
      [columns]="columns" 
      [data]="users"
      [mobileView]="true">
      
      <!-- Custom mobile card template -->
      <ng-template #cardMobile let-user>
        <div class="card">
          <div class="card-body">
            <h5>{{ user.name }}</h5>
            <p>{{ user.email }}</p>
            <small>{{ user.date }}</small>
          </div>
        </div>
      </ng-template>
    </ng-generate-table>
  `
})
export class MobileTableComponent {
  users = [
    { name: 'John', email: 'john@example.com', date: '2023-08-23' },
    { name: 'Jane', email: 'jane@example.com', date: '2023-08-24' }
  ];

  columns: NgGenerateTableColumns[] = [
    { label: 'Name', field: 'name' },
    { label: 'Email', field: 'email' },
    { label: 'Date', field: 'date' }
  ];
}
```

### Custom thead, tbody, tfoot

```typescript
import { Component } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';

@Component({
  selector: 'app-custom-sections',
  standalone: true,
  imports: [NgGenerateTableComponent],
  template: `
    <ng-generate-table [columns]="columns" [data]="data">
      <thead position="top">
        <tr>
          <th colspan="3" class="text-center bg-primary text-white">
            User Report
          </th>
        </tr>
      </thead>

      <tbody position="bottom">
        <tr>
          <td colspan="3" class="text-center">
            Total Users: {{ data.length }}
          </td>
        </tr>
      </tbody>

      <tfoot>
        <tr>
          <td colspan="3" class="text-muted">
            © 2024 My Company
          </td>
        </tr>
      </tfoot>
    </ng-generate-table>
  `
})
export class CustomSectionsComponent {
  data = [
    { name: 'John', email: 'john@example.com', role: 'Admin' },
    { name: 'Jane', email: 'jane@example.com', role: 'User' }
  ];

  columns: NgGenerateTableColumns[] = [
    { label: 'Name', field: 'name' },
    { label: 'Email', field: 'email' },
    { label: 'Role', field: 'role' }
  ];
}
```

### With Bootstrap Styling

```typescript
import { Component } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';

@Component({
  selector: 'app-bootstrap-table',
  standalone: true,
  imports: [NgGenerateTableComponent],
  template: `
    <ng-generate-table 
      [columns]="columns" 
      [data]="data"
      tableClass="table table-striped table-hover table-bordered">
    </ng-generate-table>
  `
})
export class BootstrapTableComponent {
  data = [
    { name: 'John', status: 'Active', score: 95 },
    { name: 'Jane', status: 'Inactive', score: 87 }
  ];

  columns: NgGenerateTableColumns[] = [
    { label: 'Name', field: 'name' },
    { label: 'Status', field: 'status' },
    { label: 'Score', field: 'score' }
  ];
}
```

---

## 🎨 Customization

### Custom Table Classes

```html
<ng-generate-table 
  [columns]="columns" 
  [data]="data"
  tableClass="table table-striped table-hover">
</ng-generate-table>
```

### Deep Styling (if needed)

```css
::ng-deep .my-custom-header {
  background: #007bff;
  color: white;
  font-weight: bold;
}

::ng-deep .my-custom-cell {
  padding: 15px;
  font-size: 14px;
}
```

---

## 🌍 Complete Standalone Example

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { CommonModule } from '@angular/common';

interface Order {
  id: number;
  customer: string;
  amount: number;
  date: string;
  status: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgGenerateTableComponent],
  template: `
    <div class="container mt-4">
      <h1>Orders Table</h1>
      
      <ng-generate-table 
        [columns]="columns" 
        [data]="orders"
        [loading]="loading"
        [rowClickable]="true"
        (rowClick)="viewOrder($event)"
        tableClass="table table-striped table-hover">
      </ng-generate-table>
    </div>
  `,
  styles: [`
    .status-badge { padding: 5px 10px; border-radius: 15px; font-size: 12px; }
    .status-completed { background: #28a745; color: white; }
    .status-pending { background: #ffc107; color: black; }
  `]
})
export class AppComponent {
  loading = false;
  
  orders: Order[] = [
    { id: 1, customer: 'John Doe', amount: 250.50, date: '2024-01-15', status: 'completed' },
    { id: 2, customer: 'Jane Smith', amount: 180.00, date: '2024-01-16', status: 'pending' },
    { id: 3, customer: 'Bob Johnson', amount: 320.75, date: '2024-01-17', status: 'completed' }
  ];

  columns: NgGenerateTableColumns[] = [
    { label: 'ID', field: 'id', thClass: 'text-center', tdClass: 'text-center' },
    { label: 'Customer', field: 'customer' },
    { label: 'Amount', field: 'amount', pipe: CurrencyPipe, pipeArgs: ['USD', 'symbol'] },
    { label: 'Date', field: 'date', pipe: DatePipe, pipeArgs: ['dd MMM yyyy'] },
    {
      label: 'Status',
      template: (order: Order) => `
        <span class="status-badge status-${order.status}">
          ${order.status.toUpperCase()}
        </span>
      `
    },
    {
      label: 'Actions',
      isAction: true,
      template: (order: Order) => `
        <button class="btn btn-sm btn-primary">View</button>
        <button class="btn btn-sm btn-danger">Cancel</button>
      `,
      click: (order: Order, event?: MouseEvent) => {
        const target = event?.target as HTMLElement;
        if (target.textContent === 'View') {
          this.viewOrder(order);
        } else if (target.textContent === 'Cancel') {
          this.cancelOrder(order);
        }
      }
    }
  ];

  viewOrder(order: Order) {
    console.log('View order:', order);
  }

  cancelOrder(order: Order) {
    console.log('Cancel order:', order);
  }
}
```

---

## 🔒 SafeHTML Pipe

This library includes a `SafeHtmlPipe` that can be used independently to sanitize and render HTML or URLs safely.

### Import the Pipe

**Standalone:**
```typescript
import { SafeHtmlPipe } from 'ng-generate-table';

@Component({
  standalone: true,
  imports: [SafeHtmlPipe],
  // ...
})
```

**NgModule:**
```typescript
import { NgGenerateTableModule } from 'ng-generate-table';
// The pipe is automatically available when importing the module
```

### Usage Examples

**Render HTML content:**
```html
<div [innerHTML]="htmlContent | safeHtml"></div>
```

```typescript
htmlContent = '<strong>Bold text</strong> and <em>italic text</em>';
```

**Render trusted URL (for iframes):**
```html
<iframe [src]="videoUrl | safeHtml:'url'"></iframe>
```

```typescript
videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
```

**With dynamic content:**
```typescript
import { Component } from '@angular/core';
import { SafeHtmlPipe } from 'ng-generate-table';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [SafeHtmlPipe],
  template: `
    <div class="content" [innerHTML]="description | safeHtml"></div>
    <iframe [src]="videoUrl | safeHtml:'url'" width="560" height="315"></iframe>
  `
})
export class ContentComponent {
  description = '<h3>Product Details</h3><p>This is <strong>HTML</strong> content.</p>';
  videoUrl = 'https://www.youtube.com/embed/example';
}
```

### 📖 API Reference
- `string`: The HTML string or URL to sanitize
- `type?`: `'html'` (default) or `'url'`

**Returns:** Sanitized HTML or URL safe to render in Angular templates

---

## ⚠️ Important Notes

1. **Pipe imports**: When using pipes with standalone components, make sure the pipes are available in your component's imports or providers.

2. **Template functions**: The `template` function receives the row data and should return a valid HTML string.

3. **Click handlers**: The `click` function receives the row data and optionally the mouse event.

4. **Mobile view**: When `mobileView` is enabled, you can provide a custom `#cardMobile` template or use the default.

---

## 📄 License

MIT © Alvaro Marinho

## 🐛 Issues

Report issues at: https://github.com/alvaromarinho/libs/issues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.