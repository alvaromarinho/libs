import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DateTime } from "luxon";
import { Tooltip } from 'bootstrap';

export interface CalendarData {
    id: any;
    start: string;
    end: string;
    title: string;
    color: string;
}

interface CalendarDataFull extends CalendarData {
    _index?: number;
    _startNow?: boolean;
    _endNow?: boolean;
    _size?: number;
}

interface ScheduleDay {
    label: string;
    allDay: any;
    hours: any;
}

interface Schedule {
    next: string;
    prev: string;
    startWeek: string;
    week: ScheduleDay[];
}

const date = (string: string) => DateTime.fromISO(string);
const hours30min = Array(24 * 2).fill(0).map((_, i) => (`${~~(i / 2)}`.padStart(2, '0') + ':' + `${60 * (i / 2 % 1)}`.padStart(2, '0')));

@Component({
    selector: 'ng-bs-calendar',
    templateUrl: './ng-bs-calendar.component.html',
    styleUrls: ['./ng-bs-calendar.component.css']
})
export class NgBsCalendarComponent implements OnInit {

    today = DateTime.now().toFormat('yyyy-MM-dd');
    protected schedule = {} as Schedule;
    protected scheduleFlat: any[] = [];
    protected hours = [null, null, ...hours30min]

    @Input() loading = false;
    @Input() data!: CalendarDataFull[];
    @Input() start = date(this.today).startOf('week').minus({ day: 1 }).toFormat('yyyy-MM-dd');
    @Input() showButtons = true;
    @Output() clickCell = new EventEmitter<any>();
    @Output() changeWeek = new EventEmitter<any>();

    constructor() {
        new Tooltip(document.body, {
            selector: '[data-bs-toggle="tooltip"]',
            container: 'body',
            placement: 'top',
        });
    }

    ngOnInit() {
        // verificando overlap para setar o tamanho
        this.data = this.data.sort((a, b) => date(a.start).diff(date(a.end)).toMillis() == date(b.start).diff(date(b.end)).toMillis() ? -1 : date(a.start).toMillis() - date(b.start).toMillis());
        this.data.map((d1: CalendarDataFull) => {
            d1._size = 0;
            this.data.map((d2: CalendarDataFull) => this.overlaps(d1, d2) ? d1._size!++ : d1._size)
        })
        this.setSchedule();
    }

    prevWeek() {
        this.changeWeek.emit({
            start: date(this.schedule.prev).startOf('week').minus({ day: 1 }).toFormat('yyyy-MM-dd'),
            end: date(this.schedule.prev).endOf('week').minus({ day: 1 }).toFormat('yyyy-MM-dd')
        })
        this.setSchedule(this.schedule.prev);
    }

    todayWeek() {
        this.changeWeek.emit({
            start: date(this.today).startOf('week').minus({ day: 1 }).toFormat('yyyy-MM-dd'),
            end: date(this.today).endOf('week').minus({ day: 1 }).toFormat('yyyy-MM-dd')
        })
        this.setSchedule(this.today);
    }

    nextWeek() {
        this.changeWeek.emit({
            start: date(this.schedule.next).startOf('week').minus({ day: 1 }).toFormat('yyyy-MM-dd'),
            end: date(this.schedule.next).endOf('week').minus({ day: 1 }).toFormat('yyyy-MM-dd')
        })
        this.setSchedule(this.schedule.next);
    }

    protected getIndexPosition(obj: CalendarDataFull, index: number) {
        obj._index = this.scheduleFlat.find((d: CalendarDataFull) => d.id == obj.id)._index || index;
        return obj._index!;
    }

