import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTime } from 'luxon';

import { CalendarData, NgBsCalendarComponent } from './ng-bs-calendar.component';

// Semana fixa para os testes: 2026-07-05 (domingo) a 2026-07-11 (sábado)
const SUNDAY = '2026-07-05';

function makeEvent(partial: Partial<CalendarData> & { start: string; end: string }): CalendarData {
  return { id: Math.random(), title: 'event', color: '#000', ...partial };
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

  describe('week construction', () => {
    it('builds 7 consecutive days starting on the display-week start', () => {
      create([]);
      const week = schedule().week;
      expect(week.length).toBe(7);
      expect(week[0].label).toBe(SUNDAY);
      expect(week[6].label).toBe('2026-07-11');
      for (let i = 0; i < 7; i++) {
        expect(week[i].label).toBe(DateTime.fromISO(SUNDAY).plus({ day: i }).toFormat('yyyy-MM-dd'));
      }
    });

    it('computes prev/next week anchors', () => {
      create([]);
      expect(schedule().startWeek).toBe(SUNDAY);
      const prevStart = DateTime.fromISO(schedule().prev);
      const nextStart = DateTime.fromISO(schedule().next);
      expect(prevStart < DateTime.fromISO(SUNDAY)).toBe(true);
      expect(nextStart > DateTime.fromISO('2026-07-11')).toBe(true);
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
});
