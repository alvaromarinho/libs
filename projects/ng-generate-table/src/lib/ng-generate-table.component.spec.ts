import { Component, signal, viewChild } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { NgGenerateTableColumns, NgGenerateTableComponent, NgGenerateTextConfig, SortDirection } from './ng-generate-table.component';

interface Row {
    id?: number;
    name: string;
}

const DATA: Row[] = [
    { id: 1, name: 'Ana' },
    { id: 2, name: 'Bia' },
];

const COLUMNS: NgGenerateTableColumns<Row>[] = [
    { label: 'ID', field: 'id', sortable: true },
    { label: 'Nome', field: 'name', sortable: true },
];

@Component({
    standalone: true,
    imports: [NgGenerateTableComponent],
    template: `
        <ng-generate-table [data]="data()" [columns]="columns()" [loading]="loading()" [mobileView]="mobile()"
            [rowClickable]="rowClickable()" [tableClass]="tableClass()" [config]="config()" [emptyMessage]="emptyMessage()"
            [(expandedRows)]="expanded" [expandableRow]="expandableRow()"
            (rowClick)="rowClicks.push($event.row)" (cellClick)="cellClicks.push($event.column.field)"
            (sortChange)="sorts.push($event)">
            @if (withDetail()) {
                <ng-template #rowDetail let-row>
                    <span class="detail">detalhe {{ row.name }}</span>
                </ng-template>
            }
        </ng-generate-table>
    `
})
class HostComponent {

    readonly table = viewChild.required(NgGenerateTableComponent);
    readonly data = signal<Row[]>(DATA);
    readonly columns = signal<NgGenerateTableColumns<Row>[]>(COLUMNS);
    readonly loading = signal(false);
    readonly mobile = signal(false);
    readonly rowClickable = signal(false);
    readonly tableClass = signal<string | undefined>(undefined);
    readonly config = signal<NgGenerateTextConfig>({});
    readonly emptyMessage = signal<string | undefined>(undefined);
    readonly expandableRow = signal<((row: Row, index: number) => boolean) | undefined>(undefined);
    readonly withDetail = signal(false);
    expanded = new Set<unknown>();
    readonly rowClicks: Row[] = [];
    readonly cellClicks: (string | undefined)[] = [];
    readonly sorts: { field: string, direction: SortDirection }[] = [];

}

@Component({
    standalone: true,
    imports: [NgGenerateTableComponent],
    template: `
        <ng-generate-table [data]="data" [columns]="columns" [mobileView]="true">
            <ng-template #cardMobile let-row let-index="index">
                <div class="custom-card">{{ index }}: {{ row.name }}</div>
            </ng-template>
        </ng-generate-table>
    `
})
class CardHostComponent {

    readonly data = DATA;
    readonly columns = COLUMNS;

}

