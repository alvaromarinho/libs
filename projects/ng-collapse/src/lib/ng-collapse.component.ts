
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, effect, input, signal, untracked, viewChild } from '@angular/core';

@Component({
    selector: 'ng-collapse',
    standalone: true,
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div #collapseContainer class="ng-collapse" [class.show]="isExpanded()" [class.overflow]="showOverflow()" [style.max-height.px]="maxHeightValue()">
            <ng-content></ng-content>
        </div>
    `,
    styles: [`
        .ng-collapse { overflow: hidden; transition: max-height 0.3s ease-out; }
        .ng-collapse.show { transition: max-height 0.5s ease-in; }
        .ng-collapse.overflow { overflow: visible; }
    `]
})
export class NgCollapseComponent implements AfterViewInit, OnDestroy {

    readonly toggle = input(false);
    readonly transitionDuration = input(500);

    private readonly collapseContainer = viewChild.required<ElementRef<HTMLDivElement>>('collapseContainer');

    protected readonly isExpanded = signal(false);
    protected readonly showOverflow = signal(false);
    protected readonly maxHeightValue = signal(0);

    private timers: number[] = [];
    private resizeObserver?: ResizeObserver;
    // Último toggle aplicado no DOM. No Angular 18 o primeiro run do effect vem depois do ngAfterViewInit:
    // sem essa comparação, um toggle inicial true fecharia e reabriria animando na carga.
    private appliedToggle?: boolean;

    constructor() {
        // Anima o DOM quando toggle muda depois da view pronta; o valor inicial é tratado no ngAfterViewInit.
        // untracked: grava signal sem allowSignalWrites, que o Angular 18 exigiria.
        effect(() => {
            const expand = this.toggle();
            untracked(() => {
                if (this.appliedToggle !== undefined && this.appliedToggle !== expand) {
                    this.appliedToggle = expand;
                    this.updateCollapse(expand);
                }
            });
        });
    }

    ngAfterViewInit(): void {
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => {
                if (this.isExpanded() && this.showOverflow()) {
                    this.maxHeightValue.set(this.calculateHeight());
                }
            });

            this.resizeObserver.observe(this.collapseContainer().nativeElement);
        }

        if (this.toggle()) {
            // Inicializa aberto sem animação
            this.maxHeightValue.set(this.calculateHeight());
            this.isExpanded.set(true);
            this.showOverflow.set(true);
        }
        this.appliedToggle = this.toggle();
    }

    ngOnDestroy(): void {
        this.clearTimer();
        this.resizeObserver?.disconnect();
    }

    private updateCollapse(expand: boolean): void {
        this.clearTimer();

        if (expand) {
            // Abrir: parte de fechado, marca show e só depois mede a altura
            this.showOverflow.set(false);
            this.isExpanded.set(false);
            this.maxHeightValue.set(0);

            this.schedule(() => {
                this.isExpanded.set(true);

                this.schedule(() => {
                    this.maxHeightValue.set(this.calculateHeight());

                    // Ativa overflow após transição
                    this.schedule(() => {
                        this.showOverflow.set(true);
                    }, this.transitionDuration());
                }, 10);
            }, 10);
        } else {
            this.showOverflow.set(false);

            if (this.isExpanded()) {
                this.maxHeightValue.set(this.calculateHeight());

                this.schedule(() => {
                    this.maxHeightValue.set(0);

                    this.schedule(() => {
                        this.isExpanded.set(false);
                    }, 300);
                }, 10);
            } else {
                this.maxHeightValue.set(0);
                this.isExpanded.set(false);
            }
        }
    }

    private calculateHeight(): number {
        return this.collapseContainer().nativeElement.scrollHeight;
    }

    private schedule(fn: () => void, delay: number): void {
        this.timers.push(window.setTimeout(fn, delay));
    }

    private clearTimer(): void {
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers = [];
    }
}