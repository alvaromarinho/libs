import { ChangeDetectionStrategy, Component, DestroyRef, Injector, OnInit, WritableSignal, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Toast } from 'bootstrap';
import { InternalToastMessage, NgBsToastService, ToastPosition, ToastStyle, ToastTheme, resolveToastDuration } from './ng-bs-toast-service.service';

interface ToastData extends InternalToastMessage {
    resolvedStyle: ToastStyle;
    resolvedTheme: ToastTheme;
    resolvedPosition: ToastPosition;
    resolvedDuration: number;
    classes: Record<string, boolean>;
    iconClass: string;
    progressStyle: string;
    closeClass: string;
    urgent: boolean;
    dark: boolean;
    paused: WritableSignal<boolean>;
    instance?: Toast;
    remainingMs: number;
    startedAt?: number;
    timerHandle?: ReturnType<typeof setTimeout>;
}

const ALL_POSITIONS: ToastPosition[] = [
    'top-start', 'top-center', 'top-end',
    'middle-center',
    'bottom-start', 'bottom-center', 'bottom-end',
];

const POSITION_CLASSES: Record<ToastPosition, string> = {
    'top-start': 'top-0 start-0',
    'top-center': 'top-0 start-50 translate-middle-x',
    'top-end': 'top-0 end-0',
    'middle-center': 'top-50 start-50 translate-middle',
    'bottom-start': 'bottom-0 start-0',
    'bottom-center': 'bottom-0 start-50 translate-middle-x',
    'bottom-end': 'bottom-0 end-0',
};

const STYLE_ICONS: Record<ToastStyle, string> = {
    primary: 'bi-chat-text-fill',
    secondary: 'bi-dash-circle-fill',
    success: 'bi-check-circle-fill',
    danger: 'bi-x-circle-fill',
    warning: 'bi-exclamation-circle-fill',
    info: 'bi-info-circle-fill',
    light: 'bi-brightness-high-fill',
    dark: 'bi-moon-stars-fill',
};

// Styles whose `text-bg-*` background is dark enough to need the white btn-close filter.
const DARK_BG_STYLES = new Set<ToastStyle>(['primary', 'secondary', 'success', 'danger', 'dark']);

/**
 * 'bootstrap-dark' uses bootstrap's own `[data-bs-theme=dark]` pairing (the one `.alert-{style}` uses:
 * *-bg-subtle / *-text-emphasis / *-border-subtle), so it follows dark mode instead of a hand-picked color.
 */
function toastClasses(style: ToastStyle, theme: ToastTheme): Record<string, boolean> {
    if (theme === 'bootstrap-dark') {
        return { [`bg-${style}-subtle`]: true, [`text-${style}-emphasis`]: true, border: true, [`border-${style}-subtle`]: true };
    }
    return { [`text-bg-${style}`]: true };
}

/**
 * Both themes sit on a background already tinted with the accent color, so a `bg-{style}` bar would blend in
 * (worst case: style 'dark'). 'bootstrap' gets a translucent white/black overlay (same side as the close button);
 * 'bootstrap-dark' gets the style's `*-text-emphasis`, which bootstrap tunes to stay legible on `*-bg-subtle`.
 */
function progressStyle(style: ToastStyle, theme: ToastTheme): string {
    if (theme === 'bootstrap-dark') {
        return `background-color: var(--bs-${style}-text-emphasis);`;
    }
    return DARK_BG_STYLES.has(style) ? 'background-color: rgba(255, 255, 255, .75);' : 'background-color: rgba(0, 0, 0, .5);';
}

@Component({
    selector: 'ng-bs-toast-service',
    standalone: true,
    templateUrl: './ng-bs-toast-service.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./ng-bs-toast-service.component.css']
})
export class NgBsToastServiceComponent implements OnInit {

    /** Max toasts shown at once per position; the rest wait in a queue. */
    readonly maxToastsPerPosition = input(5);

    /** Default theme applied when a `send()` call doesn't pass its own `options.theme`. */
    readonly theme = input<ToastTheme>('bootstrap');

    protected readonly positionClasses = POSITION_CLASSES;
    protected readonly toasts = signal<ToastData[]>([]);
    protected readonly positions = computed(() => ALL_POSITIONS.filter(p => this.toasts().some(t => t.resolvedPosition === p)));

    private readonly toastService = inject(NgBsToastService);
    private readonly injector = inject(Injector);
    private readonly destroyRef = inject(DestroyRef);
    private readonly pendingQueue = new Map<ToastPosition, ToastData[]>(ALL_POSITIONS.map(p => [p, []]));

    constructor() {
        this.destroyRef.onDestroy(() => this.closeEverything());
    }