    protected setSchedule(start = this.start) {
        start = date(start).plus({ day: 1 }).toFormat('yyyy-MM-dd');

        this.schedule.prev = date(start).startOf('week').minus({ day: 2 }).toFormat('yyyy-MM-dd');
        this.schedule.next = date(start).startOf('week').plus({ day: 7 }).toFormat('yyyy-MM-dd');
        this.schedule.startWeek = date(start).startOf('week').minus({ day: 1 }).toFormat('yyyy-MM-dd');
        this.schedule.week = [];

        const hours = hours30min.reduce((accumulator, value, index) => ({ ...accumulator, [value!]: undefined }), {})
        for (let i = 0; i < 7; i++) {
            const day = date(this.schedule.startWeek).plus({ day: i }).toFormat('yyyy-MM-dd');
            this.schedule.week.push({ label: day, hours: { ...hours }, allDay: [] });
        }

        this.schedule.week.map((day: ScheduleDay) => {
            this.data.map((d: CalendarData) => {
                const isStartDay = day.label == date(d.start).toFormat('yyyy-MM-dd') && date(d.start).toFormat('HH:mm:ss') != '00:00:00';
                const isEndDay = day.label == date(d.end).toFormat('yyyy-MM-dd');
                const isBetweenStartEnd = date(day.label).toMillis() >= date(d.start).toMillis() && date(day.label).toMillis() < date(d.end).toMillis();
                const isStartEqualsEnd = date(d.start).toFormat('yyyy-MM-dd') == date(d.end).toFormat('yyyy-MM-dd');

                if (isStartDay && isStartEqualsEnd) { // começa e termina no mesmo dia
                    this.setInDay(day, d, (hour: number) => +hour >= +date(d.start).toFormat('HHmm') && +hour < +date(d.end).toFormat('HHmm'));
                }
                if (isStartDay && !isStartEqualsEnd) { // começa nesse dia e termina em outro
                    this.setInDay(day, d, (hour: number) => +hour >= +date(d.start).toFormat('HHmm'));
                }
                if (isEndDay && !isStartEqualsEnd) { // começa em outro dia e termina nesse dia
                    this.setInDay(day, d, (hour: number) => +hour < +date(d.end).toFormat('HHmm'));
                }
                else if (isBetweenStartEnd) { // começa em outro dia e termina em outro dia
                    day.allDay.push(d)
                }
            })
        });

        this.scheduleFlat = this.schedule.week.map((day: ScheduleDay) => day.hours).map((hour: any) => Object.values(hour)).flat().filter(Boolean).flat();
    }

    protected getTooltipHtml(data: CalendarDataFull) {
        return `
            <div class='text-start'>
                <span class="d-inline-block lh-sm">${data.title}</span><br>
                <hr class="my-1">
                <b>Inicio</b>: ${date(data.start).toFormat('dd/MM/yyyy HH:mm')}<br>
                <b>Fim</b>: ${date(data.end).toFormat('dd/MM/yyyy HH:mm')}<br>
            </div>
        `
    }

    private setInDay(day: { label: string; hours: any; }, obj: any, condition: Function) {
        Object.entries(day.hours).map(([key, value]) => {
            const hour = key.replace(':', '');
            if (condition(hour))
                this.setInHour(obj, day, key);
        });
    }

    private setInHour(obj: any, day: { label: string; hours: any; }, key: string) {
        const _startNow = day.label == date(obj.start).toFormat('yyyy-MM-dd') && key == date(obj.start).toFormat('HH:mm');
        const _endNow = day.label == date(obj.end).toFormat('yyyy-MM-dd') && key == date(obj.end).minus({ minute: 30 }).toFormat('HH:mm');

        day.hours[key] = day.hours[key] || [];
        day.hours[key].push({ ...obj, _startNow, _endNow });
    }

    private overlaps(a: CalendarDataFull, b: CalendarDataFull) {
        const aStart = new Date(a.start).getTime();
        const aEnd = new Date(a.end).getTime();
        const bStart = new Date(b.start).getTime();
        const bEnd = new Date(b.end).getTime();

        // DEBUG
        // if (a.id == 16) {
        //     if (
        //         date(b.start).toFormat('yyyy-MM-dd') == date(b.end).toFormat('yyyy-MM-dd') && 
        //         (date(a.start).toFormat('yyyy-MM-dd') == date(b.start).toFormat('yyyy-MM-dd') || date(a.end).toFormat('yyyy-MM-dd') == date(b.end).toFormat('yyyy-MM-dd'))
        //     ) {
        //         if (aStart <= bStart && aEnd <= bEnd && aEnd > bStart) console.log(b.id, 'aStart <= bStart && aEnd <= bEnd && aEnd > bStart');
        //         else if (aStart >= bStart && aEnd >= bEnd && aStart < bEnd) console.log(b.id, 'aStart >= bStart && aEnd >= bEnd && aStart < bEnd');
        //         else if (aStart <= bStart && aEnd >= bEnd) console.log(b.id, 'aStart <= bStart && aEnd >= bEnd');
        //         else if (bStart <= aStart && bEnd >= aEnd) console.log(b.id, 'bStart <= aStart && bEnd >= aEnd');
        //     }
        // }

        // verificando se o overlap é no mesmo dia
        if (
            date(b.start).toFormat('yyyy-MM-dd') == date(b.end).toFormat('yyyy-MM-dd') &&
            (date(a.start).toFormat('yyyy-MM-dd') == date(b.start).toFormat('yyyy-MM-dd') || date(a.end).toFormat('yyyy-MM-dd') == date(b.end).toFormat('yyyy-MM-dd'))
        ) {
            if (aStart <= bStart && aEnd <= bEnd && aEnd > bStart) return true; // a ends in b
            if (aStart >= bStart && aEnd >= bEnd && aStart < bEnd) return true; // a starts in b
            if (aStart <= bStart && aEnd >= bEnd) return true; // a in b
            if (bStart <= aStart && bEnd >= aEnd) return true; // b in a
        }

        return false;
    };
}
