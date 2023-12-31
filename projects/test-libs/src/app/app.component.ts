import { Component, OnInit, ViewChild } from '@angular/core';
import { DateTime } from 'luxon';
import { NgBsCalendarComponent } from 'ng-bs-calendar';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

    @ViewChild(NgBsCalendarComponent) calendarComp!: NgBsCalendarComponent;

    loading = false;

    calendar = [{
        id: 123,
        start: DateTime.now().minus({ day: 1, hour: 2 }).toFormat("yyyy-MM-dd'T'HH") + '00:00',
        end: DateTime.now().plus({ day: 1, hour: 3 }).toFormat("yyyy-MM-dd'T'HH") + '00:00',
        title: 'title 1',
        description: 'description 1',
        color: '#ff0000cc'
    }, {
        id: 456,
        start: DateTime.now().toFormat("yyyy-MM-dd'T'HH") + '00:00',
        end: DateTime.now().plus({ hour: 2 }).toFormat("yyyy-MM-dd'T'HH") + '00:00',
        title: 'title 2',
        description: 'description 2',
        color: '#0000ffcc'
    }]

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
