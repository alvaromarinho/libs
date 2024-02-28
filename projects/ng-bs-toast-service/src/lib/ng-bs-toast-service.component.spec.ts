import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgBsToastServiceComponent } from './ng-bs-toast-service.component';

describe('NgBsToastServiceComponent', () => {
  let component: NgBsToastServiceComponent;
  let fixture: ComponentFixture<NgBsToastServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgBsToastServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgBsToastServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
