import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ToastMessage {
    title: string;
    message: string | null;
    style?: 'success' | 'warning' | 'danger' | 'primary';
    duration?: number; // ms
}

@Injectable({ providedIn: 'root' })
export class NgBsToastService {

    private subject = new Subject<ToastMessage>();

    send(title: string, message: string | null, style?: 'success' | 'warning' | 'danger' | 'primary', duration = 5000) {
        this.subject.next({ title, message, style, duration });
    }

    listen(): Observable<ToastMessage> {
        return this.subject.asObservable();
    }
}
