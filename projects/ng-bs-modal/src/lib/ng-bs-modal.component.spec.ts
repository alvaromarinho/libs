import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgBsModalComponent } from './ng-bs-modal.component';

describe('NgBsModalComponent', () => {
  let component: NgBsModalComponent;
  let fixture: ComponentFixture<NgBsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgBsModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgBsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
