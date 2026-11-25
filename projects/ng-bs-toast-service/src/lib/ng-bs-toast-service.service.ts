import { Injectable } from '@angular/core';
import { Observable, Subject, concat, defer, from } from 'rxjs';
import { finalize } from 'rxjs/operators';

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

    // Toasts sent while no NgBsToastServiceComponent is listening (before its ngOnInit, or between
    // a destroy and a new instance) wait here and are delivered once, to the next listener.
    private stream = new Subject<InternalToastMessage>();
    private buffer: InternalToastMessage[] = [];
    private listeners = 0;
    private dismissRequests = new Subject<number>();
    private dismissAllRequests = new Subject<void>();
    private closedSubjects = new Map<number, Subject<void>>();
    private counter = 0;

    /** Sends a toast. Returns an Observable that completes when the toast closes. */
    send(title: string, message: string | null, style?: ToastStyle, duration?: number, options?: ToastOptions): Observable<void> {
        const id = this.counter++;
        const closed$ = new Subject<void>();
        this.closedSubjects.set(id, closed$);

        const toast: InternalToastMessage = {
            id,
            title,
            message,
            style,
            duration,
            theme: options?.theme,
            position: options?.position,
        };
        if (this.listeners > 0) {
            this.stream.next(toast);
        } else {
            this.buffer.push(toast);
        }

        return closed$.asObservable();
    }

    /** Closes a specific toast by the id emitted internally (subscribe to send()'s Observable instead when possible). */
    dismiss(id: number): void {
        const index = this.buffer.findIndex(t => t.id === id);
        if (index !== -1) {
            this.buffer.splice(index, 1);
            this.notifyClosed(id);
            return;
        }
        this.dismissRequests.next(id);
    }

    /** Closes every toast currently shown or queued. */
    dismissAll(): void {
        this.buffer.splice(0).forEach(t => this.notifyClosed(t.id));
        this.dismissAllRequests.next();
    }

    listen(): Observable<InternalToastMessage> {
        return defer(() => {
            this.listeners++;
            const pending = this.buffer.splice(0);
            return concat(from(pending), this.stream).pipe(finalize(() => this.listeners--));
        });
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
