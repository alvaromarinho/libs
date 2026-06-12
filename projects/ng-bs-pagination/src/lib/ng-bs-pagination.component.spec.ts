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
});
