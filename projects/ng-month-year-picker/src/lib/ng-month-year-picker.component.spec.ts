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
});
