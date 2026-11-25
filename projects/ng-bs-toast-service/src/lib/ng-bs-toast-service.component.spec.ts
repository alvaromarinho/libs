import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { NgBsToastServiceComponent } from './ng-bs-toast-service.component';
import { NgBsToastService, ToastTheme } from './ng-bs-toast-service.service';

interface FakeToastLike {
    element: HTMLElement;
    options: unknown;
}

const shown: FakeToastLike[] = [];
const hidden: FakeToastLike[] = [];
const disposed: FakeToastLike[] = [];

// The real bootstrap Toast schedules transition callbacks that outlive jsdom; what matters here is the
// component's logic. hide() fires 'hidden.bs.toast' right away to simulate the full cycle.
vi.mock('bootstrap', () => {
    class FakeToast {
        constructor(public element: HTMLElement, public options: unknown) { }
        show(): void {
            shown.push(this);
        }
        hide(): void {
            hidden.push(this);
            this.element.dispatchEvent(new Event('hidden.bs.toast'));
        }
        dispose(): void {
            disposed.push(this);
        }
    }
    return { Toast: FakeToast };
});

@Component({
    standalone: true,
    imports: [NgBsToastServiceComponent],
    template: `
        @if (visible()) {
            <ng-bs-toast-service [theme]="theme()" [maxToastsPerPosition]="max()"></ng-bs-toast-service>
        }
    `
})
class HostComponent {

    readonly visible = signal(true);
    readonly theme = signal<ToastTheme>('bootstrap');
    readonly max = signal(5);

}

