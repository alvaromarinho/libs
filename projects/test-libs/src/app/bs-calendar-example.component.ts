import { Component, ViewChild } from '@angular/core';
import { NgBsCalendarComponent } from 'ng-bs-calendar';

@Component({
    selector: 'bs-calendar-example',
    template: `
        <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="d-flex align-items-center">
                <h1 class="fs-3 fw-light me-3 mb-0">Bootstrap Calendar</h1>
                <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode = !toggleCode">
                    <i class="bi bi-code me-1"></i> CODE
                </button>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-primary px-3" (click)="prev()">«</button>
                <button class="btn btn-sm btn-outline-primary ms-2" (click)="today()">HOJE</button>
                <button class="btn btn-sm btn-outline-primary ms-2 px-3" (click)="next()">»</button>
            </div>
        </div>
        <ng-collapse [toggle]="toggleCode">
            <div class="style-code rounded mb-3">
Typescript:
<pre><code class="language-js">calendar = [
    &#123; id: 1, title: '1', color: '#ff0000', description: 'teste', start: '{{ now }}T19:00:00', end: '{{ now }}T20:00:00'  &#125;,
    &#123; id: 2, title: '2', color: '#00ff00', description: 'teste', start: '{{ now }}T23:00:00', end: '{{ tomorrow }}T00:00:00' &#125;,
    ...
]

log($event: string) &#123;
    console.log($event)
&#125;</code></pre>
Template:
<pre><code class="language-html">&lt;ng-bs-calendar &#91;data&#93;="calendar" (changeWeek)="log($event)" (clickCell)="log($event)"&gt;&lt;/ng-bs-calendar&gt;</code></pre>
                </div>
        </ng-collapse>
        <ng-bs-calendar [data]="calendar" [showButtons]="false" (changeWeek)="log($event)" (clickCell)="log($event)"></ng-bs-calendar>
    `
})

export class BsCalendarExampleComponent {

    @ViewChild(NgBsCalendarComponent) calendarComp!: NgBsCalendarComponent;

    toggleCode: boolean = false
    yesterday = new Date(new Date().setDate(new Date().getDate()-1)).toISOString().split('T')[0];
    now = new Date().toISOString().split('T')[0];
    tomorrow = new Date(new Date().setDate(new Date().getDate()+1)).toISOString().split('T')[0];

    calendar = [
        { id: 1, title: "1", color: "#ff0000", description: "teste", start: `${this.now}T19:00:00`, end: `${this.now}T20:00:00` },
        { id: 2, title: "2", color: "#00ff00", description: "teste", start: `${this.now}T22:00:00`, end: `${this.now}T23:00:00` },
        { id: 3, title: "3", color: "#0000ff", description: "teste", start: `${this.now}T12:00:00`, end: `${this.now}T15:00:00` },
        { id: 4, title: "4", color: "#ff00ff", description: "teste", start: `${this.now}T12:30:00`, end: `${this.now}T15:00:00` },
        { id: 5, title: "5", color: "#aaaa00", description: "teste", start: `${this.now}T12:00:00`, end: `${this.now}T15:30:00` },
        { id: 6, title: "6", color: "#00ffff", description: "teste", start: `${this.yesterday}T17:00:00`, end: `${this.yesterday}T17:30:00` },
        { id: 7, title: "7", color: "#ff0000", description: "teste", start: `${this.yesterday}T16:00:00`, end: `${this.yesterday}T18:30:00` },
        { id: 8, title: "8", color: "#00ff00", description: "teste", start: `${this.yesterday}T18:30:00`, end: `${this.yesterday}T19:00:00` },
        { id: 9, title: "9", color: "#aaaa00", description: "teste", start: `${this.yesterday}T19:00:00`, end: `${this.tomorrow}T21:00:00` },
        { id: 10, title: "10", color: "#ff00ff", description: "teste", start: `${this.yesterday}T17:00:00`, end: `${this.yesterday}T18:30:00` },
        { id: 11, title: "11", color: "#aaaa00", description: "teste", start: `${this.yesterday}T11:00:00`, end: `${this.yesterday}T13:00:00` },
        { id: 12, title: "12", color: "#00ffff", description: "teste", start: `${this.yesterday}T12:00:00`, end: `${this.yesterday}T13:30:00` },
        { id: 13, title: "13", color: "#ff0000", description: "teste", start: `${this.tomorrow}T21:00:00`, end: `${this.tomorrow}T22:00:00` },
        { id: 14, title: "14", color: "#00ff00", description: "teste", start: `${this.yesterday}T17:00:00`, end: `${this.yesterday}T18:00:00` },
        { id: 15, title: "15", color: "#0000ff", description: "teste", start: `${this.tomorrow}T17:00:00`, end: `${this.tomorrow}T18:30:00` },
        { id: 16, title: "16", color: "#ff00ff", description: "teste", start: `${this.tomorrow}T14:00:00`, end: `${this.tomorrow}T20:00:00` },
        { id: 17, title: "17", color: "#aaaa00", description: "teste", start: `${this.yesterday}T12:30:00`, end: `${this.yesterday}T12:30:00` },
    ]

    log($event: any) {
        console.log($event);
    }

    prev() {
        this.calendarComp.prevWeek();
    }

    today() {
        this.calendarComp.todayWeek();
    }

    next() {
        this.calendarComp.nextWeek();
    }

}