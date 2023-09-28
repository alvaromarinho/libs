import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgCollapseComponent } from './ng-collapse.component';

describe('NgCollapseComponent', () => {
  let component: NgCollapseComponent;
  let fixture: ComponentFixture<NgCollapseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgCollapseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgCollapseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
