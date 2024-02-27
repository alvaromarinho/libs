import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { NgGenerateTableColumns } from 'ng-generate-table';

@Component({
    selector: 'gt-class-pipe-example',
    template: `
            <div class="d-flex align-items-center mb-2">
                <h1 class="fs-3 fw-light me-3 mb-0">Custom <code>class</code>/<code>pipes</code></h1>
                <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode = !toggleCode">
                     <i class="bi bi-code me-1"></i> CODE
                </button>
            </div>
            
            <!-- code -->
            <ng-collapse [toggle]="toggleCode">
                <div class="style-code rounded mb-3">
Typescript:
<pre><code class="language-js">columns: NgGenerateTableColumns[] = [
    &#123; label: 'Name', field: 'name', thClass: 'bg-secondary text-white', tdClass: 'text-danger' &#125;,
    &#123; label: 'Email', field: 'email', thClass: 'bg-secondary text-white', tdClass: 'text-success' &#125;,
    &#123; field: 'date', pipe: DatePipe, thClass: 'bg-warning' &#125;,
    &#123; field: 'date', pipe: DatePipe, thClass: 'bg-warning', pipeArgs: ['dd MMM yyyy'] &#125;
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
            </ng-collapse>

            <!-- component -->
            <div class="table-responsive">
                <ng-generate-table [columns]="columns" [data]="data" tableClass="table table-sm table-bordered mb-4"></ng-generate-table>
            </div>
    `
})

export class GTClassPipeExampleComponent {

    toggleCode?: boolean;

    columns: NgGenerateTableColumns[] = [
        { label: 'Name', field: 'name', thClass: 'bg-secondary text-white', tdClass: 'text-danger' },
        { label: 'Email', field: 'email', thClass: 'bg-secondary text-white', tdClass: 'text-success' },
        { field: 'date', pipe: DatePipe, thClass: 'bg-warning' },
        { field: 'date', pipe: DatePipe, thClass: 'bg-warning', pipeArgs: ['dd MMM yyyy'] },
    ]

    data = [
        { name: 'Álvaro', email: 'alvaro@email.com', date: '2023-08-23' },
        { name: 'Marinho', email: 'marinho@email.com', date: '2023-08-23' },
    ]

}