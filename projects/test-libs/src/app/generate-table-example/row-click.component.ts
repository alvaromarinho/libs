import { Component } from '@angular/core';
import { NgGenerateTableColumns } from 'ng-generate-table';

@Component({
    selector: 'gt-row-click-example',
    template: `
            <div class="d-flex align-items-center mb-2">
                <h1 class="fs-3 fw-light me-3 mb-0">Row Click</h1>
                <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode = !toggleCode">
                     <i class="bi bi-code me-1"></i> CODE
                </button>
            </div>

            <!-- code -->
            <ng-collapse [toggle]="toggleCode">
                <div class="style-code rounded mb-3">
Typescript:
<pre><code class="language-js">columns: NgGenerateTableColumns[] = [
    &#123; label: 'Name', field: 'name' &#125;,
    &#123; label: 'Email', field: 'email' &#125;,
    &#123; label: 'Data', field: 'date' &#125;
]

data: CustomData = [
    &#123; name: 'Álvaro', email: 'alvaro&#64;email.com', date: '2023-08-23' &#125;,
    &#123; name: 'Marinho', email: 'marinho&#64;email.com', date: '2023-08-23' &#125;,
]

rowClick(rowData : any) &#123;
    alert(rowData.email)
&#125;</code></pre>
                </div>
                <div class="style-code rounded mb-3">
Template:
<pre><code class="language-html">&lt;ng-generate-table [columns]="columns" [data]="data" [rowClickable]="true" (rowClick)="rowClick($event)" tableClass="table table-sm table-bordered mb-4 table-hover"&gt;&lt;/ng-generate-table&gt;</code></pre>
                </div>
            </ng-collapse>

            <!-- component -->
            <div class="table-responsive">
                <ng-generate-table [columns]="columns" [data]="data" [rowClickable]="true" (rowClick)="rowClick($event)" tableClass="table table-sm table-bordered mb-4 table-hover"></ng-generate-table>
            </div>
    `
})

export class GTRowClickExampleComponent {

    toggleCode?: boolean;

    columns: NgGenerateTableColumns[] = [
        { label: 'Name', field: 'name' },
        { label: 'Email', field: 'email' },
        { label: 'Data', field: 'date' },
    ]

    data = [
        { name: 'Álvaro', email: 'alvaro@email.com', date: '2023-08-23' },
        { name: 'Marinho', email: 'marinho@email.com', date: '2023-08-23' },
    ]

    rowClick(rowData : any) {
        alert(rowData.email)
    }

}