# ng-bs-calendar

[![npm version](https://badge.fury.io/js/ng-bs-calendar.svg)](https://www.npmjs.com/package/ng-bs-calendar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Calendar component for Angular and Bootstrap 5 with scheduling support using Luxon.

## ✨ Features

- 📅 Weekly calendar view
- 🎨 Customizable event colors
- ⏰ 30-minute time slots
- 📱 Responsive design with Bootstrap 5
- 🔄 Week navigation
- 📍 Click events on calendar cells
- 🌐 Internationalization support
- ⚡ **Standalone component support** (Angular 14+)
- 🔧 **NgModule compatible** (backward compatible)

## 🔧 Compatibility

| ng-bs-calendar | Angular       | Bootstrap | Luxon | Standalone |
|----------------|---------------|-----------|-------|------------|
| 1.0.x          | 14.x - 21.x   | 5.x       | 3.x   | ✅ Yes     |
| 0.0.x          | 15.x          | 5.x       | 3.x   | ❌ No      |

## 📦 Installation

### NPM
```bash
npm install --save ng-bs-calendar
```

### YARN
```bash
yarn add ng-bs-calendar
```

### Peer Dependencies

This library requires:
```json
{
  "bootstrap": "^5.0.0",
  "luxon": "^3.0.0"
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
import { Component } from '@angular/core';
import { NgBsCalendarComponent, CalendarData } from 'ng-bs-calendar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgBsCalendarComponent],
  template: `
    <ng-bs-calendar 
      [data]="calendar" 
      [loading]="loading" 
      [start]="'2024-11-25'" 
      [showButtons]="true" 
      (changeWeek)="onWeekChange($event)" 
      (clickCell)="onCellClick($event)">
      <h1>My Calendar</h1>
    </ng-bs-calendar>
  `
})
export class AppComponent {
  calendar: CalendarData[] = [
    {
      id: 123,
      start: '2024-11-21T09:00:00',
      end: '2024-11-21T14:00:00',
      title: 'Meeting with team',
      color: '#ff0000'
    },
    {
      id: 456,
      start: '2024-11-23T13:00:00',
      end: '2024-11-25T17:00:00',
      title: 'Project deadline',
      color: '#0000ff'
    }
  ];

  loading = false;

  onWeekChange(event: { start: string; end: string }) {
    console.log('Week changed:', event);
  }

  onCellClick(event: CalendarData) {
    console.log('Cell clicked:', event);
  }
}
```

**main.ts (Standalone App):**
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    // Your providers here
  ]
});
```

---

### Method 2: NgModule (Traditional) 🔧

**Step 1: Import the module**

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgBsCalendarModule } from 'ng-bs-calendar';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgBsCalendarModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

**Step 2: Use in your component**

**app.component.ts:**
```typescript
import { Component } from '@angular/core';
import { CalendarData } from 'ng-bs-calendar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  calendar: CalendarData[] = [
    {
      id: 123,
      start: '2024-11-21T09:00:00',
      end: '2024-11-21T14:00:00',
      title: 'Meeting with team',
      color: '#ff0000'
    },
    {
      id: 456,
      start: '2024-11-23T13:00:00',
      end: '2024-11-25T17:00:00',
      title: 'Project deadline',
      color: '#0000ff'
    }
  ];

  loading = false;

  onWeekChange(event: { start: string; end: string }) {
    console.log('Week changed:', event);
  }

  onCellClick(event: CalendarData) {
    console.log('Cell clicked:', event);
  }
}
```

**app.component.html:**
```html
<ng-bs-calendar 
  [data]="calendar" 
  [loading]="loading" 
  start="2024-11-25" 
  [showButtons]="true" 
  (changeWeek)="onWeekChange($event)" 
  (clickCell)="onCellClick($event)">
  <h1>My Calendar</h1>
</ng-bs-calendar>
```

---

## 📖 API Reference

### Inputs

| Input         | Type              | Default      | Description |
|---------------|-------------------|--------------|-------------|
| `data`        | `CalendarData[]`  | `[]`         | Array of calendar events |
| `loading`     | `boolean`         | `false`      | Shows loading state |
| `start`       | `string`          | current week | Start date in 'YYYY-MM-DD' format |
| `showButtons` | `boolean`         | `true`       | Show/hide navigation buttons |

### Outputs

| Output        | Type | Description |
|---------------|------|-------------|
| `changeWeek`  | `{ start: string, end: string }` | Emitted when week changes |
| `clickCell`   | `CalendarData` | Emitted when a calendar cell is clicked |

### CalendarData Interface

```typescript
interface CalendarData {
  id: any;                    // Unique identifier
  start: string;              // Start date/time (ISO format: 'YYYY-MM-DDTHH:mm:ss')
  end: string;                // End date/time (ISO format: 'YYYY-MM-DDTHH:mm:ss')
  title: string;              // Event title
  color: string;              // Event color (hex, rgb, or named color)
  description?: string;       // Optional description
}
```

## 🌍 Internationalization

The calendar respects your application's locale configuration.

### Standalone App

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { AppComponent } from './app/app.component';

registerLocaleData(localePt);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
});
```

### NgModule App

```typescript
import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

@NgModule({
  // ...
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
})
export class AppModule {}
```

## 💡 Examples

### Dynamic Data Loading

```typescript
import { Component, OnInit } from '@angular/core';
import { NgBsCalendarComponent, CalendarData } from 'ng-bs-calendar';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [NgBsCalendarComponent],
  template: `
    <ng-bs-calendar 
      [data]="events" 
      [loading]="loading"
      (changeWeek)="loadWeek($event)">
    </ng-bs-calendar>
  `
})
export class CalendarComponent implements OnInit {
  events: CalendarData[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadWeek({ start: '2024-11-20', end: '2024-11-26' });
  }

  loadWeek(week: { start: string; end: string }) {
    this.loading = true;
    this.http.get<CalendarData[]>(`/api/events?start=${week.start}&end=${week.end}`)
      .subscribe(events => {
        this.events = events;
        this.loading = false;
      });
  }
}
```

### Custom Styling

```css
/* Override calendar colors */
ng-bs-calendar {
  --calendar-border-color: #dee2e6;
  --calendar-header-bg: #f8f9fa;
  --calendar-cell-hover: #e9ecef;
}
```

## 📄 License

MIT © Alvaro Marinho

## 🐛 Issues

Report issues at: https://github.com/alvaromarinho/libs/issues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.