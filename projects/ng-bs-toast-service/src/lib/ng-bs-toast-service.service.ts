import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

export type ToastStyle = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

/**
 * Rendering theme, independent from `style` (the bootstrap color):
 * - 'bootstrap': solid `text-bg-*` toast (bootstrap default look)
 * - 'bootstrap-dark': native bootstrap dark mode (`data-bs-theme="dark"`), using the same color pairing
 *   bootstrap's own `.alert-{style}` uses (`bg-{style}-subtle` / `text-{style}-emphasis` / `border-{style}-subtle`)
 */
export type ToastTheme = 'bootstrap' | 'bootstrap-dark';

export type ToastPosition =
    | 'top-start' | 'top-center' | 'top-end'
    | 'middle-center'
    | 'bottom-start' | 'bottom-center' | 'bottom-end';

export interface ToastMessage {
    title: string;
    message: string | null;
    style?: ToastStyle;
    theme?: ToastTheme;
    position?: ToastPosition;
    duration?: number; // ms; when omitted, resolved from `style` — see resolveToastDuration()
}

export interface ToastOptions {
    theme?: ToastTheme;
    position?: ToastPosition;
}

export interface InternalToastMessage extends ToastMessage {
    id: number;
}

const STYLE_DURATIONS: Partial<Record<ToastStyle, number>> = {
    warning: 7000,
    danger: 10000,
};
const DEFAULT_DURATION = 4000;

/** Default auto-hide duration for a given style: warning 7s, danger 10s, rest 4s. */
export function resolveToastDuration(style?: ToastStyle): number {
    return (style && STYLE_DURATIONS[style]) || DEFAULT_DURATION;
}

@Injectable({ providedIn: 'root' })
export class NgBsToastService {

    // ReplaySubject(1) so a toast fired before NgBsToastServiceComponent finishes
    // subscribing (ngOnInit race) isn't silently dropped.
    private stream = new ReplaySubject<InternalToastMessage>(1);
    private dismissRequests = new Subject<number>();
    private dismissAllRequests = new Subject<void>();
    private closedSubjects = new Map<number, Subject<void>>();
    private counter = 0;

    /** Sends a toast. Returns an Observable that completes when the toast closes. */
    send(title: string, message: string | null, style?: ToastStyle, duration?: number, options?: ToastOptions): Observable<void> {
        const id = this.counter++;
        const closed$ = new Subject<void>();
        this.closedSubjects.set(id, closed$);

        this.stream.next({
            id,
            title,
            message,
            style,
            duration,
            theme: options?.theme,
            position: options?.position,
        });

        return closed$.asObservable();
    }

    /** Closes a specific toast by the id emitted internally (subscribe to send()'s Observable instead when possible). */
    dismiss(id: number): void {
        this.dismissRequests.next(id);
    }

    /** Closes every toast currently shown or queued. */
    dismissAll(): void {
        this.dismissAllRequests.next();
    }

    listen(): Observable<InternalToastMessage> {
        return this.stream.asObservable();
    }

    listenDismiss(): Observable<number> {
        return this.dismissRequests.asObservable();
    }

    listenDismissAll(): Observable<void> {
        return this.dismissAllRequests.asObservable();
    }

    /** @internal called by NgBsToastServiceComponent once a toast has actually finished closing. */
    notifyClosed(id: number): void {
        const closed$ = this.closedSubjects.get(id);
        if (closed$) {
            closed$.next();
            closed$.complete();
            this.closedSubjects.delete(id);
        }
    }
}
