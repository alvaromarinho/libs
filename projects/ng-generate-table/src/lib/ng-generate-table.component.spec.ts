import { Component } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgGenerateTableComponent, NgGenerateTableColumns } from './ng-generate-table.component';

interface Row { id: number; name: string; }

const DATA: Row[] = [
  { id: 1, name: 'Ana' },
  { id: 2, name: 'Bia' },
];

const COLUMNS: NgGenerateTableColumns<Row>[] = [
  { label: 'ID', field: 'id', sortable: true },
  { label: 'Nome', field: 'name' },
];

describe('NgGenerateTableComponent', () => {
  let component: NgGenerateTableComponent<Row>;
  let fixture: ComponentFixture<NgGenerateTableComponent<Row>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NgGenerateTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgGenerateTableComponent<Row>);
    component = fixture.componentInstance;
    component.columns = COLUMNS;
    component.data = DATA;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('renders headers and cell values', () => {
      const el = fixture.nativeElement;
      const headers = Array.from(el.querySelectorAll('th')).map((th: any) => th.textContent.trim());
      expect(headers).toContain('ID');
      expect(headers).toContain('Nome');
      expect(el.textContent).toContain('Ana');
      expect(el.textContent).toContain('Bia');
    });

    it('shows the empty message when there is no data', () => {
      fixture.componentRef.setInput('data', []);
      fixture.detectChanges();
      expect(component.hasData).toBe(false);
      expect(fixture.nativeElement.textContent).toContain('Nenhum dado encontrado');
    });

    it('shows the loading message while loading', () => {
      fixture.componentRef.setInput('data', []);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Carregando...');
    });

    it('emptyMessage/loadingMessage setters override config', () => {
      component.emptyMessage = 'vazio';
      expect(component.config.emptyMessage).toBe('vazio');
      component.loadingMessage = 'aguarde';
      expect(component.config.loadingMessage).toBe('aguarde');
      component.loading = true;
      expect(component.emptyStateMessage).toBe('aguarde');
    });
  });

  describe('cell values', () => {
    it('getCellValue reads the field and returns null for missing values', () => {
      expect(component.getCellValue(DATA[0], COLUMNS[1])).toBe('Ana');
      expect(component.getCellValue(DATA[0], { label: 'x' })).toBeNull();
      expect(component.getCellValue({ id: 3, name: undefined as any }, COLUMNS[1])).toBeNull();
    });

    it('applies a pipe declared in the column config', () => {
      fixture.componentRef.setInput('columns', [{ label: 'Nome', field: 'name', pipe: UpperCasePipe }]);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('ANA');
    });

    it('renders a template column as HTML', () => {
      fixture.componentRef.setInput('columns', [{ label: 'T', template: (row: Row) => `<b class="tpl">${row.name}</b>` }]);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('b.tpl')?.textContent).toBe('Ana');
    });
  });

  describe('sorting', () => {
    const sortable = COLUMNS[0];
    const click = () => {
      const event = new Event('click');
      component.onSortClick(sortable, event);
      return event;
    };

    it('cycles ASC -> DESC -> null emitting sortChange', () => {
      const emitted: any[] = [];
      component.sortChange.subscribe(e => emitted.push(e));

      click();
      click();
      click();

      expect(emitted).toEqual([
        { field: 'id', direction: 'ASC' },
        { field: 'id', direction: 'DESC' },
        { field: 'id', direction: null },
      ]);
    });

    it('switching column restarts at ASC', () => {
      const other: NgGenerateTableColumns<Row> = { label: 'Nome', field: 'name', sortable: true };
      const emitted: any[] = [];
      component.sortChange.subscribe(e => emitted.push(e));

      component.onSortClick(sortable, new Event('click'));
      component.onSortClick(other, new Event('click'));

      expect(emitted[1]).toEqual({ field: 'name', direction: 'ASC' });
      expect(component.getSortDirection(other)).toBe('ASC');
      expect(component.getSortDirection(sortable)).toBeNull();
    });

    it('ignores non-sortable columns', () => {
      let count = 0;
      component.sortChange.subscribe(() => count++);
      component.onSortClick(COLUMNS[1], new Event('click'));
      expect(count).toBe(0);
    });

    it('isSorted reflects the current sort', () => {
      expect(component.isSorted(sortable)).toBe(false);
      click();
      expect(component.isSorted(sortable)).toBe(true);
    });
  });

  describe('row and cell clicks', () => {
    it('rowClick emits only when rowClickable', () => {
      let emitted: any = null;
      component.rowClick.subscribe(e => emitted = e);

      component.onRowClick(DATA[0], new Event('click'));
      expect(emitted).toBeNull();

      component.rowClickable = true;
      component.onRowClick(DATA[0], new Event('click'));
      expect(emitted.row).toBe(DATA[0]);
    });

    it('cellClick emits and stops propagation', () => {
      let emitted: any = null;
      component.cellClick.subscribe(e => emitted = e);
      let stopped = false;
      const event = { stopPropagation: () => stopped = true } as unknown as Event;

      component.onCellClick(DATA[0], COLUMNS[0], event);

      expect(emitted.column).toBe(COLUMNS[0]);
      expect(stopped).toBe(true);
    });

    it('onColumnClick invokes the column click handler', () => {
      let clickedRow: Row | null = null;
      const column: NgGenerateTableColumns<Row> = { label: 'a', click: (row) => clickedRow = row };

      component.onColumnClick(DATA[1], column, new Event('click'));

      expect(clickedRow!).toBe(DATA[1]);
    });
  });

  describe('expand/collapse', () => {
    it('trackByData uses id when present, index otherwise', () => {
      expect(component.trackByData(0, DATA[0])).toBe(1);
      expect(component.trackByData(4, { name: 'x' } as any)).toBe(4);
    });

    it('toggleRowExpand emits a new Set with the row key toggled', () => {
      let emitted: Set<any> | null = null;
      component.expandedRowsChange.subscribe(s => emitted = s);

      component.toggleRowExpand(DATA[0], 0, new Event('click'));
      expect(Array.from(emitted!)).toEqual([1]);

      // consumidor aplica o novo Set; o componente não muta o input
      expect(component.expandedRows.size).toBe(0);

      component.expandedRows = emitted!;
      component.toggleRowExpand(DATA[0], 0, new Event('click'));
      expect(Array.from(emitted!)).toEqual([]);
    });

    it('isRowExpanded reflects the expandedRows input', () => {
      component.expandedRows = new Set([1]);
      expect(component.isRowExpanded(DATA[0], 0)).toBe(true);
      expect(component.isRowExpanded(DATA[1], 1)).toBe(false);
    });

    it('canExpandRow requires a rowDetail template and honors expandableRow', () => {
      expect(component.canExpandRow(DATA[0], 0)).toBe(false); // sem #rowDetail

      component.rowDetail = {} as any;
      expect(component.canExpandRow(DATA[0], 0)).toBe(true);

      component.expandableRow = (row) => row.id !== 1;
      expect(component.canExpandRow(DATA[0], 0)).toBe(false);
      expect(component.canExpandRow(DATA[1], 1)).toBe(true);
    });
  });

  describe('getColumnStyles', () => {
    it('maps width and align', () => {
      expect(component.getColumnStyles({ width: '10%', align: 'right' }))
        .toEqual({ 'width': '10%', 'text-align': 'right' });
      expect(component.getColumnStyles({})).toEqual({});
    });
  });
});

@Component({
  standalone: true,
  imports: [NgGenerateTableComponent],
  template: `
    <ng-generate-table [data]="data" [columns]="columns" [expandedRows]="expanded">
      <ng-template #rowDetail let-row>detalhe de {{ row.name }}</ng-template>
    </ng-generate-table>
  `
})
class HostWithDetail {
  data: Row[] = DATA;
  columns = COLUMNS;
  expanded = new Set<any>([1]);
}

describe('NgGenerateTableComponent with #rowDetail', () => {
  it('renders the projected detail template for expandable rows', async () => {
    await TestBed.configureTestingModule({ imports: [HostWithDetail] }).compileComponents();
    const fixture = TestBed.createComponent(HostWithDetail);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('detalhe de Ana');
    expect(text).toContain('detalhe de Bia');
    expect(fixture.nativeElement.querySelector('.nggt-show')).toBeTruthy(); // linha 1 expandida
  });
});
