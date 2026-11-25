# ng-bs-calendar

[![npm version](https://badge.fury.io/js/ng-bs-calendar.svg)](https://www.npmjs.com/package/ng-bs-calendar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Calendar component for Angular and Bootstrap 5 with scheduling support using dayjs.

## ✨ Features

- 📅 Weekly calendar view
- 🎨 Customizable event colors
- ⏰ 30-minute time slots
- 📱 Responsive design with Bootstrap 5
- 🔄 Week navigation
- 📍 Click events on calendar cells
- 🌐 Internationalization support
- ⚡ **Signals and zoneless** - Signal inputs, works with or without zone.js (Angular 18+)
- 🔧 **NgModule compatible** (backward compatible)

## 🔧 Compatibility

| ng-bs-calendar | Angular       | Bootstrap | Date lib     | Standalone |
|----------------|---------------|-----------|--------------|------------|
| 2.x            | 18.x - 22.x   | 5.x       | dayjs 1.11.x | ✅ Yes     |
| 1.3.x - 1.4.x  | 14.x - 22.x   | 5.x       | dayjs 1.11.x | ✅ Yes     |
| 1.2.x          | 14.x - 22.x   | 5.x       | dayjs 1.11.x | ✅ Yes     |
| 1.0.x - 1.1.x  | 14.x - 22.x   | 5.x       | Luxon 3.x    | ✅ Yes     |
| 0.0.x          | 15.x          | 5.x       | Luxon 3.x    | ❌ No      |

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
  "dayjs": "^1.11.0"
}
```

> ⚠️ **Breaking change in 1.2.0**: the peer dependency switched from Luxon to dayjs.
> If you're upgrading from 1.0.x/1.1.x, install `dayjs` and remove `luxon` (unless
> another part of your app still needs it). The public API (`CalendarData`, inputs,
> outputs) is unchanged — only the internal date library differs.

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

### Method 1: Standalone Component (Angular 18+) ⚡ Recommended

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
      (clickCell)="onCellClick($event)"
      (clickEmptyCell)="onEmptyCellClick($event)">
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

  onEmptyCellClick(event: { day: string; hour: string }) {
    console.log('Empty cell clicked:', event); // e.g. open a create-event form prefilled with day/hour
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

  onEmptyCellClick(event: { day: string; hour: string }) {
    console.log('Empty cell clicked:', event); // e.g. open a create-event form prefilled with day/hour
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
| `data`        | `CalendarData[]`  | `[]`         | Array of calendar events. Reactive — can be replaced after init (e.g. `[data]="events$ \| async"` resolving, or the host refetching after `changeWeek`); the grid recomputes overlap sizing and redraws. The objects you pass are not modified. Doesn't re-emit `changeWeek` on its own (that'd loop back into the fetch that changed `data`). |
| `loading`     | `boolean`         | `false`      | Shows loading state |
| `start`       | `string`          | current week (today in `view: 'day'`) | Start date in 'YYYY-MM-DD' format. Read once on init; navigate with the buttons afterwards. |
| `showButtons` | `boolean`         | `true`       | Show/hide navigation buttons |
| `view`        | `'week' \| 'day'` | `'week'`     | Grid mode — `'day'` shows a single day filling the available width (no forced horizontal scroll), navigating one day at a time. The library doesn't auto-switch by viewport; bind it yourself, e.g. `[view]="isMobile() ? 'day' : 'week'"` from `BreakpointObserver`. Reactive — can be toggled after init; toggling re-anchors on the day currently visible (not necessarily "today") and re-emits `changeWeek` for the new range. A `CalendarView` type (`'week' | 'day'`) is exported for typing your own state. |

### Outputs

| Output          | Type | Description |
|-----------------|------|-------------|
| `changeWeek`     | `{ start: string, end: string }` | Emitted when the visible range changes — on navigation (`prevWeek`/`todayWeek`/`nextWeek`) and whenever `view` toggles. Fetch/update `data` for `[start, end]` when this fires. |
| `clickCell`      | `CalendarData` | Emitted when a cell/event with data is clicked |
| `clickEmptyCell` | `{ day: string, hour: string }` | Emitted when an empty hour-slot cell is clicked (mouse or keyboard — Enter/Space) — `day` (`yyyy-MM-dd`) and `hour` (`HH:mm`) identify the clicked slot, useful for opening a create-event form prefilled with that date/time. The clicked cell also gets a `.cell-selected` border, so the user can see which slot they picked; it stays until another empty cell is clicked. |

### Upgrading from 1.x

2.0 uses signal inputs and derives the grid with `computed`, so it renders in zoneless apps (Angular 22 default); it still works with zone.js.

- Template bindings and outputs don't change. `prevWeek()`, `todayWeek()` and `nextWeek()` stay public.
- Setting an input from code (`ref.instance.data = events`) no longer works: use `ref.setInput('data', events)`.
- The component no longer writes `_size` into the event objects you pass in `data` (it works on copies), so `clickCell` emits a copy: compare by `id`, not by reference; and `null` in `[data]` (async pipe before it resolves) is treated as `[]`.
- `today` and the internal grid fields (`schedule`, `scheduleFlat`, `hours`, ...) are no longer public.
- Angular 14 to 17 stay on 1.x.

### CalendarData Interface

```typescript
interface CalendarData {
  id: any;                    // Unique identifier
  start: string;              // Start date/time (ISO format: 'YYYY-MM-DDTHH:mm:ss')
  end: string;                // End date/time (ISO format: 'YYYY-MM-DDTHH:mm:ss')
  title: string;              // Event title
  color: string;              // Event color (hex, rgb, or named color)
  description?: string;       // Optional description, shown in the event tooltip below the title
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

The grid borders and sticky header background follow Bootstrap's own theme variables
(`--bs-border-color`, `--bs-body-bg` via the `bg-body` utility class), so they already
adapt to Bootstrap 5.3's `data-bs-theme="dark"` on an ancestor element. Override them
like any other Bootstrap variable:

```css
/* Override calendar colors */
ng-bs-calendar {
  --bs-border-color: #dee2e6;
  --bs-body-bg: #f8f9fa;
}
```

## 📄 License

MIT © Alvaro Marinho

## 🐛 Issues

Report issues at: https://github.com/alvaromarinho/libs/issues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.