describe('NgBsToastServiceComponent', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let service: NgBsToastService;

    const el = (): HTMLElement => fixture.nativeElement;
    const toasts = (): HTMLElement[] => Array.from(el().querySelectorAll<HTMLElement>('.toast'));
    const titles = (): string[] => toasts().map(t => t.querySelector('.fw-bold')!.textContent!.trim());
    const durationOf = (toast: HTMLElement): string => toast.style.getPropertyValue('--toast-duration');
    const render = (): Promise<void> => fixture.whenStable();
    const advance = async (ms: number): Promise<void> => {
        await vi.advanceTimersByTimeAsync(ms);
        await fixture.whenStable();
    };

    beforeEach(async () => {
        shown.length = 0;
        hidden.length = 0;
        disposed.length = 0;
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });

        await TestBed.configureTestingModule({
            imports: [HostComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        service = TestBed.inject(NgBsToastService);
        await render();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders nothing without toasts', () => {
        expect(el().querySelector('.toast-container')).toBeNull();
    });

    it('renders a toast with default style, theme and position, and shows it', async () => {
        service.send('Título', 'mensagem', 'success');
        await render();

        const [toast] = toasts();
        expect(toast.id).toBe('toast_0');
        expect(toast.classList).toContain('text-bg-success');
        expect(toast.getAttribute('data-bs-theme')).toBeNull();
        expect(toast.getAttribute('role')).toBe('status');
        expect(toast.getAttribute('aria-live')).toBe('polite');
        expect(toast.querySelector('i')!.classList).toContain('bi-check-circle-fill');
        expect(toast.textContent).toContain('mensagem');
        expect(durationOf(toast)).toBe('4000ms');
        expect(toast.parentElement!.classList).toContain('top-0');
        expect(toast.parentElement!.classList).toContain('end-0');
        expect(shown.length).toBe(1);
        expect(shown[0].options).toEqual({ autohide: false });
    });

    it('defaults to style primary and omits an empty message', async () => {
        service.send('t', null);
        await render();
        expect(toasts()[0].classList).toContain('text-bg-primary');
        expect(toasts()[0].querySelectorAll('.lh-sm.mt-1').length).toBe(0);
    });

    it('resolves duration from style (warning 7000, danger 10000) and marks them urgent', async () => {
        service.send('t', 'm', 'warning');
        service.send('t', 'm', 'danger');
        await render();

        expect(toasts().map(durationOf)).toEqual(['7000ms', '10000ms']);
        expect(toasts().map(t => t.getAttribute('role'))).toEqual(['alert', 'alert']);
        expect(toasts()[1].getAttribute('aria-live')).toBe('assertive');
    });

    it('an explicit duration overrides the style default', async () => {
        service.send('t', 'm', 'danger', 1234);
        await render();
        expect(durationOf(toasts()[0])).toBe('1234ms');
    });

    it('uses the [theme] input as default, and a per-call theme overrides it', async () => {
        host.theme.set('bootstrap-dark');
        await render();
        service.send('a', 'm', 'primary');
        service.send('b', 'm', 'primary', undefined, { theme: 'bootstrap' });
        await render();

        expect(toasts()[0].getAttribute('data-bs-theme')).toBe('dark');
        expect(toasts()[0].classList).toContain('bg-primary-subtle');
        expect(toasts()[1].getAttribute('data-bs-theme')).toBeNull();
        expect(toasts()[1].classList).toContain('text-bg-primary');
    });

    it('renders one container per position in use, with the position classes', async () => {
        service.send('a', null, 'primary', undefined, { position: 'top-start' });
        service.send('b', null, 'primary', undefined, { position: 'bottom-center' });
        await render();

        const containers = Array.from(el().querySelectorAll('.toast-container'));
        expect(containers.length).toBe(2);
        expect(['top-0', 'start-0'].every(c => containers[0].classList.contains(c))).toBe(true);
        expect(['bottom-0', 'start-50', 'translate-middle-x'].every(c => containers[1].classList.contains(c))).toBe(true);
        expect(containers[1].classList).toContain('position-fixed');
    });

    it('stacks multiple toasts with unique incremental ids', async () => {
        service.send('a', null);
        service.send('b', null);
        await render();
        expect(toasts().map(t => t.id)).toEqual(['toast_0', 'toast_1']);
    });

    it('auto-hides after the resolved duration and disposes the instance', async () => {
        service.send('t', 'm', 'primary', 1000);
        await render();

        await advance(999);
        expect(toasts().length).toBe(1);

        await advance(1);
        expect(hidden.length).toBe(1);
        expect(disposed.length).toBe(1);
        expect(toasts().length).toBe(0);
    });

    it('removes the toast when bootstrap fires hidden.bs.toast (close button)', async () => {
        service.send('t', 'm');
        await render();

        toasts()[0].dispatchEvent(new Event('hidden.bs.toast'));
        await render();

        expect(toasts().length).toBe(0);
        expect(disposed.length).toBe(1);
    });

    it('completes send()\'s Observable once the toast closes', async () => {
        let closed = false;
        service.send('t', 'm', 'primary', 500).subscribe({ complete: () => closed = true });
        await render();

        await advance(500);

        expect(closed).toBe(true);
    });

    it('pauses the timer and the progress bar on hover and resumes with the remaining time', async () => {
        service.send('t', 'm', 'primary', 1000);
        await render();

        await advance(400);
        toasts()[0].dispatchEvent(new Event('mouseenter'));
        await render();
        expect(toasts()[0].getAttribute('data-paused')).toBe('true');

        await advance(10000);
        expect(toasts().length).toBe(1);

        toasts()[0].dispatchEvent(new Event('mouseleave'));
        await render();
        expect(toasts()[0].getAttribute('data-paused')).toBeNull();

        await advance(599);
        expect(toasts().length).toBe(1);
        await advance(1);
        expect(toasts().length).toBe(0);
    });

    it('queues toasts beyond maxToastsPerPosition and shows the next one when a slot frees up', async () => {
        host.max.set(2);
        await render();
        service.send('a', null, 'primary', 1000);
        service.send('b', null, 'primary', 2000);
        service.send('c', null, 'primary', 1000);
        await render();

        expect(titles()).toEqual(['a', 'b']);
        expect(shown.length).toBe(2);

        await advance(1000);

        expect(titles()).toEqual(['b', 'c']);
        expect(shown.length).toBe(3);
    });

    it('progress bar contrasts against style "dark" on both themes', async () => {
        service.send('a', null, 'dark', undefined, { theme: 'bootstrap', position: 'top-start' });
        service.send('b', null, 'dark', undefined, { theme: 'bootstrap-dark', position: 'top-end' });
        service.send('c', null, 'light', undefined, { theme: 'bootstrap', position: 'top-end' });
        await render();

        const bars = Array.from(el().querySelectorAll<HTMLElement>('.toast-progress-bar'));
        expect(bars[0].style.backgroundColor).toBe('rgba(255, 255, 255, 0.75)');
        expect(bars[1].style.backgroundColor).toBe('var(--bs-dark-text-emphasis)');
        expect(bars[2].style.backgroundColor).toBe('rgba(0, 0, 0, 0.5)');
    });

    it('uses the white close button only on dark solid backgrounds', async () => {
        service.send('a', null, 'danger', undefined, { position: 'top-start' });
        service.send('b', null, 'light', undefined, { position: 'top-end' });
        await render();

        const close = Array.from(el().querySelectorAll('.btn-close'));
        expect(close[0].classList).toContain('btn-close-white');
        expect(close[1].classList).not.toContain('btn-close-white');
        expect(close[1].classList).toContain('btn-close');
    });

    it('dismiss(id) hides the matching toast', async () => {
        let closed = false;
        service.send('t', 'm', 'primary', 999999).subscribe({ complete: () => closed = true });
        service.send('u', 'm', 'primary', 999999);
        await render();

        service.dismiss(0);
        await render();

        expect(hidden.length).toBe(1);
        expect(titles()).toEqual(['u']);
        expect(closed).toBe(true);
    });

    it('dismiss(id) of a queued toast drops it from the queue', async () => {
        host.max.set(1);
        await render();
        let closed = false;
        service.send('a', null, 'primary', 1000);
        service.send('b', null, 'primary', 1000).subscribe({ complete: () => closed = true });
        await render();

        service.dismiss(1);
        await advance(1000);

        expect(closed).toBe(true);
        expect(toasts().length).toBe(0);
        expect(shown.length).toBe(1);
    });

    it('dismissAll() closes everything shown and queued, without promoting queued toasts', async () => {
        host.max.set(1);
        await render();
        const closed: number[] = [];
        service.send('a', null, 'primary', 999999).subscribe({ complete: () => closed.push(0) });
        service.send('b', null, 'primary', 999999).subscribe({ complete: () => closed.push(1) });
        await render();

        service.dismissAll();
        await render();

        expect(toasts().length).toBe(0);
        expect(shown.length).toBe(1);
        expect(closed.sort()).toEqual([0, 1]);
    });

    it('closes everything and stops listening when destroyed', async () => {
        let closed = false;
        service.send('t', 'm', 'primary', 999999).subscribe({ complete: () => closed = true });
        await render();

        host.visible.set(false);
        await render();
        expect(closed).toBe(true);
        expect(disposed.length).toBe(1);

        service.send('later', 'm');
        await advance(0);
        expect(shown.length).toBe(1);
    });

    it('shows toasts sent while no component existed once one is created', async () => {
        host.visible.set(false);
        await render();
        service.send('primeiro', null);
        service.send('segundo', null);

        host.visible.set(true);
        await render();

        expect(titles()).toEqual(['primeiro', 'segundo']);
    });
});
