import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgMonthYearPickerComponent } from './ng-month-year-picker.component';

describe('NgMonthYearPickerComponent', () => {
  let component: NgMonthYearPickerComponent;
  let fixture: ComponentFixture<NgMonthYearPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NgMonthYearPickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgMonthYearPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('displayLabel', () => {
    it('returns explicit label when set', () => {
      component.label = 'Custom';
      component.value = '2026-05';
      expect(component.displayLabel).toBe('Custom');
    });

    it('derives label from value and monthNames', () => {
      component.value = '2026-05';
      expect(component.displayLabel).toBe('Mai 2026');
    });

    it('returns empty string when value is empty or invalid', () => {
      component.value = '';
      expect(component.displayLabel).toBe('');
      component.value = 'not-a-date';
      expect(component.displayLabel).toBe('');
    });

    it('respects custom monthNames', () => {
      component.monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      component.value = '2024-01';
      expect(component.displayLabel).toBe('January 2024');
    });
  });

  describe('toggle', () => {
    it('opens the picker and syncs pickerYear from value', () => {
      component.value = '2020-03';
      component.toggle(new Event('click'));
      expect(component.showPicker).toBe(true);
      expect(component.pickerYear).toBe(2020);
    });

    it('uses current year when value is empty', () => {
      component.value = '';
      component.toggle(new Event('click'));
      expect(component.pickerYear).toBe(new Date().getFullYear());
    });

    it('closes when already open', () => {
      component.toggle(new Event('click'));
      component.toggle(new Event('click'));
      expect(component.showPicker).toBe(false);
    });

    it('does nothing when disabled', () => {
      component.disabled = true;
      component.toggle(new Event('click'));
      expect(component.showPicker).toBe(false);
    });

    it('stops event propagation so document:click does not immediately close it', () => {
      let stopped = false;
      const event = { stopPropagation: () => stopped = true } as unknown as Event;
      component.toggle(event);
      expect(stopped).toBe(true);
    });
  });

  describe('select', () => {
    it('emits YYYY-MM with zero-padded month and closes the picker', () => {
      component.pickerYear = 2026;
      component.showPicker = true;
      let emitted = '';
      component.valueChange.subscribe((v: string) => emitted = v);

      component.select(0);

      expect(emitted).toBe('2026-01');
      expect(component.showPicker).toBe(false);
    });

    it('emits double-digit months without padding artifacts', () => {
      component.pickerYear = 2026;
      let emitted = '';
      component.valueChange.subscribe((v: string) => emitted = v);

      component.select(11);

      expect(emitted).toBe('2026-12');
    });

    it('does not mutate value directly (parent owns it)', () => {
      component.value = '2020-01';
      component.pickerYear = 2026;
      component.select(5);
      expect(component.value).toBe('2020-01');
    });
  });

  describe('selectToday', () => {
    it('emits current year-month', () => {
      const today = new Date();
      const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      let emitted = '';
      component.valueChange.subscribe((v: string) => emitted = v);

      component.pickerYear = 1999;
      component.selectToday();

      expect(emitted).toBe(expected);
      expect(component.pickerYear).toBe(today.getFullYear());
    });
  });

  describe('isSelected', () => {
    it('is true only when pickerYear matches the selected year and month', () => {
      component.value = '2026-05';
      component.pickerYear = 2026;
      expect(component.isSelected(4)).toBe(true);
      expect(component.isSelected(5)).toBe(false);
    });

    it('is false when browsing a different year', () => {
      component.value = '2026-05';
      component.pickerYear = 2025;
      expect(component.isSelected(4)).toBe(false);
    });
  });

  describe('outside click', () => {
    it('closes the picker on document click', () => {
      component.showPicker = true;
      component.onDocumentClick();
      expect(component.showPicker).toBe(false);
    });
  });

  describe('ngOnChanges', () => {
    it('resyncs pickerYear from value while picker is closed', () => {
      component.value = '2018-07';
      component.showPicker = false;
      component.ngOnChanges();
      expect(component.pickerYear).toBe(2018);
    });

    it('leaves pickerYear alone while picker is open', () => {
      component.showPicker = true;
      component.pickerYear = 2030;
      component.value = '2018-07';
      component.ngOnChanges();
      expect(component.pickerYear).toBe(2030);
    });
  });
});
