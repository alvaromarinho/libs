import { TestBed } from '@angular/core/testing';

import { NgBsModalService } from './ng-bs-modal.service';

describe('NgBsModalService', () => {
  let service: NgBsModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgBsModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
