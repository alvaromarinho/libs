import { AfterViewInit, Component, signal } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns, SortDirection } from 'ng-generate-table';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'gt-simple-example',
    standalone: true,
    imports: [NgGenerateTableComponent, NgCollapseComponent],
    templateUrl: './simple.component.html'
})
export class GTSimpleExampleComponent implements AfterViewInit {

    toggleCode = signal(false);
    lastSort        = signal<string | null>(null);
    lastColumnClick = signal<string | null>(null);
    lastCellClick   = signal<string | null>(null);

    mobileView = window.innerWidth < 768;

    columns: NgGenerateTableColumns[] = [
        { label: 'Name',  field: 'name',  sortable: true },
        { label: 'Email', field: 'email' },
        { label: 'Data',  field: 'date' },
        {
            isAction: true,
            template: (row: any) => `<button class="btn btn-sm btn-success" type="button">Ver email de ${row.name}</button>`,
            click: (row: any) => this.lastColumnClick.set(row.email)
        }
    ];

    data = [
        { name: 'Álvaro',  email: 'alvaro@email.com',  date: '2023-08-23' },
        { name: 'Marinho', email: 'marinho@email.com', date: '2023-08-23' },
    ];

    ngAfterViewInit() {
        Prism.highlightAll();
    }

    sortData(sort: { field: string; direction: SortDirection }) {
        this.lastSort.set(sort.field + ' — ' + sort.direction);
        const sorted = [...this.data].sort((a: any, b: any) => {
            if (a[sort.field] < b[sort.field]) return sort.direction === 'ASC' ? -1 : 1;
            if (a[sort.field] > b[sort.field]) return sort.direction === 'ASC' ? 1 : -1;
            return 0;
        });
        this.data = sorted;
    }
}
