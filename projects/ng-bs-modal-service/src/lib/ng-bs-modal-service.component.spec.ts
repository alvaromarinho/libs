import { Component, OnInit, TemplateRef, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { NgBsModalServiceComponent } from './ng-bs-modal-service.component';
import { NgBsModalService } from './ng-bs-modal-service.service';

const modalEvents: string[] = [];
const carouselKeys: string[] = [];

// The real bootstrap Modal/Carousel schedule transition callbacks that outlive jsdom; what matters here is the
// component's logic. show()/hide() fire 'shown.bs.modal'/'hidden.bs.modal' right away, bubbling like bootstrap's.
vi.mock('bootstrap', () => {
    const instances = new Map<Element, unknown>();
    class FakeModal {
        constructor(private element: HTMLElement) { }
        static getOrCreateInstance(element: HTMLElement): FakeModal {
            if (!instances.has(element)) instances.set(element, new FakeModal(element));
            return instances.get(element) as FakeModal;
        }
        show(): void {
            modalEvents.push('show');
            this.element.dispatchEvent(new Event('shown.bs.modal', { bubbles: true }));
        }
        hide(): void {
            modalEvents.push('hide');
            this.element.dispatchEvent(new Event('hidden.bs.modal', { bubbles: true }));
        }
        dispose(): void {
            modalEvents.push('dispose');
        }
    }
    class FakeCarousel {
        static getOrCreateInstance(): FakeCarousel {
            return new FakeCarousel();
        }
        prev(): void {
            carouselKeys.push('prev');
        }
        next(): void {
            carouselKeys.push('next');
        }
    }
    return { Modal: FakeModal, Carousel: FakeCarousel };
});

let bodyInits = 0;

@Component({ selector: 'test-body', standalone: true, template: 'corpo' })
class TestBodyComponent implements OnInit {

    ngOnInit(): void {
        bodyInits++;
    }

}

@Component({
    standalone: true,
    imports: [NgBsModalServiceComponent, TestBodyComponent],
    template: `
        @if (visible()) {
            <ng-bs-modal-service></ng-bs-modal-service>
        }
        <ng-template #body><test-body /></ng-template>
        <ng-template #footer><button class="footer-btn">ok</button></ng-template>
        <ng-template #full><div class="full-content">tudo</div></ng-template>
    `
})
class HostComponent {

    readonly visible = signal(true);
    readonly body = viewChild.required<TemplateRef<unknown>>('body');
    readonly footer = viewChild.required<TemplateRef<unknown>>('footer');
    readonly full = viewChild.required<TemplateRef<unknown>>('full');

}

describe('NgBsModalServiceComponent', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let service: NgBsModalService;

    const el = (): HTMLElement => fixture.nativeElement;
    const modal = (): HTMLElement | null => el().querySelector('.modal');
    const bodyText = (): string => el().querySelector('.modal-body')?.textContent?.trim() ?? '';
    const render = (): Promise<void> => fixture.whenStable();

    beforeEach(async () => {
        modalEvents.length = 0;
        carouselKeys.length = 0;
        bodyInits = 0;

        await TestBed.configureTestingModule({
            imports: [HostComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        service = TestBed.inject(NgBsModalService);
        await render();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('renders nothing until a modal is opened', () => {
        expect(modal()).toBeNull();
    });

    describe('opening via service', () => {
        it('renders header and string body, and shows the modal', async () => {
            service.open({ header: 'Título', body: 'corpo do <b>modal</b>' });
            await render();

            expect(modal()).toBeTruthy();
            expect(el().querySelector('.modal-title')?.textContent).toBe('Título');
            expect(el().querySelector('.modal-body b')?.textContent).toBe('modal');
            expect(el().querySelector('.btn-close')).toBeTruthy();
            expect(modalEvents).toEqual(['show']);
        });

        it('renders a TemplateRef as the whole content', async () => {
            service.open(host.full());
            await render();

            expect(el().querySelector('.modal-content .full-content')?.textContent).toBe('tudo');
            expect(el().querySelector('.modal-header')).toBeNull();
        });

        it('renders TemplateRef header/body/footer', async () => {
            service.open({ header: host.full(), body: host.body(), footer: host.footer() });
            await render();

            expect(el().querySelector('.modal-header .full-content')).toBeTruthy();
            expect(bodyText()).toBe('corpo');
            expect(el().querySelector('.modal-footer .footer-btn')).toBeTruthy();
        });

        it('applies size, custom classes, scroll and static backdrop options', async () => {
            service.open({ header: 'h', body: 'x', footer: host.footer() }, {
                size: 'lg',
                staticBackdrop: true,
                customClass: { modal: 'my-modal', modalHeader: 'my-header', modalBody: 'my-body', modalFooter: 'my-footer' },
            });
            await render();

            const dialog = el().querySelector('.modal-dialog')!;
            expect(dialog.classList).toContain('modal-lg');
            expect(dialog.classList).toContain('modal-dialog-scrollable');
            expect(modal()!.classList).toContain('my-modal');
            expect(modal()!.classList).toContain('modal');
            expect(el().querySelector('.modal-header')!.classList).toContain('my-header');
            expect(el().querySelector('.modal-body')!.classList).toContain('my-body');
            expect(el().querySelector('.modal-footer')!.classList).toContain('my-footer');
            expect(modal()!.getAttribute('data-bs-backdrop')).toBe('static');
            expect(modal()!.getAttribute('data-bs-keyboard')).toBe('false');
        });

        it('drops the scrollable class with disabledBodyScroll and keeps keyboard close by default', async () => {
            service.open({ body: 'x' }, { disabledBodyScroll: true });
            await render();

            expect(el().querySelector('.modal-dialog')!.classList).not.toContain('modal-dialog-scrollable');
            expect(modal()!.getAttribute('data-bs-backdrop')).toBeNull();
            expect(modal()!.getAttribute('data-bs-keyboard')).toBe('true');
        });

        it('hides the close button with withoutClose', async () => {
            service.open({ header: 'x', body: 'y' }, { withoutClose: true });
            await render();
            expect(el().querySelector('.btn-close')).toBeNull();
        });
    });

    describe('carousel', () => {
        const images = [{ url: 'a.png', name: 'a' }, { url: 'b.png', name: 'b' }];

        it('renders the images with the configured index active', async () => {
            service.open({ body: '' }, { carousel: { index: 1, images } });
            await render();

            const items = Array.from(el().querySelectorAll('.carousel-item'));
            expect(items.length).toBe(2);
            expect(items.map(i => i.classList.contains('active'))).toEqual([false, true]);
            const indicators = Array.from(el().querySelectorAll('.carousel-indicators button'));
            expect(indicators.map(i => i.classList.contains('active'))).toEqual([false, true]);
            expect(el().querySelector('.carousel-control-next')).toBeTruthy();
        });

        it('hides prev/next with a single image', async () => {
            service.open({ body: '' }, { carousel: { index: 0, images: [images[0]] } });
            await render();
            expect(el().querySelector('.carousel-control-prev')).toBeNull();
        });

        it('navigates with the arrow keys while open', async () => {
            service.open({ body: '' }, { carousel: { index: 0, images } });
            await render();

            modal()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
            modal()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

            expect(carouselKeys).toEqual(['next', 'prev']);
        });

        it('clears the active slide and the key handler on close', async () => {
            service.open({ body: '' }, { carousel: { index: 1, images } });
            await render();
            const element = modal()!;

            service.close();
            await render();

            element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
            expect(carouselKeys).toEqual([]);
            expect(element.querySelectorAll('.carousel-item.active').length).toBe(0);
        });
    });

    describe('closing and queue', () => {
        it('close completes the open() Observable', async () => {
            let closed = false;
            service.open({ body: 'x' }).subscribe({ complete: () => closed = true });
            await render();

            service.close();
            await render();

            expect(closed).toBe(true);
        });

        it('opening over an open modal stacks it, and closing returns to the previous one', async () => {
            let firstClosed = false;
            let secondClosed = false;
            service.open({ header: 'x', body: host.body() }).subscribe({ complete: () => firstClosed = true });
            await render();
            service.open({ body: 'segundo' }).subscribe({ complete: () => secondClosed = true });
            await render();
            expect(bodyText()).toBe('segundo');

            service.close();
            await render();

            expect(secondClosed).toBe(true);
            expect(firstClosed).toBe(false);
            expect(bodyText()).toBe('corpo');
            // Only one modal is rendered at a time, so the previous body view is recreated when it comes back.
            expect(bodyInits).toBe(2);
        });

        it('closeAll closes every stacked modal', async () => {
            const closed: string[] = [];
            service.open({ body: 'a' }).subscribe({ complete: () => closed.push('a') });
            await render();
            service.open({ body: 'b' }).subscribe({ complete: () => closed.push('b') });
            await render();

            service.closeAll();
            await render();

            expect(closed.sort()).toEqual(['a', 'b']);
        });

        it('recreates the body view on each open, even with the same TemplateRef', async () => {
            service.open({ header: 'x', body: host.body() });
            await render();
            service.close();
            await render();

            service.open({ header: 'x', body: host.body() });
            await render();

            expect(bodyInits).toBe(2);
        });
    });

    describe('popover positioning (popoverTo)', () => {
        const originalWidth = window.innerWidth;
        let backdrop: HTMLElement;

        async function openPopover(viewportWidth: number, anchor: { left: number, width: number }, modalWidth = 500): Promise<HTMLElement> {
            Object.defineProperty(window, 'innerWidth', { configurable: true, value: viewportWidth });
            vi.spyOn(window, 'getComputedStyle').mockReturnValue({ getPropertyValue: () => `${modalWidth}px` } as unknown as CSSStyleDeclaration);

            const popoverTo = document.createElement('button');
            Object.defineProperty(popoverTo, 'offsetHeight', { value: 40 });
            popoverTo.getBoundingClientRect = () => ({
                left: anchor.left, right: anchor.left + anchor.width, width: anchor.width,
                top: 700, bottom: 740, height: 40, x: anchor.left, y: 700, toJSON: () => ({}),
            });

            service.open({ body: 'x' }, { popoverTo });
            await render();
            // The backdrop is read on the next tick, after bootstrap creates it.
            const dialog = el().querySelector<HTMLElement>('.modal-dialog')!;
            await vi.waitFor(() => expect(dialog.style.position).toBe('fixed'));
            return dialog;
        }

        beforeEach(() => {
            backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';
            document.body.appendChild(backdrop);
        });

        afterEach(() => {
            backdrop.remove();
            Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
            vi.restoreAllMocks();
        });

        it('keeps the popover inside a narrow viewport (mobile) instead of a negative left', async () => {
            // Button in the bottom-right corner of a 390px phone; --bs-modal-width 500px does not fit.
            const dialog = await openPopover(390, { left: 320, width: 46 });

            expect(dialog.style.width).toBe('374px');
            expect(dialog.style.left).toBe('8px');
            expect(dialog.style.getPropertyValue('--arrow-left')).toBe(`${320 + 23 - 8 - 5}px`);
            expect(dialog.classList).not.toContain('modal-dialog-centered');
            expect(backdrop.style.getPropertyValue('--bs-backdrop-opacity')).toBe('0');
        });

        it('aligns to the anchor left edge when it fits to the right', async () => {
            const dialog = await openPopover(1440, { left: 100, width: 46 });

            expect(dialog.style.width).toBe('500px');
            expect(dialog.style.left).toBe('100px');
            expect(dialog.style.margin).toBe('0px');
            expect(dialog.style.getPropertyValue('--arrow-left')).toBe('18px');
        });

        it('aligns to the anchor right edge when it does not fit to the right', async () => {
            const dialog = await openPopover(1440, { left: 1300, width: 46 });

            expect(dialog.style.left).toBe(`${1346 - 500}px`);
            expect(dialog.style.getPropertyValue('--arrow-left')).toBe(`${1323 - 846 - 5}px`);
        });

        it('opens above the anchor when there is no room below', async () => {
            const dialog = await openPopover(1440, { left: 100, width: 46 });
            // jsdom innerHeight is 768; anchor bottom 740 leaves 28px below.
            expect(dialog.classList).toContain('modal-arrow-bottom');
            expect(modal()!.classList).toContain('fade-down');
        });
    });

    it('stops reacting to service and bootstrap events after destroy', async () => {
        let closed = false;
        service.open({ body: 'x' }).subscribe({ complete: () => closed = true });
        await render();

        host.visible.set(false);
        await render();
        expect(modalEvents).toContain('dispose');

        expect(() => document.dispatchEvent(new Event('hidden.bs.modal'))).not.toThrow();
        service.open({ body: 'y' });
        expect(closed).toBe(false);
        expect(modalEvents.filter(e => e === 'show').length).toBe(1);
    });
});
