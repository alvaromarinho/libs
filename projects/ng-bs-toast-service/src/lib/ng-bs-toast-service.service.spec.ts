import { TestBed } from '@angular/core/testing';

import { NgBsToastService, ToastMessage } from './ng-bs-toast-service.service';

describe('NgBsToastService', () => {
  let service: NgBsToastService;
  let emitted: ToastMessage[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgBsToastService);
    emitted = [];
    service.listen().subscribe(m => emitted.push(m));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('send emits the toast message', () => {
    service.send('Título', 'mensagem', 'success', 3000);
    expect(emitted).toEqual([{ title: 'Título', message: 'mensagem', style: 'success', duration: 3000 }]);
  });

  it('send defaults duration to 5000 and allows null message', () => {
    service.send('Título', null);
    expect(emitted[0].duration).toBe(5000);
    expect(emitted[0].message).toBeNull();
    expect(emitted[0].style).toBeUndefined();
  });
});
