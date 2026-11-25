import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, TemplateRef, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Carousel, Modal } from 'bootstrap';
import { NgBsModalService } from './ng-bs-modal-service.service';
import { NgBsModalServiceContent, NgBsModalServiceData } from './ng-bs-modal-service.model';

@Component({
    selector: 'ng-bs-modal-service',
    standalone: true,
    imports: [NgTemplateOutlet],
    templateUrl: './ng-bs-modal-service.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: [`./ng-bs-modal-service.component.css`]
})
export class NgBsModalServiceComponent implements OnInit {

    protected readonly modalData = signal<NgBsModalServiceData | null>(null);
    protected readonly currentImgIndex = signal<number | undefined>(undefined);
    protected readonly modalId = `modal-${Math.floor(Math.random() * 100000)}`;
    protected readonly carouselId = Math.floor(Math.random() * 10000);

    private modal: Modal | undefined;
    private modalQueue: NgBsModalServiceData[] = [];
    private keepInQueue?: boolean;
    private action: 'open' | 'close' | 'closeAll' = 'close';
    private html = {} as {
        modal: HTMLElement | null;
        dialog: HTMLElement | null;
        content: HTMLElement | null;
        backdrop: HTMLElement | null;
    };
    private carouselKeyHandler?: (e: KeyboardEvent) => void;

    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly modalService = inject(NgBsModalService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        const shownHandler = (): void => {
            if (document.getElementById(`carousel-${this.carouselId}`)) {
                this.setCarouselEvents();
            }
        };
        const hiddenHandler = (): void => {
            this.closeModal();
            this.cleanCarouselIndicator();
            this.cleanCarouselEvents();
        };

        document.addEventListener('shown.bs.modal', shownHandler);
        document.addEventListener('hidden.bs.modal', hiddenHandler);

        this.destroyRef.onDestroy(() => {
            document.removeEventListener('shown.bs.modal', shownHandler);
            document.removeEventListener('hidden.bs.modal', hiddenHandler);
            this.cleanCarouselEvents();
            this.modal?.dispose();
        });

        this.modalService.get().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(modalData => {
            this.action = modalData.action;
            if (this.action === 'open') {
                this.handleModalQueue(modalData);
            } else {
                this.modal?.hide();
            }
        });
    }

    protected openKey(data: NgBsModalServiceData): NgBsModalServiceData {
        return data;
    }

    protected isTemplate(variable: unknown): variable is TemplateRef<unknown> {
        return variable instanceof TemplateRef;
    }

    protected isString(variable: unknown): variable is string {
        return typeof variable === 'string';
    }

    protected asContent(content: NgBsModalServiceData['content']): NgBsModalServiceContent {
        return content as NgBsModalServiceContent;
    }

    private closeModal() {
        if (this.action === 'closeAll') {
            this.modalQueue.forEach((m) => this.notifyClosed(m));
            this.modalQueue = [];
        } else if (!this.keepInQueue) {
            const [removed] = this.modalQueue.splice(this.modalQueue.length - 1, 1);
            this.notifyClosed(removed);
        }

        this.keepInQueue = false;
        if (this.modalQueue.length > 0) {
            const lastModal = this.modalQueue[this.modalQueue.length - 1];
            this.setModalData(lastModal);
            this.modal?.show();
        }
    }

    private notifyClosed(modal?: NgBsModalServiceData) {
        modal?.closed?.next();
        modal?.closed?.complete();
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
        this.modalData.set(modal);
        if (modal.options?.carousel) {
            this.currentImgIndex.set(modal.options.carousel.index);
        }
        // Bootstrap needs the modal element in the DOM right now, not on the next render.
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

        if (modal.options?.popoverTo) {
            // Aguardar o próximo tick para garantir que o backdrop seja criado
            setTimeout(() => {
                this.html.backdrop = document.querySelector('.modal-backdrop');
                this.createPopoverStyle();
            }, 0);
        } else {
            this.removePopoverStyle();
        }
    }

    private createPopoverStyle() {
        const popoverTo = this.modalData()?.options?.popoverTo;
        if (!popoverTo || !this.html.dialog || !this.html.content || !this.html.modal || !this.html.backdrop) {
            return;
        }

        const position = popoverTo.getBoundingClientRect();
        const spaceToTop = position.top;
        const spaceToBottom = window.innerHeight - position.bottom;

        const modalWidth = +window.getComputedStyle(this.html.dialog).getPropertyValue('--bs-modal-width').slice(0, -2);
        const modalMinHeight = window.innerHeight / 2;

        this.html.content.classList.add('shadow');
        this.html.dialog.classList.remove('modal-dialog-centered');
        this.html.dialog.classList.add('mt-0');
        // --bs-modal-width (500px no mobile, 800px no lg) pode passar da viewport: limita a largura e
        // prende o popover dentro da tela, senão ele sai pela esquerda (left negativo) em tela estreita.
        const gutter = 8;
        const width = Math.min(modalWidth, window.innerWidth - gutter * 2);
        const preferredLeft = position.left + width <= window.innerWidth - gutter ? position.left : position.right - width;
        const left = Math.min(Math.max(preferredLeft, gutter), window.innerWidth - width - gutter);
        const anchorCenter = position.left + position.width / 2;

        this.html.dialog.style.position = 'fixed';
        this.html.dialog.style.width = `${width}px`;
        this.html.dialog.style.maxWidth = `${width}px`;
        this.html.dialog.style.height = 'auto';
        this.html.dialog.style.display = 'flex';
        this.html.dialog.style.left = `${left}px`;
        // O .modal-dialog tem margem (--bs-modal-margin) no mobile, que somaria ao left e colaria o lado direito na borda.
        this.html.dialog.style.margin = '0';
        this.html.dialog.style.setProperty('--arrow-left', `${anchorCenter - left - 5}px`);
        this.html.backdrop.style.setProperty('--bs-backdrop-opacity', '0');

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
        this.currentImgIndex.set(undefined);
    }

}