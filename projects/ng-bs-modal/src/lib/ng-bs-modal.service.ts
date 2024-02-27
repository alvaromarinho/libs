import { Injectable, TemplateRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NgBsModalContent, NgBsModalData, NgBsModalOptions } from './ng-bs-modal.model';

@Injectable({
    providedIn: 'root'
})
export class NgBsModalService {

    private subject = new Subject<NgBsModalData>()

    get(): Observable<any> {
        return this.subject.asObservable();
    }

    open(content: NgBsModalContent | TemplateRef<any>, options?: NgBsModalOptions) {
        options = options || {}
        this.subject.next({ open: true, content, options });
    }

    close() {
        this.subject.next({ open: false });
    }
}
