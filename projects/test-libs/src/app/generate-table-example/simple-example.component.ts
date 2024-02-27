import { Component } from '@angular/core';
import { NgGenerateTableColumns } from 'ng-generate-table';

@Component({
    selector: 'gt-simple-example',
    template: `
            <div class="d-flex align-items-center mb-2">
                <h1 class="fs-3 fw-light me-3 mb-0">Simple example</h1>
                <button class="btn btn-sm btn-secondary py-0" type="button" data-bs-toggle="collapse" data-bs-target="#table-simple-code">
                     <i class="bi bi-code me-1"></i> CODE
                </button>
            </div>
            <div class="table-responsive">
                <ng-generate-table [columns]="columns" [data]="data" tableClass="table table-sm table-bordered mb-4"></ng-generate-table>
            </div>
            
            <div class="collapse" id="table-simple-code">
                <div class="style-code rounded mb-3">
Typescript:
<pre><code class="language-js">columns: NgGenerateTableColumns[] = [
    &#123; label: 'Name', field: 'name' &#125;,
    &#123; label: 'Email', field: 'email' &#125;,
    &#123; label: 'Data', field: 'date' &#125;,
    &#123;
        template: (rowData: any) => '&lt;button class="btn btn-sm btn-success" type="button"&gt;Click to show $&#123;rowData.name&#125;'s email&lt;/button&gt;'',
        click: (rowData: any) => alert(rowData.email)
    &#125;
]

data: CustomData = [
    &#123; name: 'Álvaro', email: 'alvaro&#64;email.com', date: '2023-08-23' &#125;,
    &#123; name: 'Marinho', email: 'marinho&#64;email.com', date: '2023-08-23' &#125;,
]</code></pre>
                </div>
                <div class="style-code rounded mb-3">
Template:
<pre><code class="language-html">&lt;ng-generate-table [columns]="columns" [data]="data" tableClass="table table-sm table-bordered mb-4"&gt;&lt;/ng-generate-table&gt;</code></pre>
                </div>
            </div>
    `
})

export class GTSimpleExampleComponent {

    columns: NgGenerateTableColumns[] = [
        { label: 'Name', field: 'name' },
        { label: 'Email', field: 'email' },
        { label: 'Data', field: 'date' },
        {
            template: (rowData: any) => `<button class="btn btn-sm btn-success" type="button">Click to show ${rowData.name}'s email</button>`,
            click: (rowData: any) => alert(rowData.email)
        }
    ]

    data = [
        { name: 'Álvaro', email: 'alvaro@email.com', date: '2023-08-23' },
        { name: 'Marinho', email: 'marinho@email.com', date: '2023-08-23' },
    ]

}