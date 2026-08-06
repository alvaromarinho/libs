import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { NgBsToastServiceComponent } from './ng-bs-toast-service.component';
import { NgBsToastService } from './ng-bs-toast-service.service';

const shown: any[] = [];
const hidden: any[] = [];
const disposed: any[] = [];

// Toast real do Bootstrap agenda callbacks de transição que estouram após o
// teardown do jsdom — aqui interessa a lógica do componente. hide() dispara
// 'hidden.bs.toast' de imediato (sem a transição real) pra simular o ciclo completo.
vi.mock('bootstrap', () => {
  class FakeToast {
    constructor(public element: HTMLElement, public options: any) {}
    show() { shown.push(this); }
    hide() { hidden.push(this); this.element.dispatchEvent(new Event('hidden.bs.toast')); }
    dispose() { disposed.push(this); }
  }
  return { Toast: FakeToast };
});

describe('NgBsToastServiceComponent', () => {
  let component: NgBsToastServiceComponent;
  let fixture: ComponentFixture<NgBsToastServiceComponent>;
  let service: NgBsToastService;

  beforeEach(async () => {
    shown.length = 0;
    hidden.length = 0;
    disposed.length = 0;
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [ NgBsToastServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgBsToastServiceComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(NgBsToastService);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a toast with resolved style/theme/position/duration defaults', () => {
    service.send('Título', 'mensagem', 'success');
    vi.advanceTimersByTime(0); // initializeToast (delay 0)
    fixture.detectChanges();

    expect(component.toastData.length).toBe(1);
    const toast = component.toastData[0];
    expect(toast.resolvedStyle).toBe('success');
    expect(toast.resolvedTheme).toBe('bootstrap');
    expect(toast.resolvedPosition).toBe('top-end');
    expect(toast.resolvedDuration).toBe(4000); // success isn't warning/danger
    expect(fixture.nativeElement.querySelector('#toast_0')).toBeTruthy();
    expect(shown.length).toBe(1);
    expect(shown[0].options).toEqual({ autohide: false });
  });

  it('defaults to style primary when omitted', () => {
    service.send('t', null);
    vi.advanceTimersByTime(0);
    expect(component.toastData[0].resolvedStyle).toBe('primary');
    expect(component.toastData[0].resolvedDuration).toBe(4000);
  });

  it('resolves duration from style: warning 7000, danger 10000', () => {
    service.send('t', 'm', 'warning');
    service.send('t', 'm', 'danger');
    vi.advanceTimersByTime(0);

    expect(component.toastData[0].resolvedDuration).toBe(7000);
    expect(component.toastData[1].resolvedDuration).toBe(10000);
  });

  it('an explicit duration overrides the style default', () => {
    service.send('t', 'm', 'danger', 1234);
    vi.advanceTimersByTime(0);
    expect(component.toastData[0].resolvedDuration).toBe(1234);
  });

  it('uses the [theme] @Input as the default when send() passes no theme', () => {
    component.theme = 'bootstrap-dark';
    service.send('t', 'm', 'primary');
    vi.advanceTimersByTime(0);
    expect(component.toastData[0].resolvedTheme).toBe('bootstrap-dark');
  });

  it('a per-call theme option still overrides the [theme] @Input default', () => {
    component.theme = 'bootstrap-dark';
    service.send('t', 'm', 'primary', undefined, { theme: 'bootstrap' });
    vi.advanceTimersByTime(0);
    expect(component.toastData[0].resolvedTheme).toBe('bootstrap');
  });

  it('respects theme/position options', () => {
    service.send('t', 'm', 'info', undefined, { theme: 'bootstrap-dark', position: 'bottom-center' });
    vi.advanceTimersByTime(0);
    expect(component.toastData[0].resolvedTheme).toBe('bootstrap-dark');
    expect(component.toastData[0].resolvedPosition).toBe('bottom-center');
  });

  it('stacks multiple toasts with unique incremental ids', () => {
    service.send('a', null);
    service.send('b', null);
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(component.toastData.map(t => t.id)).toEqual([0, 1]);
    expect(fixture.nativeElement.querySelectorAll('.toast').length).toBe(2);
  });

  it('auto-hides after the resolved duration and disposes on hidden.bs.toast', () => {
    service.send('t', 'm', 'primary', 1000);
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    vi.advanceTimersByTime(1000);

    expect(hidden.length).toBe(1);
    expect(disposed.length).toBe(1);
    expect(component.toastData.length).toBe(0);
  });

  it('removes and disposes the toast on hidden.bs.toast dispatched directly', () => {
    service.send('t', 'm');
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#toast_0');
    element.dispatchEvent(new Event('hidden.bs.toast'));

    expect(component.toastData.length).toBe(0);
    expect(disposed.length).toBe(1);
  });

  it('completes send()\'s Observable once the toast closes', () => {
    let closed = false;
    service.send('t', 'm', 'primary', 500).subscribe({ complete: () => closed = true });
    vi.advanceTimersByTime(0);
    vi.advanceTimersByTime(500);
    expect(closed).toBe(true);
  });

  it('pausing on hover stops the auto-hide timer; resuming restarts it with the remaining time', () => {
    service.send('t', 'm', 'primary', 1000);
    vi.advanceTimersByTime(0);
    const toast = component.toastData[0];

    vi.advanceTimersByTime(400);
    component.pauseToast(toast);
    expect(toast.paused).toBe(true);
    expect(toast.remainingMs).toBe(600);

    vi.advanceTimersByTime(10000); // paused: nothing should fire
    expect(component.toastData.length).toBe(1);

    component.resumeToast(toast);
    vi.advanceTimersByTime(600);
    expect(component.toastData.length).toBe(0);
  });

  it('queues toasts beyond maxToastsPerPosition and shows the next one when a slot frees up', () => {
    component.maxToastsPerPosition = 2;
    service.send('a', null, 'primary', 1000);
    service.send('b', null, 'primary', 1000);
    service.send('c', null, 'primary', 1000); // queued, position 'top-end' already has 2
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(component.toastData.length).toBe(2);
    expect(shown.length).toBe(2);

    vi.advanceTimersByTime(1000); // 'a' and 'b' close together, 'c' should be dequeued
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(component.toastData.map(t => t.title)).toContain('c');
  });

  it('renders one container per position in use', () => {
    service.send('a', null, 'primary', undefined, { position: 'top-start' });
    service.send('b', null, 'primary', undefined, { position: 'bottom-end' });
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    const containers = fixture.nativeElement.querySelectorAll('.toast-container');
    expect(containers.length).toBe(2);
  });

  it('applies data-bs-theme="dark" for the bootstrap-dark theme only', () => {
    service.send('a', null, 'primary', undefined, { theme: 'bootstrap-dark', position: 'top-start' });
    service.send('b', null, 'primary', undefined, { theme: 'bootstrap', position: 'top-end' });
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    const toasts: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.toast'));
    expect(toasts[0].getAttribute('data-bs-theme')).toBe('dark');
    expect(toasts[1].getAttribute('data-bs-theme')).toBeNull();
  });

  it('progress bar contrasts against style "dark" on both themes', () => {
    service.send('a', null, 'dark', undefined, { theme: 'bootstrap', position: 'top-start' });
    service.send('b', null, 'dark', undefined, { theme: 'bootstrap-dark', position: 'top-end' });
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    const bars: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.toast-progress-bar'));
    expect(bars[0].style.backgroundColor).toBe('rgba(255, 255, 255, 0.75)');
    expect(bars[1].style.backgroundColor).toBe('var(--bs-dark-text-emphasis)');
  });

  it('dismiss(id) hides the matching toast', () => {
    service.send('t', 'm', 'primary', 999999);
    vi.advanceTimersByTime(0);

    service.dismiss(0);

    expect(hidden.length).toBe(1);
    expect(component.toastData.length).toBe(0);
  });

  it('dismissAll() closes everything shown and queued, without promoting queued toasts', () => {
    component.maxToastsPerPosition = 1;
    service.send('a', null, 'primary', 999999);
    service.send('b', null, 'primary', 999999); // queued, slot taken by 'a'
    vi.advanceTimersByTime(0);

    service.dismissAll();

    expect(component.toastData.length).toBe(0);
  });

  it('retries initialization until the element exists', () => {
    const addToast = (component as any).addToast.bind(component);
    const query = fixture.nativeElement.querySelector.bind(fixture.nativeElement);
    addToast({ title: 't', message: null });
    vi.advanceTimersByTime(500);
    expect(query('#toast_0')).toBeTruthy();
  });

  it('stops listening after destroy', () => {
    fixture.destroy();
    service.send('t', 'm');
    expect(component.toastData.length).toBe(0);
  });
});
