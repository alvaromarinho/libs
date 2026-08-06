import { OnInit, OnDestroy, Component, Input, ViewChildren, QueryList, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { NgBsToastService, ToastMessage, ToastPosition, ToastStyle, ToastTheme, resolveToastDuration } from './ng-bs-toast-service.service';
import { Toast } from 'bootstrap';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

interface ToastData extends ToastMessage {
    id: number;
    resolvedStyle: ToastStyle;
    resolvedTheme: ToastTheme;
    resolvedPosition: ToastPosition;
    resolvedDuration: number;
    instance?: Toast;
    remainingMs: number;
    startedAt?: number;
    timerHandle?: ReturnType<typeof setTimeout>;
    paused: boolean;
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

@Component({
    selector: 'ng-bs-toast-service',
    imports: [CommonModule],
    templateUrl: './ng-bs-toast-service.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./ng-bs-toast-service.component.css']
})
export class NgBsToastServiceComponent implements OnInit, OnDestroy {

    @ViewChildren('toastElement') toastElements!: QueryList<ElementRef>;

    /** Max toasts shown at once per position; the rest wait in a queue. */
    @Input() maxToastsPerPosition = 5;

    /** Default theme applied when a `send()` call doesn't pass its own `options.theme`. */
    @Input() theme: ToastTheme = 'bootstrap';

    readonly positions = ALL_POSITIONS;
    readonly positionClasses = POSITION_CLASSES;

    toastData: ToastData[] = [];
    private pendingQueue = new Map<ToastPosition, ToastData[]>(ALL_POSITIONS.map(p => [p, []]));
    private destroy$ = new Subject<void>();
    private toastCounter = 0;

    constructor(
        private toastService: NgBsToastService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.toastService.listen().pipe(takeUntil(this.destroy$)).subscribe((data) => this.addToast(data));
        this.toastService.listenDismiss().pipe(takeUntil(this.destroy$)).subscribe((id) => this.dismissToast(id));
        this.toastService.listenDismissAll().pipe(takeUntil(this.destroy$)).subscribe(() => this.dismissAllToasts());
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();

        this.toastData.forEach(toast => {
            if (toast.timerHandle) clearTimeout(toast.timerHandle);
            if (toast.instance) {
                try {
                    toast.instance.dispose();
                } catch (e) {
                    // Ignore disposal errors if element is already removed
                }
            }
            this.toastService.notifyClosed(toast.id);
        });

        this.pendingQueue.forEach(queue => {
            queue.forEach(t => this.toastService.notifyClosed(t.id));
            queue.length = 0;
        });
    }

    toastsForPosition(position: ToastPosition): ToastData[] {
        return this.toastData.filter(t => t.resolvedPosition === position);
    }

    iconFor(style: ToastStyle): string {
        return STYLE_ICONS[style];
    }

    isUrgent(toast: ToastData): boolean {
        return toast.resolvedStyle === 'danger' || toast.resolvedStyle === 'warning';
    }

    /** Relies on bootstrap's own `[data-bs-theme=dark]` CSS vars (bg-subtle/text-emphasis/border-subtle, btn-close filter). */
    isDarkTheme(toast: ToastData): boolean {
        return toast.resolvedTheme === 'bootstrap-dark';
    }

    toastClasses(toast: ToastData): Record<string, boolean> {
        if (toast.resolvedTheme === 'bootstrap-dark') {
            // Same color pairing bootstrap's own `.alert-{style}` uses: *-bg-subtle / *-text-emphasis / *-border-subtle —
            // all dark-mode aware, so this genuinely follows data-bs-theme="dark" instead of a hand-picked color.
            return {
                [`bg-${toast.resolvedStyle}-subtle`]: true,
                [`text-${toast.resolvedStyle}-emphasis`]: true,
                'border': true,
                [`border-${toast.resolvedStyle}-subtle`]: true,
            };
        }
        return { [`text-bg-${toast.resolvedStyle}`]: true };
    }

    iconClasses(toast: ToastData): Record<string, boolean> {
        return { [this.iconFor(toast.resolvedStyle)]: true };
    }

    /**
     * Both themes sit on a background that's already tinted with the accent color (solid `text-bg-{style}`, or
     * tinted `{style}-bg-subtle`) — a `bg-{style}` bar would blend in, worst case for style 'dark' (near-invisible
     * dark-on-dark). Bind a color guaranteed to contrast against that specific background instead:
     * - 'bootstrap': translucent white/black overlay, same readable-side pick as the close button.
     * - 'bootstrap-dark': the style's own `*-text-emphasis` color — bootstrap already tunes that to stay legible
     *   against `*-bg-subtle`, so it reads for every style, 'dark' included.
     */
    progressBarStyle(toast: ToastData): string {
        if (toast.resolvedTheme === 'bootstrap-dark') {
            return `background-color: var(--bs-${toast.resolvedStyle}-text-emphasis);`;
        }
        return DARK_BG_STYLES.has(toast.resolvedStyle)
            ? 'background-color: rgba(255, 255, 255, .75);'
            : 'background-color: rgba(0, 0, 0, .5);';
    }

    closeButtonClass(toast: ToastData): string {
        return toast.resolvedTheme === 'bootstrap' && DARK_BG_STYLES.has(toast.resolvedStyle) ? 'btn-close-white' : '';
    }

    pauseToast(toast: ToastData) {
        if (toast.paused || !toast.timerHandle) return;
        clearTimeout(toast.timerHandle);
        toast.timerHandle = undefined;
        const elapsed = Date.now() - (toast.startedAt ?? Date.now());
        toast.remainingMs = Math.max(toast.remainingMs - elapsed, 0);
        toast.paused = true;
    }

    resumeToast(toast: ToastData) {
        if (!toast.paused || !toast.instance) return;
        toast.paused = false;
        toast.startedAt = Date.now();
        toast.timerHandle = setTimeout(() => toast.instance?.hide(), toast.remainingMs);
    }

    private addToast(data: ToastMessage & { id?: number }) {
        const style = data.style || 'primary';
        const theme = data.theme || this.theme;
        const position = data.position || 'top-end';
        const duration = data.duration ?? resolveToastDuration(style);
        const id = data.id ?? this.toastCounter++;

        const toastData: ToastData = {
            ...data,
            id,
            resolvedStyle: style,
            resolvedTheme: theme,
            resolvedPosition: position,
            resolvedDuration: duration,
            remainingMs: duration,
            paused: false,
        };

        const visibleCount = this.toastData.filter(t => t.resolvedPosition === position).length;
        if (visibleCount >= this.maxToastsPerPosition) {
            this.pendingQueue.get(position)!.push(toastData);
            return;
        }
        this.showToast(toastData);
    }

    private showToast(toastData: ToastData) {
        this.toastData.push(toastData);
        this.cdr.detectChanges();
        this.initializeToast(toastData, 0);
    }

    private initializeToast(toastData: ToastData, attempt: number): void {
        // Maximum 10 attempts (about 500ms total)
        if (attempt >= 10) {
            console.error(`Failed to initialize toast ${toastData.id} after ${attempt} attempts`);
            return;
        }

        // Exponential backoff: 0, 10, 20, 40, 80ms...
        const delay = attempt === 0 ? 0 : Math.min(10 * Math.pow(2, attempt - 1), 100);

        setTimeout(() => {
            const element = document.getElementById(`toast_${toastData.id}`);

            if (element) {
                try {
                    const toastInstance = new Toast(element, { autohide: false });

                    toastData.instance = toastInstance;
                    toastInstance.show();
                    toastData.startedAt = Date.now();
                    toastData.timerHandle = setTimeout(() => toastInstance.hide(), toastData.remainingMs);

                    element.addEventListener('hidden.bs.toast', () => this.removeToast(toastData.id));
                } catch (error) {
                    console.error(`Error initializing toast ${toastData.id}:`, error);
                }
            } else {
                this.initializeToast(toastData, attempt + 1);
            }
        }, delay);
    }

    private removeToast(id: number) {
        const index = this.toastData.findIndex(t => t.id === id);
        if (index === -1) return;

        const toastData = this.toastData[index];
        if (toastData.timerHandle) clearTimeout(toastData.timerHandle);
        if (toastData.instance) {
            try {
                toastData.instance.dispose();
            } catch (e) {
                // Ignore disposal errors if element is already removed
            }
        }
        this.toastData.splice(index, 1);
        this.toastService.notifyClosed(id);
        this.cdr.detectChanges();
        this.dequeueNext(toastData.resolvedPosition);
    }

    private dequeueNext(position: ToastPosition) {
        const queue = this.pendingQueue.get(position);
        if (queue?.length) {
            this.showToast(queue.shift()!);
        }
    }

    private dismissToast(id: number) {
        const toast = this.toastData.find(t => t.id === id);
        if (toast?.instance) {
            toast.instance.hide(); // triggers 'hidden.bs.toast' -> removeToast()
            return;
        }
        for (const queue of this.pendingQueue.values()) {
            const idx = queue.findIndex(t => t.id === id);
            if (idx !== -1) {
                queue.splice(idx, 1);
                this.toastService.notifyClosed(id);
                return;
            }
        }
    }

    private dismissAllToasts() {
        // Clear the queue first: closing a visible toast below would otherwise dequeue
        // and immediately re-show the next queued one instead of actually closing everything.
        this.pendingQueue.forEach(queue => {
            queue.forEach(t => this.toastService.notifyClosed(t.id));
            queue.length = 0;
        });
        [...this.toastData].forEach(t => t.instance ? t.instance.hide() : this.removeToast(t.id));
    }
}
