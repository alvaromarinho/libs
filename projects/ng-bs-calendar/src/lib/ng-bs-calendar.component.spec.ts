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

  function create(data: CalendarData[], start = SUNDAY) {
    fixture = TestBed.createComponent(NgBsCalendarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('start', start);
    fixture.detectChanges();
  }

  function createDay(data: CalendarData[], start = SUNDAY) {
    fixture = TestBed.createComponent(NgBsCalendarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('start', start);
    fixture.componentRef.setInput('view', 'day');
    fixture.detectChanges();
  }

  const schedule = () => (component as any).schedule;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NgBsCalendarComponent ]
    })
    .compileComponents();
  });

  it('should create', () => {
    create([]);
    expect(component).toBeTruthy();
  });

  it('falls back to empty array when data is not provided', () => {
    fixture = TestBed.createComponent(NgBsCalendarComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    expect(component.data).toEqual([]);
  });

  it('renders without throwing when [data] is never bound (loading=false default)', () => {
    fixture = TestBed.createComponent(NgBsCalendarComponent);
    component = fixture.componentInstance;
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(schedule().week.length).toBe(7);
  });

  describe('week construction', () => {
    it('builds 7 consecutive days starting on the display-week start', () => {
      create([]);
      const week = schedule().week;
      expect(week.length).toBe(7);
      expect(week[0].label).toBe(SUNDAY);
      expect(week[6].label).toBe('2026-07-11');
      for (let i = 0; i < 7; i++) {
        expect(week[i].label).toBe(dayjs(SUNDAY).add(i, 'day').format('YYYY-MM-DD'));
      }
    });

    it('computes prev/next week anchors', () => {
      create([]);
      expect(schedule().startWeek).toBe(SUNDAY);
      const prevStart = dayjs(schedule().prev);
      const nextStart = dayjs(schedule().next);
      expect(prevStart.isBefore(dayjs(SUNDAY))).toBe(true);
      expect(nextStart.isAfter(dayjs('2026-07-11'))).toBe(true);
    });
  });

  describe('event placement', () => {
    it('places a same-day timed event in its 30-minute slots with start/end markers', () => {
      create([makeEvent({ id: 1, start: '2026-07-07T09:00:00', end: '2026-07-07T10:00:00' })]);

      const tuesday = schedule().week.find((d: any) => d.label === '2026-07-07');
      expect(tuesday.hours['09:00'].length).toBe(1);
      expect(tuesday.hours['09:30'].length).toBe(1);
      expect(tuesday.hours['10:00']).toBeUndefined();

      expect(tuesday.hours['09:00'][0]._startNow).toBe(true);
      expect(tuesday.hours['09:30'][0]._endNow).toBe(true);
    });

    it('places fully-spanned days of a multi-day event in allDay', () => {
      create([makeEvent({ id: 2, start: '2026-07-06T22:00:00', end: '2026-07-09T02:00:00' })]);

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

    it('ignores events outside the displayed week', () => {
      create([makeEvent({ id: 3, start: '2026-08-01T09:00:00', end: '2026-08-01T10:00:00' })]);
      expect((component as any).scheduleFlat.length).toBe(0);
    });
  });

  describe('overlap sizing (_size)', () => {
    it('marks same-day overlapping events', () => {
      create([
        makeEvent({ id: 1, start: '2026-07-07T09:00:00', end: '2026-07-07T11:00:00' }),
        makeEvent({ id: 2, start: '2026-07-07T10:00:00', end: '2026-07-07T12:00:00' }),
        makeEvent({ id: 3, start: '2026-07-07T14:00:00', end: '2026-07-07T15:00:00' }),
      ]);

      const byId = (id: number) => (component.data as any[]).find(d => d.id === id);
      expect(byId(1)._size).toBeGreaterThanOrEqual(2); // sobrepõe consigo e com o 2
      expect(byId(2)._size).toBeGreaterThanOrEqual(2);
      expect(byId(3)._size).toBeLessThan(byId(1)._size); // isolado
    });
  });

  describe('week navigation', () => {
    it('nextWeek emits the next range and rebuilds the schedule', () => {
      create([]);
      let range: any = null;
      component.changeWeek.subscribe(r => range = r);

      component.nextWeek();

      expect(range.start).toBe('2026-07-12');
      expect(schedule().week[0].label).toBe('2026-07-12');
      expect(range.end >= range.start).toBe(true);
    });

    it('prevWeek emits the previous range and rebuilds the schedule', () => {
      create([]);
      let range: any = null;
      component.changeWeek.subscribe(r => range = r);

      component.prevWeek();

      expect(range.start).toBe('2026-06-28');
      expect(schedule().week[0].label).toBe('2026-06-28');
    });

    it('todayWeek returns to the week containing today', () => {
      create([], '2020-01-05'); // semana antiga
      let range: any = null;
      component.changeWeek.subscribe(r => range = r);

      component.todayWeek();

      const week = schedule().week.map((d: any) => d.label);
      expect(week).toContain(component.today);
      expect(range).not.toBeNull();
    });
  });

  describe('day view', () => {
    it('builds a single-day schedule anchored on start', () => {
      createDay([]);
      const week = schedule().week;
      expect(week.length).toBe(1);
      expect(week[0].label).toBe(SUNDAY);
    });

    it('places events within the single visible day', () => {
      createDay([makeEvent({ id: 1, start: '2026-07-05T09:00:00', end: '2026-07-05T10:00:00' })]);

      const day = schedule().week[0];
      expect(day.hours['09:00'].length).toBe(1);
      expect(day.hours['09:30'].length).toBe(1);
    });

    it('nextWeek/prevWeek step by 1 day, not 7, and emit start === end', () => {
      createDay([]);
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

    it('todayWeek shows only the current day', () => {
      createDay([], '2020-01-05'); // dia antigo
      component.todayWeek();

      expect(schedule().week.length).toBe(1);
      expect(schedule().week[0].label).toBe(component.today);
    });
  });

  describe('hour range (startHour/endHour)', () => {
    function createWithRange(startHour?: string, endHour?: string, data: CalendarData[] = []) {
      fixture = TestBed.createComponent(NgBsCalendarComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('data', data);
      fixture.componentRef.setInput('start', SUNDAY);
      if (startHour !== undefined) fixture.componentRef.setInput('startHour', startHour);
      if (endHour !== undefined) fixture.componentRef.setInput('endHour', endHour);
      fixture.detectChanges();
    }

    it('defaults to the full 00:00–24:00 range (48 slots + 2 leading nulls)', () => {
      createWithRange();
      expect((component as any).hours.length).toBe(2 + 48);
      expect((component as any).hours[2]).toBe('00:00');
      expect((component as any).hours[(component as any).hours.length - 1]).toBe('23:30');
    });

    it('filters hours down to [startHour, endHour)', () => {
      createWithRange('08:00', '17:00');
      const hours = (component as any).hours;
      expect(hours[0]).toBeNull();
      expect(hours[1]).toBeNull();
      expect(hours.slice(2)).toEqual(hours30minBetween('08:00', '17:00'));
    });

    it('falls back to default startHour and warns on invalid format', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      createWithRange('8h', '17:00');
      expect(warn).toHaveBeenCalled();
      expect((component as any).hours[2]).toBe('00:00');
    });

    it('falls back to default endHour and warns when it does not match a slot', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      createWithRange('08:00', '17:15');
      expect(warn).toHaveBeenCalled();
      const hours = (component as any).hours;
      expect(hours[hours.length - 1]).toBe('23:30');
    });

    it('does not render rows for an event outside the displayed range (no error, just hidden)', () => {
      createWithRange('08:00', '17:00', [
        makeEvent({ id: 1, start: '2026-07-05T18:00:00', end: '2026-07-05T19:00:00' }),
      ]);
      const hours = (component as any).hours;
      expect(hours).not.toContain('18:00');
      // ainda presente no dicionário interno (setSchedule usa hours30min completo), só não aparece nas linhas exibidas
      const day = schedule().week[0];
      expect(day.hours['18:00'].length).toBe(1);
    });
  });

  describe('slot size (slotMinutes)', () => {
    function createWithSlot(slotMinutes?: number, startHour?: string, endHour?: string, data: CalendarData[] = []) {
      fixture = TestBed.createComponent(NgBsCalendarComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('data', data);
      fixture.componentRef.setInput('start', SUNDAY);
      if (slotMinutes !== undefined) fixture.componentRef.setInput('slotMinutes', slotMinutes);
      if (startHour !== undefined) fixture.componentRef.setInput('startHour', startHour);
      if (endHour !== undefined) fixture.componentRef.setInput('endHour', endHour);
      fixture.detectChanges();
    }

    it('defaults to 30-minute slots (48 in the day)', () => {
      createWithSlot();
      expect((component as any).hours.slice(2).length).toBe(48);
    });

    it('builds 1-hour slots (24 in the day)', () => {
      createWithSlot(60);
      const hours = (component as any).hours.slice(2);
      expect(hours.length).toBe(24);
      expect(hours[0]).toBe('00:00');
      expect(hours[1]).toBe('01:00');
      expect(hours[23]).toBe('23:00');
    });

    it('builds 15-minute slots (96 in the day)', () => {
      createWithSlot(15);
      const hours = (component as any).hours.slice(2);
      expect(hours.length).toBe(96);
      expect(hours[1]).toBe('00:15');
      expect(hours[95]).toBe('23:45');
    });

    it('places an event in the correct 1-hour slot with start/end markers', () => {
      createWithSlot(60, undefined, undefined, [
        makeEvent({ id: 1, start: '2026-07-07T09:00:00', end: '2026-07-07T11:00:00' }),
      ]);
      const tuesday = schedule().week.find((d: any) => d.label === '2026-07-07');
      expect(tuesday.hours['09:00'].length).toBe(1);
      expect(tuesday.hours['10:00'].length).toBe(1);
      expect(tuesday.hours['11:00']).toBeUndefined();
      expect(tuesday.hours['09:00'][0]._startNow).toBe(true);
      expect(tuesday.hours['10:00'][0]._endNow).toBe(true);
    });

    it('combines slotMinutes with startHour/endHour', () => {
      createWithSlot(60, '08:00', '17:00');
      const hours = (component as any).hours;
      expect(hours[2]).toBe('08:00');
      expect(hours[hours.length - 1]).toBe('16:00');
      expect(hours.length).toBe(2 + 9);
    });

    it('falls back to default slotMinutes and warns when it does not divide the day evenly', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      createWithSlot(17);
      expect(warn).toHaveBeenCalled();
      expect((component as any).hours.slice(2).length).toBe(48);
    });

    it('rebuilds the schedule dict when slotMinutes changes after init', () => {
      createWithSlot(30, undefined, undefined, [
        makeEvent({ id: 1, start: '2026-07-05T09:00:00', end: '2026-07-05T10:00:00' }),
      ]);
      expect(schedule().week[0].hours['09:00'].length).toBe(1);

      fixture.componentRef.setInput('slotMinutes', 60);
      fixture.detectChanges();

      const day = schedule().week[0];
      expect(day.hours['09:00'].length).toBe(1);
      expect(day.hours['09:30']).toBeUndefined();
    });
  });

  describe('break hours (breakHours)', () => {
    function createWithBreak(breakHours: BreakHour[], slotMinutes?: number, data: CalendarData[] = []) {
      fixture = TestBed.createComponent(NgBsCalendarComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('data', data);
      fixture.componentRef.setInput('start', SUNDAY);
      fixture.componentRef.setInput('breakHours', breakHours);
      if (slotMinutes !== undefined) fixture.componentRef.setInput('slotMinutes', slotMinutes);
      fixture.detectChanges();
    }

    it('marks slots within a break range as blocked', () => {
      createWithBreak([{ start: '12:00', end: '13:00' }]);
      expect((component as any).isBlocked('11:30')).toBe(false);
      expect((component as any).isBlocked('12:00')).toBe(true);
      expect((component as any).isBlocked('12:30')).toBe(true);
      expect((component as any).isBlocked('13:00')).toBe(false);
    });

    it('supports multiple break ranges', () => {
      createWithBreak([{ start: '12:00', end: '13:00' }, { start: '09:00', end: '09:30' }]);
      expect((component as any).isBlocked('09:00')).toBe(true);
      expect((component as any).isBlocked('09:30')).toBe(false);
      expect((component as any).isBlocked('12:30')).toBe(true);
    });

    it('does not blank out the schedule dict — an existing event in a blocked slot still shows', () => {
      createWithBreak([{ start: '12:00', end: '13:00' }], undefined, [
        makeEvent({ id: 1, start: '2026-07-05T12:00:00', end: '2026-07-05T12:30:00' }),
      ]);
      expect(schedule().week[0].hours['12:00'].length).toBe(1);
      expect((component as any).isBlocked('12:00')).toBe(true);
    });

    it('warns and ignores an invalid break range (bad slot / start >= end), keeps valid ones', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      createWithBreak([{ start: '12:15', end: '13:00' }, { start: '09:00', end: '09:30' }]);
      expect(warn).toHaveBeenCalled();
      expect((component as any).isBlocked('12:00')).toBe(false); // range inválido, ignorado inteiro
      expect((component as any).isBlocked('09:00')).toBe(true); // range válido, mantido
    });

    it('re-expands break ranges against the new grid when slotMinutes changes', () => {
      createWithBreak([{ start: '12:00', end: '13:00' }], 30);
      expect((component as any).isBlocked('12:30')).toBe(true);

      fixture.componentRef.setInput('slotMinutes', 60);
      fixture.detectChanges();

      expect((component as any).isBlocked('12:00')).toBe(true);
      expect((component as any).isBlocked('12:30')).toBe(false); // não é mais um slot válido em grid de 1h
    });
  });

  describe('view toggling', () => {
    it('rebuilds the schedule and emits changeWeek when view changes after init', () => {
      create([]);
      let range: any = null;
      component.changeWeek.subscribe(r => range = r);

      fixture.componentRef.setInput('view', 'day');
      fixture.detectChanges();

      expect(schedule().week.length).toBe(1);
      expect(schedule().week[0].label).toBe(SUNDAY);
      expect(range).not.toBeNull();
      expect(range.start).toBe(SUNDAY);
      expect(range.end).toBe(SUNDAY);
    });

    it('going back to week view re-anchors on the day that was visible', () => {
      createDay([], '2026-07-08'); // quarta-feira, dentro da semana de SUNDAY
      fixture.componentRef.setInput('view', 'week');
      fixture.detectChanges();

      expect(schedule().week.length).toBe(7);
      expect(schedule().week[0].label).toBe(SUNDAY);
    });
  });
});
