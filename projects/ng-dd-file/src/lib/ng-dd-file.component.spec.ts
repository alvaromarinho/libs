import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgDdFileComponent } from './ng-dd-file.component';

describe('NgDdFileComponent', () => {
  let component: NgDdFileComponent;
  let fixture: ComponentFixture<NgDdFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgDdFileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgDdFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
