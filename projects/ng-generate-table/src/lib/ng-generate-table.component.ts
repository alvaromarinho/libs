import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef, ChangeDetectionStrategy, OnInit, Type, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    imports: [CommonModule, DynamicPipe, SafeHtmlPipe],
    templateUrl: './ng-generate-table.component.html',
    styleUrls: ['./ng-generate-table.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgGenerateTableComponent<T = any> implements OnInit {

    @Input() data: T[] = [];
    @Input() columns: NgGenerateTableColumns<T>[] = [];
    @Input() tableClass?: string;
    @Input() loading = false;
    @Input() mobileView = false;
    @Input() rowClickable = false;

    @Input() config: NgGenerateTextConfig = {
        emptyMessage: 'Nenhum dado encontrado',
        loadingMessage: 'Carregando...'
    };

    @Input() set emptyMessage(value: string) {
        this.config.emptyMessage = value;
    }

    @Input() set loadingMessage(value: string) {
        this.config.loadingMessage = value;
    }

    @Output() rowClick = new EventEmitter<{ row: T; event: Event }>();
    @Output() cellClick = new EventEmitter<{ row: T; column: NgGenerateTableColumns<T>; event: Event }>();
    @Output() sortChange = new EventEmitter<{ field: string; direction: SortDirection }>();

    @ContentChild('cardMobile', { static: false }) cardMobile?: TemplateRef<any>;

    private currentSort: { field: string; direction: SortDirection } | null = null;

    constructor(private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.validateInputs();
    }

    private validateInputs() {
        if (!this.columns || this.columns.length === 0) {
            console.warn('[ng-generate-table] Nenhuma coluna foi fornecida. O componente não será renderizado corretamente.');
        }
        this.columns.forEach((col, index) => {
            if (!col.field && !col.template && !col.isAction) {
                console.warn(`[ng-generate-table] Coluna ${index} não possui 'field' nem 'template'.`);
            }
            if (col.sortable && !col.field) {
                console.warn(`[ng-generate-table] Coluna ${index} é sortable mas não possui 'field'.`);
            }
        });
    }

    trackByIndex(index: number): number {
        return index;
    }

    trackByData(index: number, item: T): any {
        return (item as any)['id'] ?? index;
    }

    onRowClick(row: T, event: Event) {
        if (this.rowClickable) {
            this.rowClick.emit({ row, event });
        }
    }

    onCellClick(row: T, column: NgGenerateTableColumns<T>, event: Event) {
        if (column.click) {
            event.stopPropagation(); // Evita conflito com rowClick
            column.click(row, event);
        }
        this.cellClick.emit({ row, column, event });
    }

    getCellValue(row: T, column: NgGenerateTableColumns<T>): any {
        if (!column.field) return '---';
        const value = (row as any)[column.field];
        return value ?? '---';
    }

    get hasData(): boolean {
        return this.data && this.data.length > 0;
    }

    get emptyStateMessage(): string {
        return this.loading
            ? (this.config.loadingMessage || 'Carregando...')
            : (this.config.emptyMessage || 'Nenhum dado encontrado');
    }

    refresh() {
        this.cdr.markForCheck();
    }

    getColumnStyles(column: NgGenerateTableColumns<T>): Record<string, any> {
        const styles: Record<string, any> = {};

        if (column.width) {
            styles['width'] = column.width;
        }

        if (column.align) {
            styles['text-align'] = column.align;
        }

        return styles;
    }

    // Ciclo: ASC -> DESC -> null
    onSortClick(column: NgGenerateTableColumns<T>, event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        if (!column.sortable) return;

        if (!column.field) {
            console.warn('[ng-generate-table] Coluna sortable sem field definido');
            return;
        }

        let newDirection: SortDirection = null;

        // Se já está ordenando por esta coluna
        if (this.currentSort && this.currentSort.field === column.field) {
            newDirection =
                this.currentSort.direction === 'ASC' ? 'DESC' :
                this.currentSort.direction === 'DESC' ? null :
                'ASC';
        } else {
            newDirection = 'ASC';
        }

        if (newDirection === null) {
            this.currentSort = null;
        } else {
            this.currentSort = {
                field: column.field,
                direction: newDirection
            };
        }

        this.sortChange.emit({ field: column.field, direction: newDirection });
        this.cdr.markForCheck();
    }

    isSorted(column: NgGenerateTableColumns<T>): boolean {
        return this.getSortDirection(column) !== null;
    }

    getSortDirection(column: NgGenerateTableColumns<T>): SortDirection {
        return !this.currentSort || this.currentSort.field !== column.field ? null : this.currentSort.direction;
    }

}