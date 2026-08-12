import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostBinding, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, SimpleChanges, inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Tooltip } from 'bootstrap';

dayjs.extend(isoWeek);

export type CalendarView = 'week' | 'day';

export interface CalendarData {
    id: any;
    start: string;
    end: string;
    title: string;
    color: string;
    description?: string;
}

interface CalendarDataFull extends CalendarData {
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

const date = (string: string) => dayjs(string);
const hours30min = Array(24 * 2).fill(0).map((_, i) => (`${~~(i / 2)}`.padStart(2, '0') + ':' + `${60 * (i / 2 % 1)}`.padStart(2, '0')));

const escapeHtml = (value: string) => (value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]!));

@Component({
    selector: 'ng-bs-calendar',
    imports: [CommonModule],
    templateUrl: './ng-bs-calendar.component.html',
    styleUrls: ['./ng-bs-calendar.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgBsCalendarComponent implements OnInit, OnChanges, OnDestroy {

    today = dayjs().format('YYYY-MM-DD');
    protected schedule = {} as Schedule;
    protected scheduleFlat: any[] = [];
    protected hours = [null, null, ...hours30min]

    private positionCache = new Map<any, number>();
    private tooltip?: Tooltip;
    private platformId = inject(PLATFORM_ID);

    protected selectedEmptyCell: { day: string; hour: string } | null = null;

    @Input() loading = false;
    @Input() data!: CalendarDataFull[];
    @Input() start = date(this.today).startOf('isoWeek').subtract(1, 'day').format('YYYY-MM-DD');
    @Input() showButtons = true;
    @Input() view: CalendarView = 'week';
    @Output() clickCell = new EventEmitter<any>();
    @Output() clickEmptyCell = new EventEmitter<{ day: string; hour: string }>();
    @Output() changeWeek = new EventEmitter<any>();

    @HostBinding('class.cal-day-view') protected get isDayView() {
        return this.view === 'day';
    }

    protected get daysCount() {
        return this.view === 'day' ? 1 : 7;
    }

    protected get gridCols() {
        return Array(this.daysCount + 1);
    }

    constructor(private cdr: ChangeDetectorRef) {
        if (isPlatformBrowser(this.platformId)) {
            this.tooltip = new Tooltip(document.body, {
                selector: '[data-bs-toggle="tooltip"]',
                container: 'body',
                placement: 'top',
            });
        }
    }

    ngOnInit() {
        if (!this.data || !Array.isArray(this.data)) {
            this.data = [];
        }

        this.positionCache.clear();
        this._processData();
        this.setSchedule();
        this.cdr.markForCheck();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['view'] && !changes['view'].firstChange) {
            this.setSchedule(this.schedule.week?.[0]?.label ?? this.start);
            this.emitChangeWeek();
            this.cdr.markForCheck();
        }
        if (changes['data'] && !changes['data'].firstChange) {
            if (!this.data || !Array.isArray(this.data)) {
                this.data = [];
            }
            this.positionCache.clear();
            this._processData();
            this.setSchedule(this.schedule.week?.[0]?.label ?? this.start);
            this.cdr.markForCheck();
        }
    }

    // sort + overlap sizing de `data` — chamado no init e sempre que `data` muda (ex: `[data]="events$ | async"`)
    private _processData() {
        this.data = [...this.data].sort((a, b) => date(a.start).valueOf() - date(b.start).valueOf());
        this.data.map((d1: CalendarDataFull) => {
            d1._size = 0;
            this.data.map((d2: CalendarDataFull) => this.overlaps(d1, d2) ? d1._size!++ : d1._size)
        })
    }

    ngOnDestroy() {
        this.tooltip?.dispose();
    }

    prevWeek() {
        this.setSchedule(this.schedule.prev);
        this.emitChangeWeek();
        this.cdr.markForCheck();
    }

    todayWeek() {
        this.setSchedule(this.today);
        this.emitChangeWeek();
        this.cdr.markForCheck();
    }

    nextWeek() {
        this.setSchedule(this.schedule.next);
        this.emitChangeWeek();
        this.cdr.markForCheck();
    }

    private emitChangeWeek() {
        this.changeWeek.emit({
            start: this.schedule.week[0].label,
            end: this.schedule.week[this.schedule.week.length - 1].label
        });
    }

    protected onEmptyCellClick(day: string, hour: string) {
        this.selectedEmptyCell = { day, hour };
        this.clickEmptyCell.emit({ day, hour });
    }

    protected getIndexPosition(obj: CalendarDataFull, index: number) {
        if (!this.positionCache.has(obj.id)) {
            this.positionCache.set(obj.id, index);
        }
        return this.positionCache.get(obj.id)!;
    }

    protected setSchedule(start = this.start) {
        const daysCount = this.daysCount;

        if (daysCount === 7) {
            // semana: alinhamento Monday-start (isoWeek) exibido como Sunday-start —
            // o +1 day abaixo alinha o `start` recebido nesse esquema; não simplificar
            // sem reconferir os boundaries testados no spec.
            const aligned = date(start).add(1, 'day').format('YYYY-MM-DD');
            this.schedule.prev = date(aligned).startOf('isoWeek').subtract(2, 'day').format('YYYY-MM-DD');
            this.schedule.next = date(aligned).startOf('isoWeek').add(7, 'day').format('YYYY-MM-DD');
            this.schedule.startWeek = date(aligned).startOf('isoWeek').subtract(1, 'day').format('YYYY-MM-DD');
        } else {
            // dia: sem alinhamento de semana, navega 1 dia por vez a partir do próprio start
            this.schedule.prev = date(start).subtract(1, 'day').format('YYYY-MM-DD');
            this.schedule.next = date(start).add(1, 'day').format('YYYY-MM-DD');
            this.schedule.startWeek = start;
        }
        this.schedule.week = [];

        const hours = hours30min.reduce((accumulator, value, index) => ({ ...accumulator, [value!]: undefined }), {})
        for (let i = 0; i < daysCount; i++) {
            const day = date(this.schedule.startWeek).add(i, 'day').format('YYYY-MM-DD');
            this.schedule.week.push({ label: day, hours: { ...hours }, allDay: [] });
        }

        this.schedule.week.map((day: ScheduleDay) => {
            this.data.map((d: CalendarData) => {
                const startDate = date(d.start).format('YYYY-MM-DD');
                const endDate = date(d.end).format('YYYY-MM-DD');
                const isStartDay = day.label == startDate && date(d.start).format('HH:mm:ss') != '00:00:00';
                const isEndDay = day.label == endDate;
                const isBetweenStartEnd = date(day.label).valueOf() >= date(d.start).valueOf() && date(day.label).valueOf() < date(d.end).valueOf();
                const isStartEqualsEnd = startDate == endDate;

                if (isStartDay && isStartEqualsEnd) { // começa e termina no mesmo dia
                    this.setInDay(day, d, (hour: string) => +hour >= +date(d.start).format('HHmm') && +hour < +date(d.end).format('HHmm'));
                }
                if (isStartDay && !isStartEqualsEnd) { // começa nesse dia e termina em outro
                    this.setInDay(day, d, (hour: string) => +hour >= +date(d.start).format('HHmm'));
                }
                if (isEndDay && !isStartEqualsEnd) { // começa em outro dia e termina nesse dia
                    this.setInDay(day, d, (hour: string) => +hour < +date(d.end).format('HHmm'));
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
                <span class="d-inline-block lh-sm">${escapeHtml(data.title)}</span><br>
                ${data.description ? `<span class="d-inline-block lh-sm opacity-75">${escapeHtml(data.description)}</span><br>` : ''}
                <hr class="my-1">
                <b>Inicio</b>: ${date(data.start).format('DD/MM/YYYY HH:mm')}<br>
                <b>Fim</b>: ${date(data.end).format('DD/MM/YYYY HH:mm')}<br>
            </div>
        `
    }

    private setInDay(day: { label: string; hours: any; }, obj: any, condition: (hour: string) => boolean) {
        Object.entries(day.hours).map(([key, value]) => {
            const hour = key.replace(':', '');
            if (condition(hour))
                this.setInHour(obj, day, key);
        });
    }

    private setInHour(obj: any, day: { label: string; hours: any; }, key: string) {
        const _startNow = day.label == date(obj.start).format('YYYY-MM-DD') && key == date(obj.start).format('HH:mm');
        const _endNow = day.label == date(obj.end).format('YYYY-MM-DD') && key == date(obj.end).subtract(30, 'minute').format('HH:mm');

        day.hours[key] = day.hours[key] || [];
        day.hours[key].push({ ...obj, _startNow, _endNow });
    }

    private overlaps(a: CalendarDataFull, b: CalendarDataFull) {
        const aStart = new Date(a.start).getTime();
        const aEnd = new Date(a.end).getTime();
        const bStart = new Date(b.start).getTime();
        const bEnd = new Date(b.end).getTime();

        // verificando se o overlap é no mesmo dia
        if (
            date(b.start).format('YYYY-MM-DD') == date(b.end).format('YYYY-MM-DD') &&
            (date(a.start).format('YYYY-MM-DD') == date(b.start).format('YYYY-MM-DD') || date(a.end).format('YYYY-MM-DD') == date(b.end).format('YYYY-MM-DD'))
        ) {
            if (aStart <= bStart && aEnd <= bEnd && aEnd > bStart) return true; // a ends in b
            if (aStart >= bStart && aEnd >= bEnd && aStart < bEnd) return true; // a starts in b
            if (aStart <= bStart && aEnd >= bEnd) return true; // a in b
            if (bStart <= aStart && bEnd >= aEnd) return true; // b in a
        }

        return false;
    };
}
