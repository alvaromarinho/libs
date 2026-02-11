import { ChangeDetectorRef, Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { NgBsModalService } from './ng-bs-modal-service.service';
import { NgBsModalServiceData } from './ng-bs-modal-service.model';
import { Carousel, Modal } from 'bootstrap';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
    selector: 'ng-bs-modal-service',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ng-bs-modal-service.component.html',
    styleUrls: [`./ng-bs-modal-service.component.css`]
})
export class NgBsModalServiceComponent implements OnInit, OnDestroy {

    modal: Modal | undefined;
    modalData: NgBsModalServiceData | null = null;
    modalQueue: NgBsModalServiceData[] = [];
    keepInQueue?: boolean;
    action: 'open' | 'close' | 'closeAll' = 'close';
    html = {} as {
        modal: HTMLElement | null;
        dialog: HTMLElement | null;
        content: HTMLElement | null;
        backdrop: HTMLElement | null;
    };

    modalId = `modal-${Math.floor(Math.random() * 100000)}`;
    carouselId = Math.floor(Math.random() * 10000);
    currentImgIndex?: number;

    private subscriptions = new Subscription();
    private boundShownHandler?: () => void;
    private boundHiddenHandler?: () => void;
    private carouselKeyHandler?: (e: KeyboardEvent) => void;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private modalService: NgBsModalService
    ) { }

    ngOnInit() {
        this.boundShownHandler = () => {
            if (!!document.getElementById(`carousel-${this.carouselId}`)) {
                this.setCarouselEvents();
            }
        };

        this.boundHiddenHandler = () => {
            this.closeModal();
            this.cleanCarouselIndicator();
            this.cleanCarouselEvents();
        };

        document.addEventListener('shown.bs.modal', this.boundShownHandler);
        document.addEventListener('hidden.bs.modal', this.boundHiddenHandler);

        this.subscriptions.add(
            this.modalService.get().subscribe((modalData: NgBsModalServiceData) => {
                this.action = modalData.action;
                this.action === 'open' ? this.handleModalQueue(modalData) : this.modal?.hide();
            })
        );
    }

    ngOnDestroy() {
        if (this.boundShownHandler) {
            document.removeEventListener('shown.bs.modal', this.boundShownHandler);
        }
        if (this.boundHiddenHandler) {
            document.removeEventListener('hidden.bs.modal', this.boundHiddenHandler);
        }
        this.cleanCarouselEvents();
        this.subscriptions.unsubscribe();
        this.modal?.dispose();
    }

    isModalContent(variable: any): boolean {
        return variable instanceof TemplateRef;
    }

    isString(variable: any): boolean {
        return typeof variable === 'string';
    }

    get modalClass(): string {
        return this.modalData?.options?.customClass?.modal || '';
    }

    get modalHeaderClass(): string {
        return this.modalData?.options?.customClass?.modalHeader || '';
    }

    get modalBodyClass(): string {
        return this.modalData?.options?.customClass?.modalBody || '';
    }

    get modalFooterClass(): string {
        return this.modalData?.options?.customClass?.modalFooter || '';
    }

    get showCloseButton(): boolean {
        return !this.modalData?.options?.withoutClose;
    }

    private closeModal() {
        this.action === 'closeAll'
            ? this.modalQueue = []
            : !this.keepInQueue && this.modalQueue.splice(this.modalQueue.length - 1, 1);

        this.keepInQueue = false;
        if (this.modalQueue.length > 0) {
            const lastModal = this.modalQueue[this.modalQueue.length - 1];
            this.setModalData(lastModal);
            this.modal?.show();
        }
    }

    private handleModalQueue(modal: NgBsModalServiceData) {
        if (this.modalQueue.length > 0) {
            this.keepInQueue = true;
            const lastModal = this.modalQueue[this.modalQueue.length - 1];
            this.setModalData(lastModal);
            this.modalQueue.forEach((m) => m.open = false);

            // Aguarda o evento de modal completamente escondido
            const modalElement = document.getElementById(this.modalId);
            if (modalElement) {
                modalElement.addEventListener('hidden.bs.modal', () => {
                    this.showModal(modal);
                }, { once: true });
            }

            this.modal?.hide();
        } else {
            this.showModal(modal);
        }
    }

    private showModal(modal: NgBsModalServiceData) {
        this.modalQueue.push(modal);
        this.setModalData(modal);
        this.modal?.show();
    }

    private setModalData(modal: NgBsModalServiceData) {
        this.modalData = modal;
        this.changeDetectorRef.detectChanges();

        const modalElement = document.getElementById(this.modalId);
        if (!modalElement) {
            console.error(`Modal element with id "${this.modalId}" not found`);
            return;
        }

        try {
            this.modal = this.modal || Modal.getOrCreateInstance(modalElement);
        } catch (error) {
            console.error('Failed to initialize Bootstrap modal:', error);
            return;
        }

        this.html.modal = modalElement;
        this.html.dialog = modalElement.querySelector('.modal-dialog');
        this.html.content = modalElement.querySelector('.modal-content');

        if (this.modalData?.options?.popoverTo) {
            // Aguardar o próximo tick para garantir que o backdrop seja criado
            setTimeout(() => {
                this.html.backdrop = document.querySelector('.modal-backdrop');
                this.createPopoverStyle();
            }, 0);
        } else {
            this.removePopoverStyle();
        }

        if (this.modalData?.options?.carousel) {
            this.currentImgIndex = this.modalData.options.carousel.index;
        }
    }

    private createPopoverStyle() {
        const popoverTo = this.modalData?.options?.popoverTo;
        if (!popoverTo || !this.html.dialog || !this.html.content || !this.html.modal || !this.html.backdrop) {
            return;
        }

        const position = popoverTo.getBoundingClientRect();
        const spaceToRight = (window.innerWidth - position.right + popoverTo.offsetWidth);
        const spaceToTop = position.top;
        const spaceToBottom = window.innerHeight - position.bottom;

        const modalWidth = +window.getComputedStyle(this.html.dialog).getPropertyValue('--bs-modal-width').slice(0, -2);
        const modalMinHeight = window.innerHeight / 2;

        this.html.content.classList.add('shadow');
        this.html.dialog.classList.remove('modal-dialog-centered');
        this.html.dialog.classList.add('mt-0');
        this.html.dialog.style.position = 'fixed';
        this.html.dialog.style.width = '100%';
        this.html.dialog.style.height = 'auto';
        this.html.dialog.style.display = 'flex';
        this.html.backdrop.style.setProperty('--bs-backdrop-opacity', '0');

        // align modal to the right if there is enough space
        if (spaceToRight > modalWidth) {
            this.html.dialog.style.left = position.left + 'px';
            this.html.dialog.style.setProperty('--arrow-left', `${popoverTo.offsetWidth / 2 - 5}px`)
        } else {
            this.html.dialog.style.left = position.right - modalWidth + 'px';
            this.html.dialog.style.setProperty('--arrow-left', `${modalWidth - popoverTo.offsetWidth / 2 - 5}px`)
        }

        // align modal to the top if there is enough space
        if (spaceToBottom < modalMinHeight) {
            this.html.modal.classList.add('fade-down');
            this.html.dialog.classList.add('modal-arrow-bottom');
            this.html.dialog.style.top = '15px';
            this.html.dialog.style.bottom = spaceToBottom + popoverTo.offsetHeight + 'px';
            this.html.dialog.style.paddingBottom = '15px';
            this.html.dialog.style.alignItems = 'end';
        } else {
            this.html.dialog.classList.add('modal-arrow-top');
            this.html.dialog.style.top = spaceToTop + popoverTo.offsetHeight + 'px';
            this.html.dialog.style.bottom = '15px';
            this.html.dialog.style.paddingTop = '15px';
            this.html.dialog.style.alignItems = 'start';
        }
    }

    private removePopoverStyle() {
        if (!this.html.modal || !this.html.dialog || !this.html.content || !this.html.backdrop) {
            return;
        }

        this.html.modal.classList.remove('fade-down');
        this.html.dialog.removeAttribute('style');
        this.html.dialog.classList.remove('modal-arrow-top', 'modal-arrow-bottom', 'mt-0');
        this.html.dialog.classList.add('modal-dialog-centered');
        this.html.content.removeAttribute('style');
        this.html.content.classList.remove('shadow');
        this.html.backdrop.style.setProperty('--bs-backdrop-opacity', '0.5');
    }

    private setCarouselEvents() {
        const carouselElement = document.getElementById(`carousel-${this.carouselId}`);
        if (!carouselElement || !this.html.modal) return;

        const carousel = Carousel.getOrCreateInstance(carouselElement);

        this.carouselKeyHandler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') carousel.prev();
            if (e.key === 'ArrowRight') carousel.next();
        };

        this.html.modal.addEventListener('keydown', this.carouselKeyHandler);
    }

    private cleanCarouselEvents() {
        if (this.carouselKeyHandler && this.html.modal) {
            this.html.modal.removeEventListener('keydown', this.carouselKeyHandler);
            this.carouselKeyHandler = undefined;
        }
    }

    private cleanCarouselIndicator() {
        const indicatorActive = document.querySelector(`#carousel-${this.carouselId} .carousel-indicators .active`);
        const itemActive = document.querySelector(`#carousel-${this.carouselId} .carousel-inner .active`);

        indicatorActive?.classList.remove('active');
        itemActive?.classList.remove('active');
        this.currentImgIndex = undefined;
    }
}