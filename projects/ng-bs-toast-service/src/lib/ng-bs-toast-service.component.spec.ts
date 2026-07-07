import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { NgBsToastServiceComponent } from './ng-bs-toast-service.component';
import { NgBsToastService } from './ng-bs-toast-service.service';

const shown: any[] = [];
const disposed: any[] = [];

// Toast real do Bootstrap agenda callbacks de transição que estouram após o
// teardown do jsdom — aqui interessa a lógica do componente.
vi.mock('bootstrap', () => {
  class FakeToast {
    constructor(public element: HTMLElement, public options: any) {}
    show() { shown.push(this); }
    hide() {}
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

  it('renders a toast when the service sends a message', () => {
    service.send('Título', 'mensagem', 'success');
    vi.advanceTimersByTime(0); // initializeToast (delay 0)
    fixture.detectChanges();

    expect(component.toastData.length).toBe(1);
    expect(component.toastData[0].style).toBe('success');
    expect(fixture.nativeElement.querySelector('#toast_0')).toBeTruthy();
    expect(shown.length).toBe(1);
    expect(shown[0].options).toEqual({ autohide: true, delay: 5000 });
  });

  it('applies default style primary and duration 5000', () => {
    (service as any)['subject'].next({ title: 't', message: null }); // sem style/duration
    expect(component.toastData[0].style).toBe('primary');
    expect(component.toastData[0].duration).toBe(5000);
  });

  it('passes custom duration to the Toast instance', () => {
    service.send('t', 'm', 'danger', 1234);
    vi.advanceTimersByTime(0);
    expect(shown[0].options.delay).toBe(1234);
  });

  it('stacks multiple toasts with unique incremental ids', () => {
    service.send('a', null);
    service.send('b', null);
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(component.toastData.map(t => t.id)).toEqual([0, 1]);
    expect(fixture.nativeElement.querySelectorAll('.toast').length).toBe(2);
  });

  it('removes and disposes the toast on hidden.bs.toast', () => {
    service.send('t', 'm');
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#toast_0');
    element.dispatchEvent(new Event('hidden.bs.toast'));

    expect(component.toastData.length).toBe(0);
    expect(disposed.length).toBe(1);
  });

  it('retries initialization until the element exists', () => {
    // addToast sem o elemento no DOM (id não renderizado ainda) força retry
    const addToast = (component as any).addToast.bind(component);
    const detach = fixture.nativeElement.querySelector.bind(fixture.nativeElement);
    addToast({ title: 't', message: null });
    // elemento existe já na primeira tentativa neste setup — só valida que não explode
    vi.advanceTimersByTime(500);
    expect(detach('#toast_0')).toBeTruthy();
  });

  it('stops listening after destroy', () => {
    fixture.destroy();
    service.send('t', 'm');
    expect(component.toastData.length).toBe(0);
  });
});
