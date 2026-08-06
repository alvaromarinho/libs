import { TestBed } from '@angular/core/testing';

import { InternalToastMessage, NgBsToastService, resolveToastDuration } from './ng-bs-toast-service.service';

describe('resolveToastDuration', () => {
  it('resolves 7000 for warning, 10000 for danger, 4000 for the rest', () => {
    expect(resolveToastDuration('warning')).toBe(7000);
    expect(resolveToastDuration('danger')).toBe(10000);
    expect(resolveToastDuration('primary')).toBe(4000);
    expect(resolveToastDuration('success')).toBe(4000);
    expect(resolveToastDuration(undefined)).toBe(4000);
  });
});

describe('NgBsToastService', () => {
  let service: NgBsToastService;
  let emitted: InternalToastMessage[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgBsToastService);
    emitted = [];
    service.listen().subscribe(m => emitted.push(m));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('send emits the toast message with an incremental id', () => {
    service.send('Título', 'mensagem', 'success', 3000);
    service.send('Outro', null, 'danger');

    expect(emitted[0]).toEqual({ id: 0, title: 'Título', message: 'mensagem', style: 'success', duration: 3000, theme: undefined, position: undefined });
    expect(emitted[1]).toEqual({ id: 1, title: 'Outro', message: null, style: 'danger', duration: undefined, theme: undefined, position: undefined });
  });

  it('leaves style/duration undefined when not passed (resolved downstream)', () => {
    service.send('Título', null);
    expect(emitted[0].style).toBeUndefined();
    expect(emitted[0].duration).toBeUndefined();
  });

  it('carries theme/position through options', () => {
    service.send('t', 'm', 'info', undefined, { theme: 'bootstrap-dark', position: 'bottom-center' });
    expect(emitted[0].theme).toBe('bootstrap-dark');
    expect(emitted[0].position).toBe('bottom-center');
  });

  it('replays the last message to a late subscriber (ReplaySubject fix)', () => {
    service.send('primeiro', null);
    const late: InternalToastMessage[] = [];
    service.listen().subscribe(m => late.push(m));
    expect(late).toEqual([{ id: 0, title: 'primeiro', message: null, style: undefined, duration: undefined, theme: undefined, position: undefined }]);
  });

  it('dismiss() emits the id on listenDismiss()', () => {
    const ids: number[] = [];
    service.listenDismiss().subscribe(id => ids.push(id));
    service.dismiss(42);
    expect(ids).toEqual([42]);
  });

  it('dismissAll() emits on listenDismissAll()', () => {
    let count = 0;
    service.listenDismissAll().subscribe(() => count++);
    service.dismissAll();
    expect(count).toBe(1);
  });

  it('send()\'s Observable completes when notifyClosed(id) is called', () => {
    let closed = false;
    service.send('t', null).subscribe({ complete: () => closed = true });
    service.notifyClosed(0);
    expect(closed).toBe(true);
  });
});
