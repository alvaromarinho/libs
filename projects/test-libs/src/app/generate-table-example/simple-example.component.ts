import { AfterViewInit, Component, signal } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns, SortDirection } from 'ng-generate-table';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'gt-simple-example',
    standalone: true,
    imports: [NgGenerateTableComponent, NgCollapseComponent],
    template: `
        <div class="d-flex align-items-center mb-2">
            <h1 class="fs-3 fw-light me-3 mb-0">Simple example</h1>
            <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode.set(!toggleCode())">
                <i class="bi bi-code me-1"></i> CODE
            </button>
        </div>

        <ng-collapse [toggle]="toggleCode()">
            <div class="style-code rounded mb-3">
Typescript:
<pre><code class="language-js">columns: NgGenerateTableColumns[] = [
    &#123; label: 'Name', field: 'name', sortable: true &#125;,
    &#123; label: 'Email', field: 'email' &#125;,
    &#123; label: 'Data', field: 'date' &#125;,
    &#123;
        isAction: true,
        template: (row) => '&lt;button class="btn btn-sm btn-success"&gt;Ver email&lt;/button&gt;',
        click: (row) => this.lastColumnClick.set(row.email)
    &#125;
]</code></pre>
            </div>
            <div class="style-code rounded mb-3">
Template:
<pre><code class="language-html">&lt;ng-generate-table
    [columns]="columns" [data]="data"
    (sortChange)="sortData($event)"
    (cellClick)="lastCellClick.set($event.row.name + ' — ' + $event.column.label)"
    tableClass="table table-sm table-bordered"&gt;
&lt;/ng-generate-table&gt;</code></pre>
            </div>
        </ng-collapse>

        @if (lastSort() && lastSort() !== 'name — null') {
            <div class="alert alert-info py-1 mb-2 small">
                <strong>sortChange:</strong> {{ lastSort() }}
            </div>
        }
        @if (lastColumnClick()) {
            <div class="alert alert-success py-1 mb-2 small">
                <strong>column.click (callback):</strong> {{ lastColumnClick() }}
            </div>
        }
        @if (lastCellClick()) {
            <div class="alert alert-warning py-1 mb-2 small">
                <strong>cellClick (output):</strong> {{ lastCellClick() }}
            </div>
        }

        <div class="table-responsive">
            <ng-generate-table
                [mobileView]="mobileView"
                [columns]="columns"
                [data]="data"
                tableClass="table table-sm table-bordered mb-4"
                (sortChange)="sortData($event)"
                (cellClick)="lastCellClick.set($event.row.name + ' — ' + $event.column.label)">
            </ng-generate-table>
        </div>
    `
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