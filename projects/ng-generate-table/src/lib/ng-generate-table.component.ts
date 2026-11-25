import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, PipeTransform, TemplateRef, Type, computed, contentChild, inject, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DynamicPipe } from './dynamic.pipe';
import { SafeHtmlPipe } from './safeHtml.pipe';

export type SortDirection = 'ASC' | 'DESC' | null;

export interface NgGenerateTableColumns<T = any> {
    label?: string;
    field?: keyof T & string;

    thClass?: string | string[] | Record<string, boolean>;
    tdClass?: string | string[] | Record<string, boolean>;

    pipe?: Type<PipeTransform>;
    pipeArgs?: any[];

    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
    isAction?: boolean;

    template?: (row: T) => string;
    click?: (row: T, event: Event) => void;
}

export interface NgGenerateTextConfig {
    emptyMessage?: string;
    loadingMessage?: string;
}

@Component({
    selector: 'ng-generate-table',
    standalone: true,
    imports: [NgTemplateOutlet, DynamicPipe, SafeHtmlPipe],
    templateUrl: './ng-generate-table.component.html',
    styleUrls: ['./ng-generate-table.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgGenerateTableComponent<T = any> implements OnInit {

    readonly data = input<T[]>([]);
    readonly columns = input<NgGenerateTableColumns<T>[]>([]);
    readonly tableClass = input<string>();
    readonly loading = input(false);
    readonly mobileView = input(false);
    readonly rowClickable = input(false);

    /** Keys (row.id ?? index) of rows currently expanded. Controlled by the consumer. */
    readonly expandedRows = input(new Set<any>());

    /** Optional: decides whether a given row can be expanded. If omitted, all rows are expandable. */
    readonly expandableRow = input<(row: T, index: number) => boolean>();

    readonly config = input<NgGenerateTextConfig>({});
    /** Shortcut for `config.emptyMessage`; wins over it when both are set. */
    readonly emptyMessage = input<string>();
    /** Shortcut for `config.loadingMessage`; wins over it when both are set. */
    readonly loadingMessage = input<string>();

    readonly rowClick = output<{ row: T, event: Event }>();
    readonly cellClick = output<{ row: T, column: NgGenerateTableColumns<T>, event: Event }>();
    readonly sortChange = output<{ field: string, direction: SortDirection }>();
    readonly expandedRowsChange = output<Set<any>>();

    protected readonly cardMobile = contentChild<TemplateRef<unknown>>('cardMobile');
    protected readonly rowDetail = contentChild<TemplateRef<unknown>>('rowDetail');

    // Not a computed: refresh() after an in-place mutation must see the new length.
    protected hasData(): boolean {
        return this.data()?.length > 0;
    }

    protected readonly emptyStateMessage = computed(() => this.loading()
        ? (this.loadingMessage() || this.config().loadingMessage || 'Carregando...')
        : (this.emptyMessage() || this.config().emptyMessage || 'Nenhum dado encontrado'));

    private readonly currentSort = signal<{ field: string, direction: SortDirection } | null>(null);
    private readonly cdr = inject(ChangeDetectorRef);

    ngOnInit(): void {
        this.validateInputs();
    }

    /** Re-renders after the consumer mutated `data` in place (prefer passing a new array). */
    refresh(): void {
        this.cdr.markForCheck();
    }

    protected trackByData(index: number, item: T): unknown {
        return (item as { id?: unknown })['id'] ?? index;
    }

    protected isRowExpanded(row: T, index: number): boolean {
        return this.expandedRows().has(this.trackByData(index, row));
    }

    protected canExpandRow(row: T, index: number): boolean {
        const expandableRow = this.expandableRow();
        return !!this.rowDetail() && (!expandableRow || expandableRow(row, index));
    }

    protected toggleRowExpand(row: T, index: number, event: Event): void {
        event.stopPropagation();

        const key = this.trackByData(index, row);
        const expandedRows = new Set(this.expandedRows());
        if (expandedRows.has(key)) {
            expandedRows.delete(key);
        } else {
            expandedRows.add(key);
        }

        this.expandedRowsChange.emit(expandedRows);
    }

    protected onRowClick(row: T, event: Event): void {
        if (this.rowClickable()) {
            this.rowClick.emit({ row, event });
        }
    }

    protected onCellClick(row: T, column: NgGenerateTableColumns<T>, event: Event): void {
        event.stopPropagation(); // Avoids also firing rowClick.
        this.cellClick.emit({ row, column, event });
    }

    protected onColumnClick(row: T, column: NgGenerateTableColumns<T>, event: Event): void {
        if (column.click) {
            event.stopPropagation(); // Avoids also firing rowClick.
            column.click(row, event);
        }
    }

    protected getCellValue(row: T, column: NgGenerateTableColumns<T>): unknown {
        if (!column.field) return null;
        return row[column.field] ?? null;
    }

    protected getColumnStyles(column: NgGenerateTableColumns<T>): Record<string, string> {
        const styles: Record<string, string> = {};
        if (column.width) styles['width'] = column.width;
        if (column.align) styles['text-align'] = column.align;
        return styles;
    }

    // Cycle: ASC -> DESC -> null
    protected onSortClick(column: NgGenerateTableColumns<T>, event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        if (!column.sortable) return;

        if (!column.field) {
            console.warn('[ng-generate-table] Coluna sortable sem field definido');
            return;
        }

        const current = this.getSortDirection(column);
        const direction: SortDirection = current === 'ASC' ? 'DESC' : current === 'DESC' ? null : 'ASC';

        this.currentSort.set(direction ? { field: column.field, direction } : null);
        this.sortChange.emit({ field: column.field, direction });
    }

    protected isSorted(column: NgGenerateTableColumns<T>): boolean {
        return this.getSortDirection(column) !== null;
    }

    protected getSortDirection(column: NgGenerateTableColumns<T>): SortDirection {
        const sort = this.currentSort();
        return !sort || sort.field !== column.field ? null : sort.direction;
    }

    private validateInputs(): void {
        const columns = this.columns();
        if (!columns || columns.length === 0) {
            console.warn('[ng-generate-table] Nenhuma coluna foi fornecida. O componente não será renderizado corretamente.');
        }
        columns.forEach((col, index) => {
            if (!col.field && !col.template && !col.isAction) {
                console.warn(`[ng-generate-table] Coluna ${index} não possui 'field' nem 'template'.`);
            }
            if (col.sortable && !col.field) {
                console.warn(`[ng-generate-table] Coluna ${index} é sortable mas não possui 'field'.`);
            }
        });
    }

}
