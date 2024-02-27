import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgBsModalService } from 'ng-bs-modal-service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(private modalService: NgBsModalService) {}
    
    ngOnInit() { }

    showModal(modalBody: TemplateRef<any>) {
        this.modalService.open({
            body: modalBody,
            header: 'Modal',
        }, { 
            size: 'lg',
            customClass: { modalHeader: 'bg-danger text-white' }
        })
    }

    log($event: any) {
        console.log($event);
    }

}
