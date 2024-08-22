import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgBsModalService } from './ng-bs-modal-service.service';
import { NgBsModalServiceData } from './ng-bs-modal-service.model';
import { Modal } from 'bootstrap';

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

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private modalService: NgBsModalService
    ) { }

    ngOnInit() {
        document.addEventListener('hidden.bs.modal', () => this.closeModal());
        this.modalService.get().subscribe((modalData: NgBsModalServiceData) => {
            this.action = modalData.action;
            this.action === 'open' ? this.handleModalQueue(modalData) : this.modal?.hide();
        })
    }

    isModalContent(variable: any) {
        return !!variable.body;
    }

    isString(variable: any) {
        return typeof variable === 'string';
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

    private closeModal() {
        if (this.action == 'closeAll') {
            this.modalQueue = [];
        } else if (!this.keepInQueue) {
            this.modalQueue.splice(this.modalQueue.length - 1, 1);
        }

        this.keepInQueue = false;

        if (this.modalQueue.length > 0) {
            const lastModal = this.modalQueue[this.modalQueue.length - 1];
            this.setModalData(lastModal);
            this.modal?.show();
        }
    }

    private setModalData(modal: NgBsModalServiceData) {
        this.modalData = modal;
        this.changeDetectorRef.detectChanges();
        this.modalData.options.popoverTo ? this.createPopoverStyle() : this.removePopoverStyle();
        this.modal = this.modal || new Modal('#modal');
    }

    private createPopoverStyle() {
        const popoverTo = this.modalData.options.popoverTo;
        const position = popoverTo.getBoundingClientRect();
        const modalEl = document.getElementById('modal');
        const modalDialogEl = document.getElementById('modal-dialog');
        const modalContentEl = document.getElementById('modal-content');

        setTimeout(() => {
            const modalBackDropEl = document.querySelector('.modal-backdrop') as HTMLElement;
            modalBackDropEl!.style.setProperty('--bs-backdrop-opacity', '0');
        }, 1);

        const modalWidth = +window.getComputedStyle(modalDialogEl!).getPropertyValue('--bs-modal-width').slice(0, -2);
        const spaceToRight = (window.innerWidth - position.right + popoverTo.offsetWidth);
        const spaceToTop = position.top;
        const spaceToBottom = window.innerHeight - position.bottom;
        const modalHeight = window.innerHeight / 2.5;

        modalContentEl!.classList.add('shadow');
        modalDialogEl!.classList.remove('modal-dialog-centered');
        modalDialogEl!.style.position = 'fixed';
        modalDialogEl!.style.maxHeight = modalHeight + 'px';
        modalDialogEl!.style.width = '100%';

        // align modal to the right if there is enough space
        if (spaceToRight > modalWidth) {
            modalDialogEl!.style.left = position.left + 'px';
            modalDialogEl!.style.setProperty('--arrow-left', `${popoverTo.offsetWidth / 2 - 5}px`)
        } else {
            modalDialogEl!.style.left = position.right - modalWidth + 'px';
            modalDialogEl!.style.setProperty('--arrow-left', `${modalWidth - popoverTo.offsetWidth / 2 - 5}px`)
        }

        // align modal to the top if there is enough space
        if (spaceToBottom < modalHeight) {
            modalEl!.classList.add('fade-down');
            modalDialogEl!.classList.add('modal-arrow-bottom');
            modalDialogEl!.style.top = spaceToTop - modalHeight + 'px';
            modalDialogEl!.style.paddingBottom = '15px';
        } else {
            modalDialogEl!.classList.add('modal-arrow-top');
            modalDialogEl!.style.top = position.top + popoverTo.offsetHeight + 'px';
            modalDialogEl!.style.paddingTop = '15px';
        }
    }

    private removePopoverStyle() {
        const modalEl = document.getElementById('modal');
        modalEl!.classList.remove('fade-down');

        const modalDialogEl = document.getElementById('modal-dialog');
        modalDialogEl!.removeAttribute('style');
        modalDialogEl!.classList.remove('modal-arrow-top', 'modal-arrow-bottom');
        modalDialogEl!.classList.add('modal-dialog-centered');

        const modalContentEl = document.getElementById('modal-content');
        modalContentEl!.removeAttribute('style');
        modalContentEl!.classList.remove('shadow');

        setTimeout(() => {
            const modalBackDropEl = document.querySelector('.modal-backdrop') as HTMLElement;
            modalBackDropEl!.style.setProperty('--bs-backdrop-opacity', '0.5');
        }, 1);
    }

}