describe('NgGenerateTableComponent', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    const el = (): HTMLElement => fixture.nativeElement;
    const headers = (): HTMLElement[] => Array.from(el().querySelectorAll<HTMLElement>('th'));
    const rows = (): HTMLElement[] => Array.from(el().querySelectorAll<HTMLElement>('tbody tr:not(.nggt-row-detail)'));
    const cells = (row: number): string[] => Array.from(rows()[row].querySelectorAll('td')).map(td => td.textContent!.trim());
    const set = async (fn: () => void): Promise<void> => {
        fn();
        await fixture.whenStable();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HostComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        await fixture.whenStable();
    });

    describe('rendering', () => {
        it('renders headers and cell values', () => {
            expect(headers().map(th => th.textContent!.trim())).toEqual(['ID', 'Nome']);
            expect(cells(0)).toEqual(['1', 'Ana']);
            expect(cells(1)).toEqual(['2', 'Bia']);
        });

        it('shows --- for missing values', async () => {
            await set(() => host.data.set([{ name: '' }, { id: 3, name: null as unknown as string }]));
            expect(cells(1)).toEqual(['3', '---']);
        });

        it('re-renders when the data input changes', async () => {
            await set(() => host.data.set([...DATA, { id: 3, name: 'Cid' }]));
            expect(rows().length).toBe(3);
        });

        it('refresh() re-renders after data was mutated in place', async () => {
            DATA.push({ id: 3, name: 'Cid' });
            try {
                host.table().refresh();
                await fixture.whenStable();
                expect(rows().length).toBe(3);
            } finally {
                DATA.pop();
            }
        });

        it('refresh() shows rows pushed in place into an initially empty array, and the empty state after clearing it', async () => {
            const list: Row[] = [];
            await set(() => host.data.set(list));
            expect(el().querySelector('.nggt-empty-cell')).toBeTruthy();

            list.push(...DATA);
            host.table().refresh();
            await fixture.whenStable();
            expect(rows().length).toBe(2);

            list.length = 0;
            host.table().refresh();
            await fixture.whenStable();
            expect(el().querySelector('.nggt-empty-cell')).toBeTruthy();
        });

        it('applies tableClass, thClass and tdClass in every accepted shape', async () => {
            await set(() => {
                host.tableClass.set('table table-sm');
                host.columns.set([
                    { label: 'ID', field: 'id', thClass: 'text-end', tdClass: ['a', 'b'], width: '10%', align: 'right' },
                    { label: 'Nome', field: 'name', thClass: { 'th-x': true, 'th-y': false }, tdClass: { 'td-x': true } },
                ]);
            });

            const table = el().querySelector('table')!;
            expect(table.classList).toContain('nggt');
            expect(table.classList).toContain('table-sm');
            expect(headers()[0].classList).toContain('text-end');
            expect(headers()[1].classList).toContain('th-x');
            expect(headers()[1].classList).not.toContain('th-y');
            expect(headers()[1].className).not.toContain('[object Object]');
            const td = rows()[0].querySelectorAll('td');
            expect(td[0].classList).toContain('a');
            expect(td[0].classList).toContain('b');
            expect(td[1].classList).toContain('td-x');
            expect(headers()[0].style.width).toBe('10%');
            expect(td[0].style.textAlign).toBe('right');
        });

        it('applies a pipe declared in the column config', async () => {
            await set(() => host.columns.set([{ label: 'Nome', field: 'name', pipe: UpperCasePipe }]));
            expect(cells(0)).toEqual(['ANA']);
        });

        it('renders a template column as HTML', async () => {
            await set(() => host.columns.set([{ label: 'Nome', template: row => `<b>${row.name}</b>` }]));
            expect(rows()[0].querySelector('b')?.textContent).toBe('Ana');
        });
    });

    describe('empty and loading states', () => {
        it('shows the default empty message spanning all columns', async () => {
            await set(() => host.data.set([]));
            const td = el().querySelector<HTMLTableCellElement>('.nggt-empty-cell')!;
            expect(td.textContent!.trim()).toBe('Nenhum dado encontrado');
            expect(td.getAttribute('colspan')).toBe('2');
        });

        it('shows the loading message and spinner while loading', async () => {
            await set(() => {
                host.data.set([]);
                host.loading.set(true);
            });
            expect(el().querySelector('.nggt-empty-message')!.textContent).toBe('Carregando...');
            expect(el().querySelector('.nggt-table-wrapper')!.classList).toContain('nggt-table-loading');
            expect(el().querySelector('.table-spinner')).toBeTruthy();
        });

        it('uses config messages, and emptyMessage wins over config without mutating it', async () => {
            const config: NgGenerateTextConfig = { emptyMessage: 'Vazio (config)', loadingMessage: 'Buscando...' };
            await set(() => {
                host.data.set([]);
                host.config.set(config);
            });
            expect(el().querySelector('.nggt-empty-message')!.textContent).toBe('Vazio (config)');

            await set(() => host.emptyMessage.set('Nada aqui'));
            expect(el().querySelector('.nggt-empty-message')!.textContent).toBe('Nada aqui');
            expect(config.emptyMessage).toBe('Vazio (config)');

            await set(() => host.loading.set(true));
            expect(el().querySelector('.nggt-empty-message')!.textContent).toBe('Buscando...');
        });
    });

    describe('sorting', () => {
        const clickHeader = async (index: number): Promise<void> => {
            headers()[index].querySelector<HTMLElement>('.nggt-th-content')!.click();
            await fixture.whenStable();
        };

        it('cycles ASC -> DESC -> null emitting sortChange and updating the icon', async () => {
            await clickHeader(0);
            expect(headers()[0].querySelector('.nggt-icon-sort-asc')).toBeTruthy();
            expect(headers()[0].classList).toContain('nggt-th-sorted');

            await clickHeader(0);
            expect(headers()[0].querySelector('.nggt-icon-sort-desc')).toBeTruthy();

            await clickHeader(0);
            expect(headers()[0].querySelector('.nggt-icon-sort-default')).toBeTruthy();
            expect(headers()[0].classList).not.toContain('nggt-th-sorted');

            expect(host.sorts).toEqual([
                { field: 'id', direction: 'ASC' },
                { field: 'id', direction: 'DESC' },
                { field: 'id', direction: null },
            ]);
        });

        it('switching column restarts at ASC', async () => {
            await clickHeader(0);
            await clickHeader(1);
            expect(host.sorts.at(-1)).toEqual({ field: 'name', direction: 'ASC' });
            expect(headers()[0].classList).not.toContain('nggt-th-sorted');
        });

        it('sorts from the keyboard', async () => {
            headers()[0].querySelector('.nggt-th-content')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            await fixture.whenStable();
            expect(host.sorts).toEqual([{ field: 'id', direction: 'ASC' }]);
        });

        it('ignores non-sortable columns', async () => {
            await set(() => host.columns.set([{ label: 'Nome', field: 'name' }]));
            expect(headers()[0].getAttribute('tabindex')).toBeNull();
            expect(headers()[0].classList).not.toContain('nggt-th-sortable');
            await clickHeader(0);
            expect(host.sorts).toEqual([]);
        });

        it('warns and does not emit for a sortable column without field', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
            await set(() => host.columns.set([{ label: 'X', sortable: true, template: () => 'x' }]));
            await clickHeader(0);
            expect(host.sorts).toEqual([]);
            expect(warn).toHaveBeenCalled();
            warn.mockRestore();
        });
    });

    describe('row and cell clicks', () => {
        it('emits cellClick when rows are not clickable, and no rowClick', () => {
            rows()[0].querySelectorAll<HTMLElement>('td')[1].click();
            expect(host.cellClicks).toEqual(['name']);
            expect(host.rowClicks).toEqual([]);
        });

        it('emits rowClick (mouse and keyboard) when rowClickable, and no cellClick', async () => {
            await set(() => host.rowClickable.set(true));
            expect(rows()[1].getAttribute('role')).toBe('button');
            expect(rows()[1].getAttribute('tabindex')).toBe('0');

            rows()[1].querySelector<HTMLElement>('td')!.click();
            rows()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

            expect(host.rowClicks.map(r => r.name)).toEqual(['Bia', 'Ana']);
            expect(host.cellClicks).toEqual([]);
        });

        it('calls the column click handler of a template column', async () => {
            const clicked: string[] = [];
            await set(() => host.columns.set([{ label: 'Ação', template: () => 'ver', click: row => clicked.push(row.name) }]));

            const cell = rows()[0].querySelector<HTMLElement>('.nggt-template-cell')!;
            expect(cell.classList).toContain('nggt-clickable');
            cell.click();

            expect(clicked).toEqual(['Ana']);
            expect(host.cellClicks).toEqual([]);
        });
    });

    describe('expand/collapse', () => {
        const toggles = (): HTMLButtonElement[] => Array.from(el().querySelectorAll<HTMLButtonElement>('button.nggt-expand-toggle'));
        const shown = (): string[] => Array.from(el().querySelectorAll('.nggt-detail-content.nggt-show .detail')).map(d => d.textContent!.trim());

        it('has no toggle without a #rowDetail template', () => {
            expect(toggles().length).toBe(0);
        });

        it('toggles rows through [(expandedRows)] keyed by id', async () => {
            await set(() => host.withDetail.set(true));
            expect(toggles().length).toBe(2);

            toggles()[1].click();
            await fixture.whenStable();
            expect([...host.expanded]).toEqual([2]);
            expect(shown()).toEqual(['detalhe Bia']);
            expect(toggles()[1].getAttribute('aria-expanded')).toBe('true');

            const before = host.expanded;
            toggles()[1].click();
            await fixture.whenStable();
            expect(host.expanded).not.toBe(before);
            expect([...host.expanded]).toEqual([]);
            expect(shown()).toEqual([]);
        });

        it('keys rows without id by index', async () => {
            await set(() => {
                host.withDetail.set(true);
                host.data.set([{ name: 'Sem id' }]);
            });
            toggles()[0].click();
            await fixture.whenStable();
            expect([...host.expanded]).toEqual([0]);
        });

        it('honors expandableRow, leaving a spacer on rows that cannot expand', async () => {
            await set(() => {
                host.withDetail.set(true);
                host.expandableRow.set(row => row.id === 1);
            });
            expect(toggles().length).toBe(1);
            expect(el().querySelectorAll('.nggt-expand-spacer').length).toBe(1);
        });
    });

    describe('mobile view', () => {
        it('renders one card per row with labels and values', async () => {
            await set(() => host.mobile.set(true));

            const cards = Array.from(el().querySelectorAll('.nggt-card'));
            expect(cards.length).toBe(2);
            expect(cards[0].textContent).toContain('Nome');
            expect(cards[0].textContent).toContain('Ana');
            expect(el().querySelector('table')).toBeNull();
        });

        it('renders the column template as trusted HTML, like the desktop table', async () => {
            const template = (row: { name: string }): string => `<span data-bs-toggle="tooltip" title="t">${row.name}</span>`;
            await set(() => host.columns.set([{ label: 'Nome', template }]));
            const desktop = el().querySelector('td .nggt-template-cell')!.innerHTML;

            await set(() => host.mobile.set(true));
            const mobile = el().querySelector('.nggt-card .nggt-template-cell')!.innerHTML;

            expect(mobile).toBe(desktop);
            expect(mobile).toContain('data-bs-toggle="tooltip"');
        });

        it('shows the empty state', async () => {
            await set(() => {
                host.mobile.set(true);
                host.data.set([]);
            });
            expect(el().querySelector('.nggt-mobile-container .nggt-empty-message')!.textContent).toBe('Nenhum dado encontrado');
        });

        it('expands a card', async () => {
            await set(() => {
                host.mobile.set(true);
                host.withDetail.set(true);
            });
            el().querySelector<HTMLButtonElement>('.nggt-card-expand-toggle')!.click();
            await fixture.whenStable();
            expect([...host.expanded]).toEqual([1]);
            expect(el().querySelector('.nggt-detail-content.nggt-show .detail')!.textContent).toContain('Ana');
        });

        it('uses a projected #cardMobile template', async () => {
            const card = TestBed.createComponent(CardHostComponent);
            await card.whenStable();
            const custom = Array.from(card.nativeElement.querySelectorAll('.custom-card')).map(c => (c as HTMLElement).textContent!.trim());
            expect(custom).toEqual(['0: Ana', '1: Bia']);
        });
    });

    it('warns at init about columns without field or template', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const bad = TestBed.createComponent(NgGenerateTableComponent);
        bad.componentRef.setInput('columns', [{ label: 'x' }]);
        await bad.whenStable();
        expect(warn.mock.calls.some(([message]) => String(message).includes('Coluna 0'))).toBe(true);
        warn.mockRestore();
    });
});
