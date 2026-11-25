import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, PLATFORM_ID, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { DatePipe, UpperCasePipe, isPlatformBrowser } from '@angular/common';
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

export interface BreakHour {
    start: string; // 'HH:mm', deve bater com um slot de `slots`
    end: string;   // 'HH:mm', idem, e > start
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

const MINUTES_IN_DAY = 24 * 60;
const DEFAULT_SLOT_MINUTES = 30;

// gera os labels 'HH:mm' de 00:00 até o último slot antes de 24:00, no passo `minutes`.
// só é chamada com `minutes` já validado (ver _validateSlotMinutes) — divide MINUTES_IN_DAY
// sem resto, então o último slot sempre termina exatamente em 24:00, sem sobra fracionada
const buildHourSlots = (minutes: number) => Array(MINUTES_IN_DAY / minutes).fill(0).map((_, i) => {
    const total = i * minutes;
    return `${~~(total / 60)}`.padStart(2, '0') + ':' + `${total % 60}`.padStart(2, '0');
});

const escapeHtml = (value: string) => (value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]!));

@Component({
    selector: 'ng-bs-calendar',
    standalone: true,
    imports: [DatePipe, UpperCasePipe],
    templateUrl: './ng-bs-calendar.component.html',
    styleUrls: ['./ng-bs-calendar.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { '[class.cal-day-view]': "view() === 'day'" },
})
export class NgBsCalendarComponent implements OnInit, OnDestroy {

    readonly loading = input(false);
    readonly data = input<CalendarData[] | null | undefined>([]);
    /** `yyyy-MM-dd`, read once on init. Unbound: current week (week view) or today (day view). */
    readonly start = input<string>();
    readonly showButtons = input(true);
    readonly view = input<CalendarView>('week');
    readonly startHour = input('00:00');
    readonly endHour = input('24:00');
    readonly slotMinutes = input(DEFAULT_SLOT_MINUTES);
    readonly breakHours = input<BreakHour[]>([]);
    readonly clickCell = output<CalendarData>();
    readonly clickEmptyCell = output<{ day: string, hour: string }>();
    readonly changeWeek = output<{ start: string, end: string }>();

    protected readonly today = dayjs().format('YYYY-MM-DD');
    protected readonly selectedEmptyCell = signal<{ day: string, hour: string } | null>(null);

    // First day requested (init, navigation or view toggle). The schedule is derived from it.
    private readonly anchor = signal<string | null>(null);

    // valida `slotMinutes`: precisa ser inteiro positivo que divide MINUTES_IN_DAY sem resto —
    // é o que garante slots de tamanho igual até 24:00 sem sobra fracionada (ex: 17min quebraria
    // isso — 1440/17 não é inteiro). Presets comuns: 10, 15, 20, 30 (default), 60.
    private readonly validSlotMinutes = computed(() => {
        const slotMinutes = this.slotMinutes();
        const isValid = Number.isInteger(slotMinutes) && slotMinutes > 0 && MINUTES_IN_DAY % slotMinutes === 0;
        if (!isValid) {
            console.warn(`ng-bs-calendar: slotMinutes inválido ("${slotMinutes}"), usando ${DEFAULT_SLOT_MINUTES}.`);
        }
        return isValid ? slotMinutes : DEFAULT_SLOT_MINUTES;
    });

    private readonly slots = computed(() => buildHourSlots(this.validSlotMinutes()));

    // valida `startHour`/`endHour` (formato HH:mm batendo com um slot de `slots`; endHour aceita
    // também '24:00' como "fim do dia") — range inválido cai pro default e avisa no console em vez
    // de cortar a grade num ponto errado
    private readonly validStartHour = computed(() => {
        const startHour = this.startHour();
        if (this.slots().includes(startHour)) return startHour;
        console.warn(`ng-bs-calendar: startHour inválido ("${startHour}"), usando '00:00'.`);
        return '00:00';
    });

    private readonly validEndHour = computed(() => {
        const endHour = this.endHour();
        if (endHour === '24:00' || this.slots().includes(endHour)) return endHour;
        console.warn(`ng-bs-calendar: endHour inválido ("${endHour}"), usando '24:00'.`);
        return '24:00';
    });

    // expande `breakHours` (ranges 'HH:mm') nos slots de `slots` que caem dentro de cada range —
    // entrada inválida (formato fora de um slot, ou start >= end) é ignorada com warning, sem
    // derrubar as outras entradas válidas do array
    private readonly blockedSlots = computed(() => {
        const slots = this.slots();
        const blocked = new Set<string>();

        for (const range of this.breakHours()) {
            const isValidStart = slots.includes(range.start);
            const isValidEnd = range.end === '24:00' || slots.includes(range.end);
            const isValidOrder = range.start < range.end;

            if (!isValidStart || !isValidEnd || !isValidOrder) {
                console.warn(`ng-bs-calendar: breakHours inválido (${JSON.stringify(range)}), ignorado.`);
                continue;
            }

            slots.filter((h) => h >= range.start && h < range.end).forEach((h) => blocked.add(h));
        }

        return blocked;
    });

    // sort + overlap sizing de `data`, em cópias (o array e os objetos do host não são alterados)
    private readonly events = computed<CalendarDataFull[]>(() => {
        const data = this.data();
        const sorted = (Array.isArray(data) ? data : [])
            .map((d) => ({ ...d }) as CalendarDataFull)
            .sort((a, b) => date(a.start).valueOf() - date(b.start).valueOf());
        sorted.forEach((d1) => {
            d1._size = sorted.filter((d2) => this.overlaps(d1, d2)).length;
        });
        return sorted;
    });

    protected readonly daysCount = computed(() => this.view() === 'day' ? 1 : 7);
    protected readonly gridCols = computed(() => Array(this.daysCount() + 1));

    // mantém os 2 null iniciais (célula de mês + linha "Dia", usadas pelo template por índice) —
    // só filtra os slots (tamanho definido por slotMinutes) pelo range validado
    protected readonly hours = computed(() => {
        const start = this.validStartHour();
        const end = this.validEndHour();
        return [null, null, ...this.slots().filter((h) => h >= start && h < end)];
    });

    protected readonly schedule = computed(() => this.buildSchedule(this.anchor() ?? this.defaultStart()));

    // Stable column per event `id` while the same `data` is shown (no jumping between renders).
    private positionCache = new WeakMap<CalendarDataFull[], Map<unknown, number>>();
    private tooltip?: Tooltip;
    private readonly platformId = inject(PLATFORM_ID);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.tooltip = new Tooltip(document.body, {
                selector: '[data-bs-toggle="tooltip"]',
                container: 'body',
                placement: 'top',
            });
        }

        // Toggling `view` re-anchors and emits `changeWeek` so the host can fetch the new range.
        // untracked: writes a signal and emits without allowSignalWrites, which Angular 18 would require.
        let previousView: CalendarView | undefined;
        effect(() => {
            const view = this.view();
            untracked(() => {
                if (previousView !== undefined && previousView !== view) {
                    this.onViewChange(previousView);
                }
                previousView = view;
            });
        });
    }

    ngOnInit(): void {
        this.anchor.set(this.defaultStart());
    }

    ngOnDestroy(): void {
        this.tooltip?.dispose();
    }

    prevWeek(): void {
        this.navigate(this.schedule().prev);
    }

    todayWeek(): void {
        this.navigate(this.today);
    }

    nextWeek(): void {
        this.navigate(this.schedule().next);
    }

    // true pra qualquer slot dentro de algum range de `breakHours` (ex: almoço) — aplicado igual
    // em todos os dias exibidos, não bloqueia célula com evento real já colocado nela (ver template)
    protected isBlocked(hour: string): boolean {
        return this.blockedSlots().has(hour);
    }

    protected onEmptyCellClick(day: string, hour: string): void {
        this.selectedEmptyCell.set({ day, hour });
        this.clickEmptyCell.emit({ day, hour });
    }

    protected getIndexPosition(obj: CalendarDataFull, index: number): number {
        const events = this.events();
        let cache = this.positionCache.get(events);
        if (!cache) {
            cache = new Map();
            this.positionCache.set(events, cache);
        }
        if (!cache.has(obj.id)) {
            cache.set(obj.id, index);
        }
        return cache.get(obj.id)!;
    }

    // `start` explícito vence; sem ele, a semana atual (domingo) ou, em view 'day', hoje.
    private defaultStart(): string {
        const start = this.start();
        if (start) return start;
        return this.view() === 'day' ? this.today : date(this.today).startOf('isoWeek').subtract(1, 'day').format('YYYY-MM-DD');
    }

    private navigate(start: string): void {
        this.anchor.set(start);
        this.emitChangeWeek();
    }

    // anchor padrão: primeiro dia que estava visível (preserva a semana/dia que o host estava
    // navegando). Mas se `today` estava no range visível, prioriza `today` — sem isso, alternar
    // semana->dia sempre abria no domingo da semana em vez do dia atual.
    private onViewChange(previousView: CalendarView): void {
        const { first, last } = this.visibleRange(this.anchor() ?? this.defaultStart(), previousView);
        const isTodayVisible = this.today >= first && this.today <= last;
        this.navigate(isTodayVisible ? this.today : first);
    }

    // Primeiro e último dia exibidos para `start` em `view` (mesma regra de buildSchedule).
    private visibleRange(start: string, view: CalendarView): { first: string, last: string } {
        if (view === 'day') return { first: start, last: start };
        const first = date(start).add(1, 'day').startOf('isoWeek').subtract(1, 'day');
        return { first: first.format('YYYY-MM-DD'), last: first.add(6, 'day').format('YYYY-MM-DD') };
    }

    private emitChangeWeek(): void {
        const week = this.schedule().week;
        this.changeWeek.emit({ start: week[0].label, end: week[week.length - 1].label });
    }

    private buildSchedule(start: string): Schedule {
        const daysCount = this.daysCount();
        const schedule = { week: [] as ScheduleDay[] } as Schedule;

        if (daysCount === 7) {
            // semana: alinhamento Monday-start (isoWeek) exibido como Sunday-start —
            // o +1 day abaixo alinha o `start` recebido nesse esquema; não simplificar
            // sem reconferir os boundaries testados no spec.
            const aligned = date(start).add(1, 'day').format('YYYY-MM-DD');
            schedule.prev = date(aligned).startOf('isoWeek').subtract(2, 'day').format('YYYY-MM-DD');
            schedule.next = date(aligned).startOf('isoWeek').add(7, 'day').format('YYYY-MM-DD');
            schedule.startWeek = date(aligned).startOf('isoWeek').subtract(1, 'day').format('YYYY-MM-DD');
        } else {
            // dia: sem alinhamento de semana, navega 1 dia por vez a partir do próprio start
            schedule.prev = date(start).subtract(1, 'day').format('YYYY-MM-DD');
            schedule.next = date(start).add(1, 'day').format('YYYY-MM-DD');
            schedule.startWeek = start;
        }

        const hours = this.slots().reduce((accumulator, value) => ({ ...accumulator, [value]: undefined }), {});
        for (let i = 0; i < daysCount; i++) {
            const day = date(schedule.startWeek).add(i, 'day').format('YYYY-MM-DD');
            schedule.week.push({ label: day, hours: { ...hours }, allDay: [] });
        }

        const events = this.events();
        schedule.week.forEach((day: ScheduleDay) => {
            events.forEach((d: CalendarDataFull) => {
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
                    day.allDay.push(d);
                }
            });
        });

        return schedule;
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
        const _endNow = day.label == date(obj.end).format('YYYY-MM-DD') && key == date(obj.end).subtract(this.validSlotMinutes(), 'minute').format('HH:mm');

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
    }

}
