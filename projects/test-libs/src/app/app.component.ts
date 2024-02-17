import { Component, OnInit, ViewChild } from '@angular/core';
import { NgBsCalendarComponent } from 'ng-bs-calendar';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

    @ViewChild(NgBsCalendarComponent) calendarComp!: NgBsCalendarComponent;

    loading = false;

    calendar = [
        { title: "1", color: "#ff0000", description: "teste", start: "2024-02-17T19:00:00.000Z", end: "2024-02-17T20:00:00.000Z", id: 1 },
        { title: "2", color: "#00ff00", description: "teste", start: "2024-02-17T23:00:00.000Z", end: "2024-02-18T00:00:00.000Z", id: 2 },
        { title: "3", color: "#0000ff", description: "teste", start: "2024-02-17T12:00:00.000Z", end: "2024-02-17T15:00:00.000Z", id: 3 },
        { title: "4", color: "#ff00ff", description: "teste", start: "2024-02-17T12:00:00.000Z", end: "2024-02-17T15:00:00.000Z", id: 4 },
        { title: "5", color: "#aaaa00", description: "teste", start: "2024-02-17T12:00:00.000Z", end: "2024-02-17T15:00:00.000Z", id: 5 },
        { title: "6", color: "#00ffff", description: "teste", start: "2024-02-16T17:00:00.000Z", end: "2024-02-16T17:30:00.000Z", id: 6 },
        { title: "7", color: "#ff0000", description: "teste", start: "2024-02-16T17:00:00.000Z", end: "2024-02-16T18:30:00.000Z", id: 7 },
        { title: "8", color: "#00ff00", description: "teste", start: "2024-02-16T17:00:00.000Z", end: "2024-02-16T18:00:00.000Z", id: 8 },
        { title: "9", color: "#0000ff", description: "teste", start: "2024-02-16T19:00:00.000Z", end: "2024-02-16T21:00:00.000Z", id: 9 },
        { title: "10", color: "#ff00ff", description: "teste", start: "2024-02-16T17:00:00.000Z", end: "2024-02-16T18:00:00.000Z", id: 10 },
        { title: "11", color: "#aaaa00", description: "teste", start: "2024-02-16T11:00:00.000Z", end: "2024-02-16T13:00:00.000Z", id: 11 },
        { title: "12", color: "#00ffff", description: "teste", start: "2024-02-16T12:00:00.000Z", end: "2024-02-16T13:30:00.000Z", id: 12 },
        { title: "13", color: "#ff0000", description: "teste", start: "2024-02-15T18:00:00.000Z", end: "2024-02-15T19:00:00.000Z", id: 13 },
        { title: "14", color: "#00ff00", description: "teste", start: "2024-02-16T17:00:00.000Z", end: "2024-02-16T18:00:00.000Z", id: 14 },
        { title: "15", color: "#0000ff", description: "teste", start: "2024-02-15T17:00:00.000Z", end: "2024-02-15T18:00:00.000Z", id: 15 },
        { title: "16", color: "#ff00ff", description: "teste", start: "2024-02-15T14:00:00.000Z", end: "2024-02-15T20:00:00.000Z", id: 16 },
        { title: "17", color: "#aaaa00", description: "teste", start: "2024-02-16T12:30:00.000Z", end: "2024-02-16T12:30:00.000Z", id: 17 },
        { title: "18", color: "#ff0000", description: "teste", start: "2024-02-17T12:00:00.000Z", end: "2024-02-17T15:00:00.000Z", id: 18 },
        { title: "19", color: "#00ff00", description: "teste", start: "2024-02-15T17:00:00.000Z", end: "2024-02-15T18:00:00.000Z", id: 19 },
        { title: "20", color: "#0000ff", description: "teste", start: "2024-02-15T14:30:00.000Z", end: "2024-02-15T15:30:00.000Z", id: 20 },
        { title: "21", color: "#ff00ff", description: "teste", start: "2024-02-15T14:00:00.000Z", end: "2024-02-15T15:00:00.000Z", id: 21 },
        { title: "22", color: "#aaaa00", description: "teste", start: "2024-02-15T17:30:00.000Z", end: "2024-02-15T18:30:00.000Z", id: 22 },
        { title: "23", color: "#ff0000", description: "teste", start: "2024-02-15T13:00:00.000Z", end: "2024-02-15T13:30:00.000Z", id: 23 },
        { title: "24", color: "#00ff00", description: "teste", start: "2024-02-16T01:00:00.000Z", end: "2024-02-16T02:00:00.000Z", id: 24 },
        { title: "25", color: "#0000ff", description: "teste", start: "2024-02-15T17:00:00.000Z", end: "2024-02-15T18:00:00.000Z", id: 25 },
        { title: "26", color: "#ff00ff", description: "teste", start: "2024-02-14T03:00:00.000Z", end: "2024-02-15T04:00:00.000Z", id: 26 },
        { title: "27", color: "#aaaa00", description: "teste", start: "2024-02-15T12:00:00.000Z", end: "2024-02-15T13:00:00.000Z", id: 27 },
        { title: "28", color: "#ff0000", description: "teste", start: "2024-02-14T18:30:00.000Z", end: "2024-02-14T19:30:00.000Z", id: 28 },
        { title: "29", color: "#00ff00", description: "teste", start: "2024-02-14T18:30:00.000Z", end: "2024-02-14T19:30:00.000Z", id: 29 },
        { title: "30", color: "#0000ff", description: "teste", start: "2024-02-15T12:30:00.000Z", end: "2024-02-15T13:30:00.000Z", id: 30 },
        { title: "31", color: "#ff00ff", description: "teste", start: "2024-02-13T03:00:00.000Z", end: "2024-02-13T04:00:00.000Z", id: 31 },
        { title: "32", color: "#aaaa00", description: "teste", start: "2024-02-15T21:00:00.000Z", end: "2024-02-15T22:00:00.000Z", id: 32 },
        { title: "33", color: "#ff0000", description: "teste", start: "2024-02-12T03:00:00.000Z", end: "2024-02-12T03:00:00.000Z", id: 33 },
        { title: "34", color: "#00ff00", description: "teste", start: "2024-02-11T13:00:00.000Z", end: "2024-02-13T14:30:00.000Z", id: 34 },
        { title: "35", color: "#0000ff", description: "teste", start: "2024-02-15T12:00:00.000Z", end: "2024-02-15T13:00:00.000Z", id: 35 },
        { title: "36", color: "#ff00ff", description: "teste", start: "2024-02-12T13:00:00.000Z", end: "2024-02-12T14:00:00.000Z", id: 36 },
        { title: "37", color: "#aaaa00", description: "teste", start: "2024-02-14T22:00:00.000Z", end: "2024-02-14T23:00:00.000Z", id: 37 },
        { title: "38", color: "#00ff00", description: "teste", start: "2024-02-15T21:00:00.000Z", end: "2024-02-15T22:00:00.000Z", id: 38 },
        { title: "39", color: "#ff0000", description: "teste", start: "2024-02-12T21:00:00.000Z", end: "2024-02-12T23:00:00.000Z", id: 39 }
    ]

    ngOnInit() {
        // console.log(this.calendar)
    }

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
