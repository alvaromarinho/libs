import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgMonthPickerComponent } from './ng-month-picker.component';

describe('NgMonthPickerComponent', () => {
  let component: NgMonthPickerComponent;
  let fixture: ComponentFixture<NgMonthPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NgMonthPickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgMonthPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
