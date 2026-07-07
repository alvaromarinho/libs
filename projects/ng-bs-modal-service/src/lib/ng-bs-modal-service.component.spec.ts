import { TemplateRef } from '@angular/core';
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

  it('ngOnDestroy removes document listeners so events no longer reach the component', () => {
    service.open({ body: 'x' });
    fixture.destroy();

    // dispatch depois de destruído não deve alterar estado nem lançar erro
    expect(() => document.dispatchEvent(new Event('hidden.bs.modal'))).not.toThrow();
    expect(component.modalQueue.length).toBe(1);
  });
});
