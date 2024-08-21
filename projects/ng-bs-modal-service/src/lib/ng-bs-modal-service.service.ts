import { Injectable, TemplateRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NgBsModalServiceContent, NgBsModalServiceData, NgBsModalServiceOptions } from './ng-bs-modal-service.model';

@Injectable({
    providedIn: 'root'
})
export class NgBsModalService {

    private subject = new Subject<NgBsModalServiceData>()

    get(): Observable<any> {
        return this.subject.asObservable();
    }

    open(content: NgBsModalServiceContent | TemplateRef<any>, options?: NgBsModalServiceOptions) {
        options = options || {} as any;
        this.subject.next({ open: true, content, options });
    }

    close() {
        this.subject.next({ open: false });
    }
}
