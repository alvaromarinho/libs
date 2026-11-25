import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { vi } from 'vitest';

import { BreakHour, CalendarData, NgBsCalendarComponent } from './ng-bs-calendar.component';

dayjs.extend(isoWeek);

// Semana fixa para os testes: 2026-07-05 (domingo) a 2026-07-11 (sábado)
const SUNDAY = '2026-07-05';

function makeEvent(partial: Partial<CalendarData> & { start: string; end: string }): CalendarData {
  return { id: Math.random(), title: 'event', color: '#000', ...partial };
}

const allHours30min = Array(24 * 2).fill(0).map((_, i) => (`${~~(i / 2)}`.padStart(2, '0') + ':' + `${60 * (i / 2 % 1)}`.padStart(2, '0')));
function hours30minBetween(start: string, end: string) {
  return allHours30min.filter((h) => h >= start && h < end);
}

describe('NgBsCalendarComponent', () => {
  let component: NgBsCalendarComponent;
  let fixture: ComponentFixture<NgBsCalendarComponent>;

  async function create(data: CalendarData[], start = SUNDAY) {
    fixture = TestBed.createComponent(NgBsCalendarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('start', start);
    await fixture.whenStable();
  }

  async function createDay(data: CalendarData[], start = SUNDAY) {
    fixture = TestBed.createComponent(NgBsCalendarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('start', start);
    fixture.componentRef.setInput('view', 'day');
    await fixture.whenStable();
  }

  const schedule = () => (component as any).schedule();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NgBsCalendarComponent ]
    })
    .compileComponents();
  });

  it('should create', async () => {
    await create([]);
    expect(component).toBeTruthy();
  });

  it('treats null data (async pipe before it resolves) as empty', async () => {
    fixture = TestBed.createComponent(NgBsCalendarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', null);
    await fixture.whenStable();
    expect((component as any).events()).toEqual([]);
    expect(schedule().week.length).toBe(7);
  });

  it('renders when [data] is never bound (loading=false default)', async () => {
    fixture = TestBed.createComponent(NgBsCalendarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    expect(schedule().week.length).toBe(7);
    expect(fixture.nativeElement.querySelectorAll('.row').length).toBe(2 + 48);
  });

  describe('week construction', () => {
    it('builds 7 consecutive days starting on the display-week start', async () => {
      await create([]);
      const week = schedule().week;
      expect(week.length).toBe(7);
      expect(week[0].label).toBe(SUNDAY);
      expect(week[6].label).toBe('2026-07-11');
      for (let i = 0; i < 7; i++) {
        expect(week[i].label).toBe(dayjs(SUNDAY).add(i, 'day').format('YYYY-MM-DD'));
      }
    });

    it('computes prev/next week anchors', async () => {
      await create([]);
      expect(schedule().startWeek).toBe(SUNDAY);
      const prevStart = dayjs(schedule().prev);
      const nextStart = dayjs(schedule().next);
      expect(prevStart.isBefore(dayjs(SUNDAY))).toBe(true);
      expect(nextStart.isAfter(dayjs('2026-07-11'))).toBe(true);
    });
  });

  describe('event placement', () => {
    it('places a same-day timed event in its 30-minute slots with start/end markers', async () => {
      await create([makeEvent({ id: 1, start: '2026-07-07T09:00:00', end: '2026-07-07T10:00:00' })]);

      const tuesday = schedule().week.find((d: any) => d.label === '2026-07-07');
      expect(tuesday.hours['09:00'].length).toBe(1);
      expect(tuesday.hours['09:30'].length).toBe(1);
      expect(tuesday.hours['10:00']).toBeUndefined();

      expect(tuesday.hours['09:00'][0]._startNow).toBe(true);
      expect(tuesday.hours['09:30'][0]._endNow).toBe(true);
    });

    it('places fully-spanned days of a multi-day event in allDay', async () => {
      await create([makeEvent({ id: 2, start: '2026-07-06T22:00:00', end: '2026-07-09T02:00:00' })]);

      const wednesday = schedule().week.find((d: any) => d.label === '2026-07-08');
      expect(wednesday.allDay.length).toBe(1);

      // dia de início recebe as horas a partir do start
      const monday = schedule().week.find((d: any) => d.label === '2026-07-06');
      expect(monday.hours['22:00'].length).toBe(1);
      expect(monday.hours['21:30']).toBeUndefined();

      // dia de fim recebe as horas até o end
      const thursday = schedule().week.find((d: any) => d.label === '2026-07-09');
      expect(thursday.hours['01:30'].length).toBe(1);
      expect(thursday.hours['02:00']).toBeUndefined();
    });

    it('ignores events outside the displayed week', async () => {
      await create([makeEvent({ id: 3, start: '2026-08-01T09:00:00', end: '2026-08-01T10:00:00' })]);
      const placed = schedule().week.some((d: any) => d.allDay.length || Object.values(d.hours).some(Boolean));
      expect(placed).toBe(false);
    });
  });

  describe('overlap sizing (_size)', () => {
    it('marks same-day overlapping events', async () => {
      await create([
        makeEvent({ id: 1, start: '2026-07-07T09:00:00', end: '2026-07-07T11:00:00' }),
        makeEvent({ id: 2, start: '2026-07-07T10:00:00', end: '2026-07-07T12:00:00' }),
        makeEvent({ id: 3, start: '2026-07-07T14:00:00', end: '2026-07-07T15:00:00' }),
      ]);

      const byId = (id: number) => ((component as any).events() as any[]).find(d => d.id === id);
      expect(byId(1)._size).toBeGreaterThanOrEqual(2); // sobrepõe consigo e com o 2
      expect(byId(2)._size).toBeGreaterThanOrEqual(2);
      expect(byId(3)._size).toBeLessThan(byId(1)._size); // isolado
    });
  });

  describe('week navigation', () => {
    it('nextWeek emits the next range and rebuilds the schedule', async () => {
      await create([]);
      let range: any = null;
      component.changeWeek.subscribe(r => range = r);

      component.nextWeek();

      expect(range.start).toBe('2026-07-12');
      expect(schedule().week[0].label).toBe('2026-07-12');
      expect(range.end >= range.start).toBe(true);
    });

    it('prevWeek emits the previous range and rebuilds the schedule', async () => {
      await create([]);
      let range: any = null;
      component.changeWeek.subscribe(r => range = r);

      component.prevWeek();

      expect(range.start).toBe('2026-06-28');
      expect(schedule().week[0].label).toBe('2026-06-28');
    });

    it('todayWeek returns to the week containing today', async () => {
      await create([], '2020-01-05'); // semana antiga
      let range: any = null;
      component.changeWeek.subscribe(r => range = r);

      (component as any).todayWeek();

      const week = schedule().week.map((d: any) => d.label);
      expect(week).toContain((component as any).today);
      expect(range).not.toBeNull();
    });
  });

  describe('start default (pinned before the signals migration)', () => {
    const today = dayjs().format('YYYY-MM-DD');
    const label0 = () => (component as any).schedule().week[0].label;

    it('week view without [start] opens on the Sunday of the current week', async () => {
      fixture = TestBed.createComponent(NgBsCalendarComponent);
      component = fixture.componentInstance;
      await fixture.whenStable();
      expect(label0()).toBe(dayjs(today).add(1, 'day').startOf('isoWeek').subtract(1, 'day').format('YYYY-MM-DD'));
    });

    it('day view without [start] opens on today', async () => {
      fixture = TestBed.createComponent(NgBsCalendarComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('view', 'day');
      await fixture.whenStable();
      expect(label0()).toBe(today);
    });

    it('day view with an explicit week-aligned [start] keeps it', async () => {
      await createDay([], SUNDAY);
      expect(label0()).toBe(SUNDAY);
    });
  });

  describe('day view', () => {
    it('builds a single-day schedule anchored on start', async () => {
      await createDay([]);
      const week = schedule().week;
      expect(week.length).toBe(1);
      expect(week[0].label).toBe(SUNDAY);
    });

    it('places events within the single visible day', async () => {
      await createDay([makeEvent({ id: 1, start: '2026-07-05T09:00:00', end: '2026-07-05T10:00:00' })]);

      const day = schedule().week[0];
      expect(day.hours['09:00'].length).toBe(1);
      expect(day.hours['09:30'].length).toBe(1);
    });

    it('nextWeek/prevWeek step by 1 day, not 7, and emit start === end', async () => {
      await createDay([]);
      let range: any = null;
      component.changeWeek.subscribe(r => range = r);

      component.nextWeek();

      expect(range.start).toBe('2026-07-06');
      expect(range.end).toBe('2026-07-06');
      expect(schedule().week.length).toBe(1);
      expect(schedule().week[0].label).toBe('2026-07-06');

      component.prevWeek();

      expect(range.start).toBe('2026-07-05');
      expect(range.end).toBe('2026-07-05');
    });

    it('todayWeek shows only the current day', async () => {
      await createDay([], '2020-01-05'); // dia antigo
      (component as any).todayWeek();

      expect(schedule().week.length).toBe(1);
      expect(schedule().week[0].label).toBe((component as any).today);
    });
  });

  describe('hour range (startHour/endHour)', () => {
    async function createWithRange(startHour?: string, endHour?: string, data: CalendarData[] = []) {
      fixture = TestBed.createComponent(NgBsCalendarComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('data', data);
      fixture.componentRef.setInput('start', SUNDAY);
      if (startHour !== undefined) fixture.componentRef.setInput('startHour', startHour);
      if (endHour !== undefined) fixture.componentRef.setInput('endHour', endHour);
      await fixture.whenStable();
    }

    it('defaults to the full 00:00–24:00 range (48 slots + 2 leading nulls)', async () => {
      await createWithRange();
      expect((component as any).hours().length).toBe(2 + 48);
      expect((component as any).hours()[2]).toBe('00:00');
      expect((component as any).hours()[(component as any).hours().length - 1]).toBe('23:30');
    });

    it('filters hours down to [startHour, endHour)', async () => {
      await createWithRange('08:00', '17:00');
      const hours = (component as any).hours();
      expect(hours[0]).toBeNull();
      expect(hours[1]).toBeNull();
      expect(hours.slice(2)).toEqual(hours30minBetween('08:00', '17:00'));
    });

    it('falls back to default startHour and warns on invalid format', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await createWithRange('8h', '17:00');
      expect(warn).toHaveBeenCalled();
      expect((component as any).hours()[2]).toBe('00:00');
    });

    it('falls back to default endHour and warns when it does not match a slot', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await createWithRange('08:00', '17:15');
      expect(warn).toHaveBeenCalled();
      const hours = (component as any).hours();
      expect(hours[hours.length - 1]).toBe('23:30');
    });

    it('does not render rows for an event outside the displayed range (no error, just hidden)', async () => {
      await createWithRange('08:00', '17:00', [
        makeEvent({ id: 1, start: '2026-07-05T18:00:00', end: '2026-07-05T19:00:00' }),
      ]);
      const hours = (component as any).hours();
      expect(hours).not.toContain('18:00');
      // ainda presente no dicionário interno (setSchedule usa hours30min completo), só não aparece nas linhas exibidas
      const day = schedule().week[0];
      expect(day.hours['18:00'].length).toBe(1);
    });
  });

  describe('slot size (slotMinutes)', () => {
    async function createWithSlot(slotMinutes?: number, startHour?: string, endHour?: string, data: CalendarData[] = []) {
      fixture = TestBed.createComponent(NgBsCalendarComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('data', data);
      fixture.componentRef.setInput('start', SUNDAY);
      if (slotMinutes !== undefined) fixture.componentRef.setInput('slotMinutes', slotMinutes);
      if (startHour !== undefined) fixture.componentRef.setInput('startHour', startHour);
      if (endHour !== undefined) fixture.componentRef.setInput('endHour', endHour);
      await fixture.whenStable();
    }

    it('defaults to 30-minute slots (48 in the day)', async () => {
      await createWithSlot();
      expect((component as any).hours().slice(2).length).toBe(48);
    });

    it('builds 1-hour slots (24 in the day)', async () => {
      await createWithSlot(60);
      const hours = (component as any).hours().slice(2);
      expect(hours.length).toBe(24);
      expect(hours[0]).toBe('00:00');
      expect(hours[1]).toBe('01:00');
      expect(hours[23]).toBe('23:00');
    });

    it('builds 15-minute slots (96 in the day)', async () => {
      await createWithSlot(15);
      const hours = (component as any).hours().slice(2);
      expect(hours.length).toBe(96);
      expect(hours[1]).toBe('00:15');
      expect(hours[95]).toBe('23:45');
    });

    it('places an event in the correct 1-hour slot with start/end markers', async () => {
      await createWithSlot(60, undefined, undefined, [
        makeEvent({ id: 1, start: '2026-07-07T09:00:00', end: '2026-07-07T11:00:00' }),
      ]);
      const tuesday = schedule().week.find((d: any) => d.label === '2026-07-07');
      expect(tuesday.hours['09:00'].length).toBe(1);
      expect(tuesday.hours['10:00'].length).toBe(1);
      expect(tuesday.hours['11:00']).toBeUndefined();
      expect(tuesday.hours['09:00'][0]._startNow).toBe(true);
      expect(tuesday.hours['10:00'][0]._endNow).toBe(true);
    });

    it('combines slotMinutes with startHour/endHour', async () => {
      await createWithSlot(60, '08:00', '17:00');
      const hours = (component as any).hours();
      expect(hours[2]).toBe('08:00');
      expect(hours[hours.length - 1]).toBe('16:00');
      expect(hours.length).toBe(2 + 9);
    });

    it('falls back to default slotMinutes and warns when it does not divide the day evenly', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await createWithSlot(17);
      expect(warn).toHaveBeenCalled();
      expect((component as any).hours().slice(2).length).toBe(48);
    });

    it('rebuilds the schedule dict when slotMinutes changes after init', async () => {
      await createWithSlot(30, undefined, undefined, [
        makeEvent({ id: 1, start: '2026-07-05T09:00:00', end: '2026-07-05T10:00:00' }),
      ]);
      expect(schedule().week[0].hours['09:00'].length).toBe(1);

      fixture.componentRef.setInput('slotMinutes', 60);
      await fixture.whenStable();

      const day = schedule().week[0];
      expect(day.hours['09:00'].length).toBe(1);
      expect(day.hours['09:30']).toBeUndefined();
    });
  });

  describe('break hours (breakHours)', () => {
    async function createWithBreak(breakHours: BreakHour[], slotMinutes?: number, data: CalendarData[] = []) {
      fixture = TestBed.createComponent(NgBsCalendarComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('data', data);
      fixture.componentRef.setInput('start', SUNDAY);
      fixture.componentRef.setInput('breakHours', breakHours);
      if (slotMinutes !== undefined) fixture.componentRef.setInput('slotMinutes', slotMinutes);
      await fixture.whenStable();
    }

    it('marks slots within a break range as blocked', async () => {
      await createWithBreak([{ start: '12:00', end: '13:00' }]);
      expect((component as any).isBlocked('11:30')).toBe(false);
      expect((component as any).isBlocked('12:00')).toBe(true);
      expect((component as any).isBlocked('12:30')).toBe(true);
      expect((component as any).isBlocked('13:00')).toBe(false);
    });

    it('supports multiple break ranges', async () => {
      await createWithBreak([{ start: '12:00', end: '13:00' }, { start: '09:00', end: '09:30' }]);
      expect((component as any).isBlocked('09:00')).toBe(true);
      expect((component as any).isBlocked('09:30')).toBe(false);
      expect((component as any).isBlocked('12:30')).toBe(true);
    });

    it('does not blank out the schedule dict — an existing event in a blocked slot still shows', async () => {
      await createWithBreak([{ start: '12:00', end: '13:00' }], undefined, [
        makeEvent({ id: 1, start: '2026-07-05T12:00:00', end: '2026-07-05T12:30:00' }),
      ]);
      expect(schedule().week[0].hours['12:00'].length).toBe(1);
      expect((component as any).isBlocked('12:00')).toBe(true);
    });

    it('warns and ignores an invalid break range (bad slot / start >= end), keeps valid ones', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await createWithBreak([{ start: '12:15', end: '13:00' }, { start: '09:00', end: '09:30' }]);
      expect(warn).toHaveBeenCalled();
      expect((component as any).isBlocked('12:00')).toBe(false); // range inválido, ignorado inteiro
      expect((component as any).isBlocked('09:00')).toBe(true); // range válido, mantido
    });

    it('re-expands break ranges against the new grid when slotMinutes changes', async () => {
      await createWithBreak([{ start: '12:00', end: '13:00' }], 30);
      expect((component as any).isBlocked('12:30')).toBe(true);

      fixture.componentRef.setInput('slotMinutes', 60);
      await fixture.whenStable();

      expect((component as any).isBlocked('12:00')).toBe(true);
      expect((component as any).isBlocked('12:30')).toBe(false); // não é mais um slot válido em grid de 1h
    });
  });

  describe('view toggling', () => {
    it('rebuilds the schedule and emits changeWeek when view changes after init', async () => {
      await create([]);
      let range: any = null;
      component.changeWeek.subscribe(r => range = r);

      fixture.componentRef.setInput('view', 'day');
      await fixture.whenStable();

      expect(schedule().week.length).toBe(1);
      expect(schedule().week[0].label).toBe(SUNDAY);
      expect(range).not.toBeNull();
      expect(range.start).toBe(SUNDAY);
      expect(range.end).toBe(SUNDAY);
    });

    it('going back to week view re-anchors on the day that was visible', async () => {
      await createDay([], '2026-07-08'); // quarta-feira, dentro da semana de SUNDAY
      fixture.componentRef.setInput('view', 'week');
      await fixture.whenStable();

      expect(schedule().week.length).toBe(7);
      expect(schedule().week[0].label).toBe(SUNDAY);
    });
  });

  describe('through a host (DOM)', () => {
    @Component({
      standalone: true,
      imports: [NgBsCalendarComponent],
      template: `
        <ng-bs-calendar [data]="data()" [start]="start" [view]="view()" startHour="08:00" endHour="12:00"
          (changeWeek)="ranges.push($event)" (clickCell)="cells.push($event)" (clickEmptyCell)="empty.push($event)">
          <span class="projected">filtros</span>
        </ng-bs-calendar>
      `
    })
    class HostComponent {
      readonly start = SUNDAY;
      readonly data = signal<CalendarData[]>([]);
      readonly view = signal<'week' | 'day'>('week');
      readonly ranges: { start: string, end: string }[] = [];
      readonly cells: CalendarData[] = [];
      readonly empty: { day: string, hour: string }[] = [];
    }

    let hostFixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    const el = (): HTMLElement => hostFixture.nativeElement;
    const calendar = (): HTMLElement => el().querySelector('ng-bs-calendar')!;
    const emptyCells = (): HTMLElement[] => Array.from(el().querySelectorAll<HTMLElement>('[aria-label="Novo evento"]'));

    beforeEach(async () => {
      hostFixture = TestBed.createComponent(HostComponent);
      host = hostFixture.componentInstance;
      await hostFixture.whenStable();
    });

    it('renders the header, projected content and the [startHour, endHour) rows', () => {
      expect(el().querySelector('.projected')?.textContent).toBe('filtros');
      expect(el().querySelectorAll('.row').length).toBe(2 + 8);
      expect(emptyCells().length).toBe(7 * 8);
    });

    it('marks the clicked empty cell and emits clickEmptyCell', async () => {
      emptyCells()[1].click();
      await hostFixture.whenStable();
      expect(host.empty).toEqual([{ day: '2026-07-06', hour: '08:00' }]);
      expect(emptyCells()[1].classList).toContain('cell-selected');
      expect(el().querySelectorAll('.cell-selected').length).toBe(1);
    });

    it('emits clickCell when an event is clicked', async () => {
      const event = makeEvent({ id: 7, start: '2026-07-06T09:00:00', end: '2026-07-06T10:00:00' });
      host.data.set([event]);
      await hostFixture.whenStable();

      el().querySelector<HTMLElement>('.badge')!.click();

      expect(host.cells.length).toBe(1);
      expect(host.cells[0].id).toBe(7);
    });

    it('does not mutate the objects passed in [data]', async () => {
      const event = makeEvent({ id: 1, start: '2026-07-06T09:00:00', end: '2026-07-06T10:00:00' });
      host.data.set([event]);
      await hostFixture.whenStable();
      expect('_size' in event).toBe(false);
    });

    it('navigates with the buttons and emits changeWeek', async () => {
      const buttons = Array.from(el().querySelectorAll<HTMLButtonElement>('.cal-header-buttons button'));
      buttons[2].click();
      await hostFixture.whenStable();
      buttons[0].click();
      await hostFixture.whenStable();

      expect(host.ranges).toEqual([
        { start: '2026-07-12', end: '2026-07-18' },
        { start: '2026-07-05', end: '2026-07-11' },
      ]);
    });

    it('re-renders on a data change, keeping the visible week and without emitting changeWeek', async () => {
      el().querySelectorAll<HTMLButtonElement>('.cal-header-buttons button')[2].click();
      await hostFixture.whenStable();
      host.ranges.length = 0;

      host.data.set([makeEvent({ id: 1, start: '2026-07-13T09:00:00', end: '2026-07-13T10:00:00' })]);
      await hostFixture.whenStable();

      expect(el().querySelectorAll('.badge').length).toBe(2);
      expect(host.ranges).toEqual([]);
    });

    it('toggles the day view class and emits the new range', async () => {
      host.view.set('day');
      await hostFixture.whenStable();

      expect(calendar().classList).toContain('cal-day-view');
      expect(emptyCells().length).toBe(8);
      expect(host.ranges).toEqual([{ start: SUNDAY, end: SUNDAY }]);
    });
  });
});
