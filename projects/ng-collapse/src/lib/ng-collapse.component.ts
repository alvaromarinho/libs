
import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ChangeDetectionStrategy, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'ng-collapse',
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div #collapseContainer class="ng-collapse" [class.show]="isExpanded"[class.overflow]="showOverflow"[style.max-height.px]="maxHeightValue">
            <ng-content></ng-content>
        </div>
    `,
    styles: [`
        .ng-collapse { overflow: hidden; transition: max-height 0.3s ease-out; }
        .ng-collapse.show { transition: max-height 0.5s ease-in; }
        .ng-collapse.overflow { overflow: visible; }
    `]
})
export class NgCollapseComponent implements OnChanges, AfterViewInit, OnDestroy {

    @Input() toggle = false;
    @Input() transitionDuration = 500;

    @ViewChild('collapseContainer', { static: true })
    private collapseContainer!: ElementRef<HTMLDivElement>;

    protected isExpanded = false;
    protected showOverflow = false;
    protected maxHeightValue: number = 0;

    private timers: number[] = [];
    private resizeObserver?: ResizeObserver;

    constructor(private cdr: ChangeDetectorRef) { }

    ngAfterViewInit(): void {
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => {
                if (this.isExpanded && this.showOverflow) {
                    const height = this.calculateHeight();
                    if (height !== this.maxHeightValue) {
                        this.maxHeightValue = height;
                        this.cdr.markForCheck();
                    }
                }
            });

            this.resizeObserver.observe(this.collapseContainer.nativeElement);
        }

        if (this.toggle) {
            // Inicializa aberto sem animação
            this.maxHeightValue = this.calculateHeight();
            this.isExpanded = true;
            this.showOverflow = true;
            this.cdr.markForCheck();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['toggle'] && !changes['toggle'].firstChange) {
            this.updateCollapse(this.toggle);
        }
    }

    ngOnDestroy(): void {
        this.clearTimer();
        this.resizeObserver?.disconnect();
    }

    private updateCollapse(expand: boolean): void {
        this.clearTimer();

        if (expand) {
            // Abrir
            this.showOverflow = false;
            this.isExpanded = false;
            this.maxHeightValue = 0;
            this.cdr.detectChanges();

            this.schedule(() => {
                this.isExpanded = true;
                this.cdr.detectChanges();

                this.schedule(() => {
                    this.maxHeightValue = this.calculateHeight();
                    this.cdr.markForCheck();

                    // Ativa overflow após transição
                    this.schedule(() => {
                        this.showOverflow = true;
                        this.cdr.markForCheck();
                    }, this.transitionDuration);
                }, 10);
            }, 10);
        } else {

            this.showOverflow = false;

            if (this.isExpanded) {
                this.maxHeightValue = this.calculateHeight();
                this.cdr.detectChanges();

                this.schedule(() => {
                    this.maxHeightValue = 0;
                    this.cdr.markForCheck();

                    this.schedule(() => {
                        this.isExpanded = false;
                        this.cdr.markForCheck();
                    }, 300);
                }, 10);
            } else {
                this.maxHeightValue = 0;
                this.isExpanded = false;
                this.cdr.markForCheck();
            }
        }
    }

    private calculateHeight(): number {
        if (!this.collapseContainer) return 0;

        const element = this.collapseContainer.nativeElement;
        return element.scrollHeight;
    }

    private schedule(fn: () => void, delay: number): void {
        this.timers.push(window.setTimeout(fn, delay));
    }

    private clearTimer(): void {
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers = [];
    }
}