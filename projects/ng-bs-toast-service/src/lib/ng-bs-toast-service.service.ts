import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NgBsToastService {

    private subject = new Subject<any>();

    send(title: string, message: string | null, style?: 'success' | 'warning' | 'danger' | 'primary') {
        this.subject.next({ title, message, style });
    }

    listen(): Observable<any> {
        return this.subject.asObservable();
    }
}