    ngOnInit(): void {
        this.toastService.listen().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => this.addToast(data));
        this.toastService.listenDismiss().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(id => this.dismissToast(id));
        this.toastService.listenDismissAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.dismissAllToasts());
    }

    protected toastsFor(position: ToastPosition): ToastData[] {
        return this.toasts().filter(t => t.resolvedPosition === position);
    }

    protected pauseToast(toast: ToastData): void {
        if (toast.paused() || !toast.timerHandle) return;
        clearTimeout(toast.timerHandle);
        toast.timerHandle = undefined;
        const elapsed = Date.now() - (toast.startedAt ?? Date.now());
        toast.remainingMs = Math.max(toast.remainingMs - elapsed, 0);
        toast.paused.set(true);
    }

    protected resumeToast(toast: ToastData): void {
        if (!toast.paused() || !toast.instance) return;
        toast.paused.set(false);
        this.startTimer(toast);
    }

    private addToast(data: InternalToastMessage): void {
        const style = data.style || 'primary';
        const theme = data.theme || this.theme();
        const position = data.position || 'top-end';
        const duration = data.duration ?? resolveToastDuration(style);

        const toast: ToastData = {
            ...data,
            resolvedStyle: style,
            resolvedTheme: theme,
            resolvedPosition: position,
            resolvedDuration: duration,
            classes: toastClasses(style, theme),
            iconClass: STYLE_ICONS[style],
            progressStyle: progressStyle(style, theme),
            closeClass: theme === 'bootstrap' && DARK_BG_STYLES.has(style) ? 'btn-close-white' : '',
            urgent: style === 'danger' || style === 'warning',
            dark: theme === 'bootstrap-dark',
            paused: signal(false),
            remainingMs: duration,
        };

        if (this.toastsFor(position).length >= this.maxToastsPerPosition()) {
            this.pendingQueue.get(position)!.push(toast);
            return;
        }
        this.showToast(toast);
    }

    private showToast(toast: ToastData): void {
        this.toasts.update(list => [...list, toast]);
        // The element only exists after the next render.
        afterNextRender(() => this.initializeToast(toast), { injector: this.injector });
    }

    private initializeToast(toast: ToastData): void {
        if (!this.toasts().includes(toast)) return;
        const element = document.getElementById(`toast_${toast.id}`);
        if (!element) {
            // Without the element the toast would hold a slot forever and closed$ would never fire.
            console.error(`ng-bs-toast-service: element for toast ${toast.id} not found`);
            this.removeToast(toast.id);
            return;
        }

        toast.instance = new Toast(element, { autohide: false });
        element.addEventListener('hidden.bs.toast', () => this.removeToast(toast.id));
        toast.instance.show();
        this.startTimer(toast);
    }

    private startTimer(toast: ToastData): void {
        toast.startedAt = Date.now();
        toast.timerHandle = setTimeout(() => toast.instance?.hide(), toast.remainingMs);
    }

    private removeToast(id: number): void {
        const toast = this.toasts().find(t => t.id === id);
        if (!toast) return;

        this.disposeToast(toast);
        this.toasts.update(list => list.filter(t => t !== toast));
        this.toastService.notifyClosed(id);
        this.dequeueNext(toast.resolvedPosition);
    }

    private disposeToast(toast: ToastData): void {
        if (toast.timerHandle) clearTimeout(toast.timerHandle);
        try {
            toast.instance?.dispose();
        } catch {
            // The element may already be gone from the DOM.
        }
    }

    private dequeueNext(position: ToastPosition): void {
        const next = this.pendingQueue.get(position)!.shift();
        if (next) this.showToast(next);
    }

    private dismissToast(id: number): void {
        const toast = this.toasts().find(t => t.id === id);
        if (toast) {
            // No instance yet means it hasn't rendered: remove it directly.
            if (toast.instance) toast.instance.hide();
            else this.removeToast(id);
            return;
        }
        for (const queue of this.pendingQueue.values()) {
            const index = queue.findIndex(t => t.id === id);
            if (index !== -1) {
                queue.splice(index, 1);
                this.toastService.notifyClosed(id);
                return;
            }
        }
    }

    private dismissAllToasts(): void {
        // Clear the queues first: closing a visible toast would otherwise promote the next queued one.
        this.clearQueues();
        this.toasts().forEach(t => this.dismissToast(t.id));
    }

    private clearQueues(): void {
        this.pendingQueue.forEach(queue => {
            queue.forEach(t => this.toastService.notifyClosed(t.id));
            queue.length = 0;
        });
    }

    private closeEverything(): void {
        this.clearQueues();
        this.toasts().forEach(toast => {
            this.disposeToast(toast);
            this.toastService.notifyClosed(toast.id);
        });
    }

}
