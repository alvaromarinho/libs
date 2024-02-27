# NgBsCalendar
Calendar for Angular and Bootstrap 5

## Getting started
### Step 1: Install `ng-bs-calendar`

#### NPM
```shell
npm install --save ng-bs-calendar
```
#### YARN
```shell
yarn add ng-bs-calendar
```
### Step 2: Import the NgBsCalendarModule
```js
import { NgBsCalendarModule } from 'ng-bs-calendar';

@NgModule({
  declarations: [...],
  imports: [NgBsCalendarModule],
  bootstrap: [...]
})
export class AppModule {}
```

#### Dependencies

```js
"bootstrap": "^5.3.2",
"luxon": "^3.4.4"
```

## Usage

Data source:
```js

calendar: CalendarData[] = [{
    id: 123,
    start: '2023-11-21T09:00:00',
    end: '2023-11-21T14:00:00',
    title: 'title 1',
    color: '#ff0000'
}, {
    id: 456,
    start: '2023-11-23T13:00:00',
    end: '2023-11-25T17:00:00',
    title: 'title 2',
    color: '#0000ff'
}]

log($event: any) {
    console.log($event)
}
```

In template:
```html
<ng-bs-calendar [data]="calendar" [loading]="loading" start="2023-11-25" [showButtons]="true" (changeWeek)="log($event)" (clickCell)="log($event)">
    <h1>Simple example</h1>
</ng-bs-calendar>
```


## API
### Input [data]
```js

// date format: 'YYYY-MM-DDTHH:mm:ss'

CalendarData[] = [{
    id: any,
    start: string,
    end: string,
    title: string,
    description: string,
    color: string,
}]
```

### Outputs

| Output        | Return |
| ------------- | ------ |
| (changeWeek)  | { start: string, end: string } |
| (clickCell)   | CalendarData |