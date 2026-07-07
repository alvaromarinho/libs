import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
    DEFAULT_FIRST_LAST,
    DEFAULT_LAYOUT,
    DEFAULT_PREV_NEXT,
    PaginationFirstLast,
    PaginationInfoContext,
    PaginationLayout,
    PaginationPrevNext,
} from './ng-bs-pagination.model';

@Component({
    selector: 'ng-bs-pagination',
    standalone: true,
    imports: [NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './ng-bs-pagination.component.html',
})
export class NgBsPaginationComponent {

    @Input() total = 0;
    @Input() current = 1;
    @Input() itemPerPage = 10;
    @Input() maxPagesToShow = 5;
    @Input() size: 'sm' | 'md' | 'lg' = 'md';

    @Input()
    set layout(value: PaginationLayout | undefined) {
        this._layout = { ...DEFAULT_LAYOUT, ...value };
    }
    get layout(): Required<PaginationLayout> {
        return this._layout;
    }
    private _layout: Required<PaginationLayout> = { ...DEFAULT_LAYOUT };

    @Input()
    set prevNext(value: PaginationPrevNext | undefined) {
        this._prevNext = {
            ...DEFAULT_PREV_NEXT,
            ...value,
            labels: { ...DEFAULT_PREV_NEXT.labels, ...value?.labels },
        };
    }
    get prevNext(): Required<PaginationPrevNext> {
        return this._prevNext;
    }
    private _prevNext: Required<PaginationPrevNext> = { ...DEFAULT_PREV_NEXT, labels: { ...DEFAULT_PREV_NEXT.labels } };

    @Input()
    set firstLast(value: PaginationFirstLast | undefined) {
        this._firstLast = {
            ...DEFAULT_FIRST_LAST,
            ...value,
            labels: { ...DEFAULT_FIRST_LAST.labels, ...value?.labels },
        };
    }
    get firstLast(): Required<PaginationFirstLast> {
        return this._firstLast;
    }
    private _firstLast: Required<PaginationFirstLast> = { ...DEFAULT_FIRST_LAST, labels: { ...DEFAULT_FIRST_LAST.labels } };

    @Output() change = new EventEmitter<number>();
    @Output() first = new EventEmitter<number>();
    @Output() last = new EventEmitter<number>();

    @ContentChild(TemplateRef) infoTemplate?: TemplateRef<PaginationInfoContext>;

    get totalPages(): number {
        return Math.ceil(this.total / this.itemPerPage) || 1;
    }

    get pages(): number[] {
        const maxPages = Math.max(1, this.maxPagesToShow);
        const half = Math.floor(maxPages / 2);

        let start = Math.max(1, this.current - half);
        const end = Math.min(this.totalPages, start + maxPages - 1);
        start = Math.max(1, end - maxPages + 1);

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    get infoContext(): PaginationInfoContext {
        const start = this.total === 0 ? 0 : (this.current - 1) * this.itemPerPage + 1;
        const end = Math.min(this.current * this.itemPerPage, this.total);
        return { start, end, total: this.total, current: this.current, totalPages: this.totalPages };
    }

    get sizeClass(): string {
        return this.size === 'md' ? '' : `pagination-${this.size}`;
    }

    get wrapperClasses(): string {
        const classes = ['d-flex', 'flex-wrap', 'align-items-center', 'gap-2'];

        if (this.layout.type === 'stacked') {
            classes.push('flex-column', 'justify-content-center');
            if (this.layout.showInfo && this.layout.infoPosition === 'end') classes.push('flex-column-reverse');
        } else {
            classes.push(this.layout.type === 'center' ? 'justify-content-center' : 'justify-content-between');
            if (this.layout.type === 'center') classes.push('gap-3');
            if (this.layout.showInfo && this.layout.infoPosition === 'end') classes.push('flex-row-reverse');
        }

        return classes.join(' ');
    }

    goTo(page: number): void {
        if (page < 1 || page > this.totalPages || page === this.current) return;
        this.change.emit(page);
    }

    goFirst(): void {
        if (this.current === 1) return;
        this.first.emit(1);
    }

    goLast(): void {
        if (this.current === this.totalPages) return;
        this.last.emit(this.totalPages);
    }
}
