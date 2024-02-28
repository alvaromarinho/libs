import { TestBed } from '@angular/core/testing';

import { NgBsToastService } from './ng-bs-toast-service.service';

describe('NgBsToastServiceService', () => {
  let service: NgBsToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgBsToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
