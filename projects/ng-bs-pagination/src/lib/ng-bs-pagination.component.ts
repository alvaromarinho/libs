import { ChangeDetectionStrategy, Component, TemplateRef, computed, contentChild, input, output } from '@angular/core';
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

function mergeLayout(value: PaginationLayout | undefined): Required<PaginationLayout> {
    return { ...DEFAULT_LAYOUT, ...value };
}

function mergePrevNext(value: PaginationPrevNext | undefined): Required<PaginationPrevNext> {
    return { ...DEFAULT_PREV_NEXT, ...value, labels: { ...DEFAULT_PREV_NEXT.labels, ...value?.labels } };
}

function mergeFirstLast(value: PaginationFirstLast | undefined): Required<PaginationFirstLast> {
    return { ...DEFAULT_FIRST_LAST, ...value, labels: { ...DEFAULT_FIRST_LAST.labels, ...value?.labels } };
}

@Component({
    selector: 'ng-bs-pagination',
    standalone: true,
    imports: [NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './ng-bs-pagination.component.html',
})
export class NgBsPaginationComponent {

    readonly total = input(0);
    readonly current = input(1);
    readonly itemPerPage = input(10);
    readonly maxPagesToShow = input(5);
    readonly size = input<'sm' | 'md' | 'lg'>('md');
    readonly layout = input(mergeLayout(undefined), { transform: mergeLayout });
    readonly prevNext = input(mergePrevNext(undefined), { transform: mergePrevNext });
    readonly firstLast = input(mergeFirstLast(undefined), { transform: mergeFirstLast });

    readonly change = output<number>();
    readonly first = output<number>();
    readonly last = output<number>();

    protected readonly infoTemplate = contentChild<TemplateRef<PaginationInfoContext>>(TemplateRef);

    protected readonly totalPages = computed(() => Math.ceil(this.total() / this.itemPerPage()) || 1);

    protected readonly pages = computed(() => {
        const maxPages = Math.max(1, this.maxPagesToShow());
        const half = Math.floor(maxPages / 2);

        let start = Math.max(1, this.current() - half);
        const end = Math.min(this.totalPages(), start + maxPages - 1);
        start = Math.max(1, end - maxPages + 1);

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    });

    protected readonly infoContext = computed<PaginationInfoContext>(() => {
        const total = this.total();
        const current = this.current();
        const start = total === 0 ? 0 : (current - 1) * this.itemPerPage() + 1;
        const end = Math.min(current * this.itemPerPage(), total);
        return { start, end, total, current, totalPages: this.totalPages() };
    });

    protected readonly sizeClass = computed(() => this.size() === 'md' ? '' : `pagination-${this.size()}`);

    protected readonly wrapperClasses = computed(() => {
        const layout = this.layout();
        const classes = ['d-flex', 'flex-wrap', 'align-items-center', 'gap-2'];

        if (layout.type === 'stacked') {
            classes.push('flex-column', 'justify-content-center');
            if (layout.showInfo && layout.infoPosition === 'end') classes.push('flex-column-reverse');
        } else {
            classes.push(layout.type === 'center' ? 'justify-content-center' : 'justify-content-between');
            if (layout.type === 'center') classes.push('gap-3');
            if (layout.showInfo && layout.infoPosition === 'end') classes.push('flex-row-reverse');
        }

        return classes.join(' ');
    });

    protected goTo(page: number): void {
        if (page < 1 || page > this.totalPages() || page === this.current()) return;
        this.change.emit(page);
    }

    protected goFirst(): void {
        if (this.current() === 1) return;
        this.first.emit(1);
    }

    protected goLast(): void {
        if (this.current() === this.totalPages()) return;
        this.last.emit(this.totalPages());
    }

}
