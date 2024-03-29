import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgBsModalService } from './ng-bs-modal-service.service';
import { NgBsModalServiceData } from './ng-bs-modal-service.model';
import { Modal } from 'bootstrap';

@Component({
    selector: 'ng-bs-modal-service',
    templateUrl: './ng-bs-modal-service.component.html'
})
export class NgBsModalServiceComponent implements OnInit {

    modal: Modal | undefined;
    modalData: any;
    modalQueue: any[] = [];
    currentModalIndex?: number;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private modalService: NgBsModalService
    ) { }

    ngOnInit() {
        this.modalService.get().subscribe((modalData: NgBsModalServiceData) => {
            document.addEventListener('hidden.bs.modal', () => this.modal && this.closeModal());
            if (modalData.open) {
                this.modalQueue.push(modalData);
                !this.modal && this.showModal(modalData)
            } else {
                this.modal?.hide();
            }
        })
    }

    isModalContent(variable: any) {
        return !!variable.body;
    }

    isString(variable: any) {
        return typeof variable === 'string';
    }

    private showModal(modal: NgBsModalServiceData) {
        this.modalData = modal;
        this.changeDetectorRef.detectChanges();
        this.modal = this.modal || new Modal('#modal');
        this.modal.show();
        this.currentModalIndex = this.modalQueue.findIndex((modal) => modal == this.modalData)
    }

    private closeModal() {
        this.modal = undefined;
        this.modalQueue.splice(this.currentModalIndex!, 1);
        this.modalQueue.length && this.showModal(this.modalQueue[0]);
    }

}
