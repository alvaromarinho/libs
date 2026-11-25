import { AfterViewInit, Component, signal, viewChild } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import dayjs from 'dayjs';
import { BreakHour, CalendarView, NgBsCalendarComponent } from 'ng-bs-calendar';
import { NgCollapseComponent } from 'ng-collapse';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';

declare const Prism: any;

@Component({
    selector: 'bs-calendar-example',
    standalone: true,
    imports: [NgBsCalendarComponent, NgCollapseComponent, PageHeaderComponent, JsonPipe, FormsModule],
    templateUrl: './ng-bs-calendar.component.html'
})
export class BsCalendarExampleComponent implements AfterViewInit {

    readonly calendarComp = viewChild.required(NgBsCalendarComponent);

    toggleCode = signal(false);
    lastEvent = signal<any>(null);
    view = signal<CalendarView>('week');
    businessHours = signal(false);
    slotMinutes = signal(30);
    lunchBreak = signal(false);
    protected readonly lunchBreakHours: BreakHour[] = [{ start: '12:00', end: '13:00' }];
    protected readonly noBreakHours: BreakHour[] = [];

    // dayjs (fuso local) — igual ao que ng-bs-calendar usa internamente pro "hoje";
    // Date.toISOString() usaria UTC e desalinharia perto da meia-noite local
    yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    now       = dayjs().format('YYYY-MM-DD');
    tomorrow  = dayjs().add(1, 'day').format('YYYY-MM-DD');

    calendar = [
        { id: 1,  title: '1',  color: '#ff0000', start: `${this.now}T19:00:00`,       end: `${this.now}T20:00:00` },
        { id: 2,  title: '2',  color: '#00ff00', start: `${this.now}T22:00:00`,       end: `${this.now}T23:00:00` },
        { id: 3,  title: '3',  color: '#0000ff', start: `${this.now}T12:00:00`,       end: `${this.now}T15:00:00` },
        { id: 4,  title: '4',  color: '#ff00ff', start: `${this.now}T12:30:00`,       end: `${this.now}T15:00:00` },
        { id: 5,  title: '5',  color: '#aaaa00', start: `${this.now}T12:00:00`,       end: `${this.now}T15:30:00` },
        { id: 6,  title: '6',  color: '#00ffff', start: `${this.yesterday}T17:00:00`, end: `${this.yesterday}T17:30:00` },
        { id: 7,  title: '7',  color: '#ff0000', start: `${this.yesterday}T16:00:00`, end: `${this.yesterday}T18:30:00` },
        { id: 8,  title: '8',  color: '#00ff00', start: `${this.yesterday}T18:30:00`, end: `${this.yesterday}T19:00:00` },
        { id: 9,  title: '9',  color: '#aaaa00', start: `${this.yesterday}T19:00:00`, end: `${this.tomorrow}T21:00:00` },
        { id: 10, title: '10', color: '#ff00ff', start: `${this.yesterday}T17:00:00`, end: `${this.yesterday}T18:30:00` },
        { id: 11, title: '11', color: '#aaaa00', start: `${this.yesterday}T11:00:00`, end: `${this.yesterday}T13:00:00` },
        { id: 12, title: '12', color: '#00ffff', start: `${this.yesterday}T12:00:00`, end: `${this.yesterday}T13:30:00` },
        { id: 13, title: '13', color: '#ff0000', start: `${this.tomorrow}T21:00:00`,  end: `${this.tomorrow}T22:00:00` },
        { id: 14, title: '14', color: '#00ff00', start: `${this.yesterday}T17:00:00`, end: `${this.yesterday}T18:00:00` },
        { id: 15, title: '15', color: '#0000ff', start: `${this.tomorrow}T17:00:00`,  end: `${this.tomorrow}T18:30:00` },
        { id: 16, title: '16', color: '#ff00ff', start: `${this.tomorrow}T14:00:00`,  end: `${this.tomorrow}T20:00:00` },
        { id: 17, title: '17', color: '#aaaa00', start: `${this.yesterday}T12:30:00`, end: `${this.yesterday}T12:30:00` },
    ];

    ngAfterViewInit() {
        Prism.highlightAll();
    }

    prev()  { this.calendarComp().prevWeek(); }
    today() { this.calendarComp().todayWeek(); }
    next()  { this.calendarComp().nextWeek(); }
}
