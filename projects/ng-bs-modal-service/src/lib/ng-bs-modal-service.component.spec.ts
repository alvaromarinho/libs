import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { NgBsModalServiceComponent } from './ng-bs-modal-service.component';
import { NgBsModalService } from './ng-bs-modal-service.service';

// Modal/Carousel reais do Bootstrap agendam callbacks de transição que
// estouram depois do teardown do jsdom — aqui interessa a lógica do componente.
vi.mock('bootstrap', () => {
  class FakeModal {
    show() {}
    hide() {}
    dispose() {}
    static getOrCreateInstance() { return new FakeModal(); }
  }
  class FakeCarousel {
    prev() {}
    next() {}
    static getOrCreateInstance() { return new FakeCarousel(); }
  }
  return { Modal: FakeModal, Carousel: FakeCarousel };
});

let bodyInits = 0;

@Component({ selector: 'test-body', template: 'corpo' })
class TestBodyComponent implements OnInit {
  ngOnInit() { bodyInits++; }
}

@Component({ imports: [TestBodyComponent], template: '<ng-template #body><test-body /></ng-template>' })
class TemplateHostComponent {
  @ViewChild('body', { static: true }) body!: TemplateRef<unknown>;
}

describe('NgBsModalServiceComponent', () => {
  let component: NgBsModalServiceComponent;
  let fixture: ComponentFixture<NgBsModalServiceComponent>;
  let service: NgBsModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NgBsModalServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgBsModalServiceComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(NgBsModalService);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders nothing until a modal is opened', () => {
    expect(fixture.nativeElement.querySelector('.modal')).toBeNull();
  });

  describe('opening via service', () => {
    it('sets modalData, pushes to the queue and renders the modal', () => {
      service.open({ header: 'Título', body: 'corpo do modal' });

      expect(component.action).toBe('open');
      expect(component.modalQueue.length).toBe(1);
      expect(component.modalData?.content).toEqual({ header: 'Título', body: 'corpo do modal' });

      fixture.detectChanges();
      const el = fixture.nativeElement;
      expect(el.querySelector('.modal')).toBeTruthy();
      expect(el.querySelector('.modal-title')?.textContent).toBe('Título');
      expect(el.querySelector('.modal-body')?.textContent).toContain('corpo do modal');
    });

    it('applies size and custom classes', () => {
      service.open({ body: 'x' }, { size: 'lg', customClass: { modal: 'my-modal', modalBody: 'my-body' } });
      fixture.detectChanges();

      const el = fixture.nativeElement;
      expect(el.querySelector('.modal-dialog')?.className).toContain('modal-lg');
      expect(el.querySelector('.modal')?.className).toContain('my-modal');
      expect(el.querySelector('.modal-body')?.className).toContain('my-body');
    });

    it('hides the close button with withoutClose', () => {
      service.open({ header: 'x', body: 'y' }, { withoutClose: true });
      fixture.detectChanges();
      expect(component.showCloseButton).toBe(false);
      expect(fixture.nativeElement.querySelector('.btn-close')).toBeNull();
    });

    it('renders the carousel when configured', () => {
      service.open({ body: 'x' }, {
        carousel: { index: 1, images: [{ url: 'a.png', name: 'a' }, { url: 'b.png', name: 'b' }] }
      });
      fixture.detectChanges();

      expect(component.currentImgIndex).toBe(1);
      const items = fixture.nativeElement.querySelectorAll('.carousel-item');
      expect(items.length).toBe(2);
      expect(items[1].className).toContain('active');
    });
  });

  describe('closing', () => {
    it('close action removes the current modal from the queue on hidden.bs.modal', () => {
      service.open({ body: 'x' });
      expect(component.modalQueue.length).toBe(1);

      service.close();
      expect(component.action).toBe('close');
      document.dispatchEvent(new Event('hidden.bs.modal'));

      expect(component.modalQueue.length).toBe(0);
    });

    it('closeAll empties the whole queue on hidden.bs.modal', () => {
      service.open({ body: 'x' });
      component.modalQueue.push({ action: 'open', content: { body: 'y' } }); // simula fila com 2

      service.closeAll();
      document.dispatchEvent(new Event('hidden.bs.modal'));

      expect(component.modalQueue.length).toBe(0);
    });

    it('shows the previous modal of the queue after the top one closes', () => {
      service.open({ body: 'primeiro' });
      component.modalQueue.push({ action: 'open', content: { body: 'segundo' } });

      service.close();
      document.dispatchEvent(new Event('hidden.bs.modal'));

      expect(component.modalQueue.length).toBe(1);
      expect((component.modalData?.content as any).body).toBe('primeiro');
    });
  });

  describe('body from TemplateRef', () => {
    it('recreates the body view on each open, even with the same TemplateRef', () => {
      const host = TestBed.createComponent(TemplateHostComponent);
      host.detectChanges();
      bodyInits = 0;

      service.open({ header: 'x', body: host.componentInstance.body });
      fixture.detectChanges();
      service.close();
      document.dispatchEvent(new Event('hidden.bs.modal'));

      service.open({ header: 'x', body: host.componentInstance.body });
      fixture.detectChanges();

      expect(bodyInits).toBe(2);
      host.destroy();
    });

    it('keeps the body view when the same modal comes back from the queue', () => {
      const host = TestBed.createComponent(TemplateHostComponent);
      host.detectChanges();
      bodyInits = 0;

      service.open({ header: 'x', body: host.componentInstance.body });
      fixture.detectChanges();
      component.modalQueue.push({ action: 'open', content: { body: 'segundo' } });
      service.close();
      document.dispatchEvent(new Event('hidden.bs.modal'));
      fixture.detectChanges();

      expect(bodyInits).toBe(1);
      host.destroy();
    });
  });

  describe('content type helpers', () => {
    it('isString detects strings', () => {
      expect(component.isString('abc')).toBe(true);
      expect(component.isString({})).toBe(false);
    });

    it('isModalContent detects TemplateRef', () => {
      expect(component.isModalContent({} as TemplateRef<any>)).toBe(false);
      expect(component.isModalContent(Object.create(TemplateRef.prototype))).toBe(true);
    });
  });

  describe('custom class getters default to empty string', () => {
    it('returns empty strings without modalData', () => {
      expect(component.modalClass).toBe('');
      expect(component.modalHeaderClass).toBe('');
      expect(component.modalBodyClass).toBe('');
      expect(component.modalFooterClass).toBe('');
      expect(component.showCloseButton).toBe(true);
    });
  });

  describe('popover positioning (popoverTo)', () => {
    const originalWidth = window.innerWidth;

    function setupPopover(viewportWidth: number, anchor: { left: number; width: number; }, modalWidth = 500) {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: viewportWidth });
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({ getPropertyValue: () => `${modalWidth}px` } as unknown as CSSStyleDeclaration);

      const popoverTo = document.createElement('button');
      Object.defineProperty(popoverTo, 'offsetWidth', { value: anchor.width });
      Object.defineProperty(popoverTo, 'offsetHeight', { value: 40 });
      popoverTo.getBoundingClientRect = () => ({
        left: anchor.left, right: anchor.left + anchor.width, width: anchor.width,
        top: 700, bottom: 740, height: 40, x: anchor.left, y: 700, toJSON: () => ({}),
      });

      const dialog = document.createElement('div');
      component.html = {
        modal: document.createElement('div'),
        dialog,
        content: document.createElement('div'),
        backdrop: document.createElement('div'),
      };
      component.modalData = { action: 'open', options: { popoverTo } };
      (component as any).createPopoverStyle();
      return dialog;
    }

    afterEach(() => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
      vi.restoreAllMocks();
    });

    it('keeps the popover inside a narrow viewport (mobile) instead of a negative left', () => {
      // botão no canto inferior direito de um celular de 390px; --bs-modal-width 500px não cabe
      const dialog = setupPopover(390, { left: 320, width: 46 });

      expect(dialog.style.width).toBe('374px');
      expect(dialog.style.left).toBe('8px');
      expect(dialog.style.getPropertyValue('--arrow-left')).toBe(`${320 + 23 - 8 - 5}px`);
    });

    it('aligns to the anchor left edge when it fits to the right', () => {
      const dialog = setupPopover(1440, { left: 100, width: 46 });

      expect(dialog.style.width).toBe('500px');
      expect(dialog.style.left).toBe('100px');
      expect(dialog.style.getPropertyValue('--arrow-left')).toBe('18px');
    });

    it('aligns to the anchor right edge when it does not fit to the right', () => {
      const dialog = setupPopover(1440, { left: 1300, width: 46 });

      expect(dialog.style.left).toBe(`${1346 - 500}px`);
      expect(dialog.style.getPropertyValue('--arrow-left')).toBe(`${1323 - 846 - 5}px`);
    });
  });

  it('ngOnDestroy removes document listeners so events no longer reach the component', () => {
    service.open({ body: 'x' });
    fixture.destroy();

    // dispatch depois de destruído não deve alterar estado nem lançar erro
    expect(() => document.dispatchEvent(new Event('hidden.bs.modal'))).not.toThrow();
    expect(component.modalQueue.length).toBe(1);
  });
});
