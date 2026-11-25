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

  describe('without a listener', () => {
    let fresh: NgBsToastService;

    beforeEach(() => {
      fresh = new NgBsToastService();
    });

    it('buffers every toast sent before the first listener and delivers them in order', () => {
      fresh.send('primeiro', null);
      fresh.send('segundo', null);
      const late: InternalToastMessage[] = [];
      fresh.listen().subscribe(m => late.push(m));
      expect(late.map(m => m.title)).toEqual(['primeiro', 'segundo']);
    });

    it('dismiss() and dismissAll() also drop buffered toasts and complete their Observable', () => {
      const closed: string[] = [];
      fresh.send('a', null).subscribe({ complete: () => closed.push('a') });
      fresh.send('b', null).subscribe({ complete: () => closed.push('b') });
      fresh.send('c', null).subscribe({ complete: () => closed.push('c') });
      fresh.dismiss(0);
      fresh.dismissAll();
      const late: InternalToastMessage[] = [];
      fresh.listen().subscribe(m => late.push(m));
      expect(closed).toEqual(['a', 'b', 'c']);
      expect(late).toEqual([]);
    });

    it('keeps only the newest 20 buffered toasts and completes the Observable of the dropped ones', () => {
      const closed: number[] = [];
      for (let i = 0; i < 23; i++) {
        fresh.send(`t${i}`, null).subscribe({ complete: () => closed.push(i) });
      }
      const late: InternalToastMessage[] = [];
      fresh.listen().subscribe(m => late.push(m));

      expect(closed).toEqual([0, 1, 2]);
      expect(late.length).toBe(20);
      expect(late[0].title).toBe('t3');
      expect(late[19].title).toBe('t22');
    });

    it('delivers a buffered toast only once', () => {
      fresh.send('primeiro', null);
      fresh.listen().subscribe().unsubscribe();
      const second: InternalToastMessage[] = [];
      fresh.listen().subscribe(m => second.push(m));
      expect(second).toEqual([]);
    });

    it('does not replay an old toast to a new listener after the previous one left', () => {
      const first: InternalToastMessage[] = [];
      const sub = fresh.listen().subscribe(m => first.push(m));
      fresh.send('visto', null);
      sub.unsubscribe();

      fresh.send('enquanto ninguém ouve', null);
      const next: InternalToastMessage[] = [];
      fresh.listen().subscribe(m => next.push(m));

      expect(first.map(m => m.title)).toEqual(['visto']);
      expect(next.map(m => m.title)).toEqual(['enquanto ninguém ouve']);
    });
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
