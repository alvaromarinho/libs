import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { NgBsModalService } from './ng-bs-modal-service.service';
import { NgBsModalServiceData } from './ng-bs-modal-service.model';
import { Carousel, Modal } from 'bootstrap';

@Component({
    selector: 'ng-bs-modal-service',
    templateUrl: './ng-bs-modal-service.component.html',
    styleUrls: [`./ng-bs-modal-service.component.css`]
})
export class NgBsModalServiceComponent implements OnInit {

    modal: Modal | undefined;
    modalData: any;
    modalQueue: any[] = [];
    keepInQueue?: boolean;
    action: 'open' | 'close' | 'closeAll' = 'close';
    html = {} as {
        modal: HTMLElement | null;
        dialog: HTMLElement | null;
        content: HTMLElement | null;
        backdrop: HTMLElement | null;
    };

    carouselId = Math.floor(Math.random() * 10000);
    currentImgIndex?: number;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private modalService: NgBsModalService
    ) { }

    ngOnInit() {
        document.addEventListener('shown.bs.modal', () => this.setCarouselEvents());
        document.addEventListener('hidden.bs.modal', () => {
            this.closeModal();
            this.cleanCarouselIndicator();
        });

        this.modalService.get().subscribe((modalData: NgBsModalServiceData) => {
            this.action = modalData.action;
            this.action === 'open' ? this.handleModalQueue(modalData) : this.modal?.hide();
        })
    }

    isModalContent(variable: any) {
        return variable instanceof TemplateRef;
    }

    isString(variable: any) {
        return typeof variable === 'string';
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
            this.modal?.hide();
            this.modalQueue.map((modal) => modal.open = false);
            setTimeout(() => this.showModal(modal), 350); // wait modal close animation
        } else {
            this.showModal(modal);
        }
    }

    private showModal(modal: NgBsModalServiceData) {
        this.modalQueue.push(modal);
        this.setModalData(modal);
        this.modal!.show();
    }

    private setModalData(modal: NgBsModalServiceData) {
        this.modalData = modal;
        this.changeDetectorRef.detectChanges();
        this.modal = this.modal || new Modal('#modal');

        this.html.modal = (this.modal as any)._element;
        this.html.dialog = (this.modal as any)._dialog;
        this.html.content = this.html.dialog?.children[0] as HTMLElement;
        setTimeout(() => {
            this.html.backdrop = (this.modal as any)._backdrop._element
            this.modalData.options.popoverTo ? this.createPopoverStyle() : this.removePopoverStyle();
        }, 1); // backdrop bug fix

        if (this.modalData.options.carousel) {
            this.currentImgIndex = this.modalData.options.carousel.index;
        }
    }

    private createPopoverStyle() {
        const popoverTo = this.modalData.options.popoverTo;
        const position = popoverTo.getBoundingClientRect();
        const spaceToRight = (window.innerWidth - position.right + popoverTo.offsetWidth);
        const spaceToTop = position.top;
        const spaceToBottom = window.innerHeight - position.bottom;

        const modalWidth = +window.getComputedStyle(this.html.dialog!).getPropertyValue('--bs-modal-width').slice(0, -2);
        const modalMinHeight = window.innerHeight / 2;

        this.html.content!.classList.add('shadow');
        this.html.dialog!.classList.remove('modal-dialog-centered');
        this.html.dialog!.classList.add('mt-0');
        this.html.dialog!.style.position = 'fixed';
        this.html.dialog!.style.width = '100%';
        this.html.dialog!.style.height = 'auto';
        this.html.dialog!.style.display = 'flex';
        this.html.backdrop!.style.setProperty('--bs-backdrop-opacity', '0');

        // align modal to the right if there is enough space
        if (spaceToRight > modalWidth) {
            this.html.dialog!.style.left = position.left + 'px';
            this.html.dialog!.style.setProperty('--arrow-left', `${popoverTo.offsetWidth / 2 - 5}px`)
        } else {
            this.html.dialog!.style.left = position.right - modalWidth + 'px';
            this.html.dialog!.style.setProperty('--arrow-left', `${modalWidth - popoverTo.offsetWidth / 2 - 5}px`)
        }

        // align modal to the top if there is enough space
        if (spaceToBottom < modalMinHeight) {
            this.html.modal!.classList.add('fade-down');
            this.html.dialog!.classList.add('modal-arrow-bottom');
            this.html.dialog!.style.top = '15px';
            this.html.dialog!.style.bottom = spaceToBottom + popoverTo.offsetHeight + 'px';
            this.html.dialog!.style.paddingBottom = '15px';
            this.html.dialog!.style.alignItems = 'end';
        } else {
            this.html.dialog!.classList.add('modal-arrow-top');
            this.html.dialog!.style.top = spaceToTop + popoverTo.offsetHeight + 'px';
            this.html.dialog!.style.bottom = '15px';
            this.html.dialog!.style.paddingTop = '15px';
            this.html.dialog!.style.alignItems = 'start';
        }
    }

    private removePopoverStyle() {
        this.html.modal!.classList.remove('fade-down');
        this.html.dialog!.removeAttribute('style');
        this.html.dialog!.classList.remove('modal-arrow-top', 'modal-arrow-bottom', 'mt-0');
        this.html.dialog!.classList.add('modal-dialog-centered');
        this.html.content!.removeAttribute('style');
        this.html.content!.classList.remove('shadow');
        this.html.backdrop!.style.setProperty('--bs-backdrop-opacity', '0.5');
    }

    private setCarouselEvents() {
        this.html.modal!.addEventListener('keydown', (e) => {
            const carousel = new Carousel(`#carousel-${this.carouselId}`);
            if (carousel && e.keyCode == 37) carousel.prev();
            if (carousel && e.keyCode == 39) carousel.next();
        });
    }

    private cleanCarouselIndicator() {
        const indicatorActive = document.querySelector(`#carousel-${this.carouselId} .carousel-indicators .active`);
        const itemActive = document.querySelector(`#carousel-${this.carouselId} .carousel-inner .active`);

        indicatorActive && indicatorActive.classList.remove('active');
        itemActive && itemActive.classList.remove('active');
        this.currentImgIndex = undefined as any;
    }
}
