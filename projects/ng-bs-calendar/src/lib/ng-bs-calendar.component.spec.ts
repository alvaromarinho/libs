import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgBsCalendarComponent } from './ng-bs-calendar.component';

describe('NgBsCalendarComponent', () => {
  let component: NgBsCalendarComponent;
  let fixture: ComponentFixture<NgBsCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgBsCalendarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgBsCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
