import { TestBed } from '@angular/core/testing';

import { NgBsModalService } from './ng-bs-modal-service.service';
import { NgBsModalServiceData } from './ng-bs-modal-service.model';

describe('NgBsModalService', () => {
  let service: NgBsModalService;
  let emitted: NgBsModalServiceData[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgBsModalService);
    emitted = [];
    service.get().subscribe((d: NgBsModalServiceData) => emitted.push(d));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('open emits an open action with content and options', () => {
    const content = { body: 'hello' };
    service.open(content, { size: 'lg' });

    expect(emitted.length).toBe(1);
    expect(emitted[0].action).toBe('open');
    expect(emitted[0].content).toBe(content);
    expect(emitted[0].options?.size).toBe('lg');
  });

  it('open defaults options to an empty object', () => {
    service.open({ body: 'x' });
    expect(emitted[0].options).toEqual({});
  });

  it('close emits a close action', () => {
    service.close();
    expect(emitted[0]).toEqual({ action: 'close' });
  });

  it('closeAll emits a closeAll action', () => {
    service.closeAll();
    expect(emitted[0]).toEqual({ action: 'closeAll' });
  });
});
