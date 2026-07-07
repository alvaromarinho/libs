import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgBsPaginationComponent } from './ng-bs-pagination.component';

describe('NgBsPaginationComponent', () => {
  let component: NgBsPaginationComponent;
  let fixture: ComponentFixture<NgBsPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NgBsPaginationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgBsPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('totalPages', () => {
    it('rounds up partial pages', () => {
      component.total = 95;
      component.itemPerPage = 10;
      expect(component.totalPages).toBe(10);
    });

    it('is at least 1 when total is 0', () => {
      component.total = 0;
      expect(component.totalPages).toBe(1);
    });
  });

  describe('pages window', () => {
    beforeEach(() => {
      component.total = 200; // 20 páginas
      component.itemPerPage = 10;
      component.maxPagesToShow = 5;
    });

    it('centers the window on current', () => {
      component.current = 10;
      expect(component.pages).toEqual([8, 9, 10, 11, 12]);
    });

    it('clamps at the start', () => {
      component.current = 1;
      expect(component.pages).toEqual([1, 2, 3, 4, 5]);
    });

    it('clamps at the end', () => {
      component.current = 20;
      expect(component.pages).toEqual([16, 17, 18, 19, 20]);
    });

    it('shows fewer pages when totalPages < maxPagesToShow', () => {
      component.total = 25; // 3 páginas
      expect(component.pages).toEqual([1, 2, 3]);
    });
  });

  describe('infoContext', () => {
    it('computes start/end for a middle page', () => {
      component.total = 95;
      component.itemPerPage = 10;
      component.current = 3;
      expect(component.infoContext).toEqual({ start: 21, end: 30, total: 95, current: 3, totalPages: 10 });
    });

    it('clamps end on the last page', () => {
      component.total = 95;
      component.itemPerPage = 10;
      component.current = 10;
      expect(component.infoContext.end).toBe(95);
    });

    it('start is 0 when total is 0', () => {
      component.total = 0;
      expect(component.infoContext.start).toBe(0);
    });
  });

  describe('input setters merge with defaults', () => {
    it('layout merges partial values', () => {
      component.layout = { type: 'center' };
      expect(component.layout).toEqual({ type: 'center', infoPosition: 'start', showInfo: true });
    });

    it('prevNext merges nested labels', () => {
      component.prevNext = { labels: { prev: 'Anterior' } };
      expect(component.prevNext.labels.prev).toBe('Anterior');
      expect(component.prevNext.labels.next).toBe('›');
      expect(component.prevNext.mode).toBe('icon');
    });

    it('firstLast merges nested labels', () => {
      component.firstLast = { show: false };
      expect(component.firstLast.show).toBe(false);
      expect(component.firstLast.labels).toEqual({ first: '«', last: '»' });
    });
  });

  describe('navigation emits', () => {
    beforeEach(() => {
      component.total = 100;
      component.itemPerPage = 10;
      component.current = 5;
    });

    it('goTo emits change for a valid page', () => {
      let emitted = 0;
      component.change.subscribe((p: number) => emitted = p);
      component.goTo(6);
      expect(emitted).toBe(6);
    });

    it('goTo does not emit for current page or out of range', () => {
      let count = 0;
      component.change.subscribe(() => count++);
      component.goTo(5);   // página atual
      component.goTo(0);   // abaixo do range
      component.goTo(11);  // acima do range
      expect(count).toBe(0);
    });

    it('goFirst emits 1, but not when already on first page', () => {
      let emitted = 0;
      component.first.subscribe((p: number) => emitted = p);
      component.goFirst();
      expect(emitted).toBe(1);

      component.current = 1;
      emitted = 0;
      component.goFirst();
      expect(emitted).toBe(0);
    });

    it('goLast emits totalPages, but not when already on last page', () => {
      let emitted = 0;
      component.last.subscribe((p: number) => emitted = p);
      component.goLast();
      expect(emitted).toBe(10);

      component.current = 10;
      emitted = 0;
      component.goLast();
      expect(emitted).toBe(0);
    });
  });

  describe('css classes', () => {
    it('sizeClass is empty for md and pagination-sm/lg otherwise', () => {
      expect(component.sizeClass).toBe('');
      component.size = 'sm';
      expect(component.sizeClass).toBe('pagination-sm');
      component.size = 'lg';
      expect(component.sizeClass).toBe('pagination-lg');
    });

    it('wrapperClasses reflects stacked layout with info at end', () => {
      component.layout = { type: 'stacked', infoPosition: 'end' };
      expect(component.wrapperClasses).toContain('flex-column-reverse');
    });

    it('wrapperClasses reflects center layout', () => {
      component.layout = { type: 'center' };
      expect(component.wrapperClasses).toContain('justify-content-center');
      expect(component.wrapperClasses).not.toContain('flex-column');
    });
  });

  describe('rendering', () => {
    it('renders nothing when there is a single page', () => {
      component.total = 5;
      component.itemPerPage = 10;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.pagination')).toBeNull();
    });

    it('renders page buttons and marks current as active', () => {
      component.total = 30;
      component.itemPerPage = 10;
      component.current = 2;
      fixture.detectChanges();

      const active = fixture.nativeElement.querySelector('.page-item.active');
      expect(active?.textContent?.trim()).toBe('2');
    });
  });
});
