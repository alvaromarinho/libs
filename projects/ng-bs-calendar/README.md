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

## Usage

Data source:
```js

calendar = [{
    id: 123,
    start: '2023-11-21T09:00:00',
    end: '2023-11-21T14:00:00',
    title: 'title 1',
    description: 'description 1',
    color: '#ff0000cc'
}, {
    id: 456,
    start: '2023-11-23T13:00:00',
    end: '2023-11-25T17:00:00',
    title: 'title 2',
    description: 'description 2',
    color: '#0000ffcc'
}]

log($event: any) {
    console.log($event)
}
```

In template:
```html
<ng-bs-calendar [data]="calendar" [loading]="loading" (changeWeek)="log($event)" (clickCell)="log($event)">
    <h1>Simple example</h1>
</ng-bs-calendar>
```