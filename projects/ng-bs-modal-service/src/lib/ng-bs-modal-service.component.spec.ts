import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgBsModalServiceComponent } from './ng-bs-modal-service.component';

describe('NgBsModalServiceComponent', () => {
  let component: NgBsModalServiceComponent;
  let fixture: ComponentFixture<NgBsModalServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgBsModalServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgBsModalServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
