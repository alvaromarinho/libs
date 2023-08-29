import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgGenerateTableComponent } from './ng-generate-table.component';

describe('NgGenerateTableComponent', () => {
  let component: NgGenerateTableComponent;
  let fixture: ComponentFixture<NgGenerateTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgGenerateTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgGenerateTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
