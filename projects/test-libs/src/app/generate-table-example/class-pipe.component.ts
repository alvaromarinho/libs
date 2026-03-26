import { AfterViewInit, Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'gt-class-pipe-example',
    standalone: true,
    imports: [NgGenerateTableComponent, NgCollapseComponent],
    template: `
        <div class="d-flex align-items-center mb-2">
            <h1 class="fs-3 fw-light me-3 mb-0">Custom <code>class</code> / <code>pipes</code></h1>
            <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode.set(!toggleCode())">
                <i class="bi bi-code me-1"></i> CODE
            </button>
        </div>

        <ng-collapse [toggle]="toggleCode()">
            <div class="style-code rounded mb-3">
Typescript:
<pre><code class="language-js">columns: NgGenerateTableColumns[] = [
    &#123; label: 'Name',  field: 'name',  thClass: 'bg-secondary text-white', tdClass: 'text-danger' &#125;,
    &#123; label: 'Email', field: 'email', thClass: 'bg-secondary text-white', tdClass: 'text-success' &#125;,
    &#123; label: 'Data',  field: 'date',  pipe: DatePipe, thClass: 'bg-warning' &#125;,
    &#123; label: 'Data formatada', field: 'date', pipe: DatePipe, pipeArgs: ['dd MMM yyyy'], thClass: 'bg-warning' &#125;,
]</code></pre>
            </div>
        </ng-collapse>

        <div class="table-responsive">
            <ng-generate-table
                [mobileView]="mobileView"
                [columns]="columns"
                [data]="data"
                tableClass="table table-sm table-bordered mb-4">
            </ng-generate-table>
        </div>
    `
})
export class GTClassPipeExampleComponent implements AfterViewInit {

    toggleCode = signal(false);

    mobileView = window.innerWidth < 768;

    columns: NgGenerateTableColumns[] = [
        { label: 'Name',           field: 'name',  thClass: 'bg-secondary text-white', tdClass: 'text-danger' },
        { label: 'Email',          field: 'email', thClass: 'bg-secondary text-white', tdClass: 'text-success' },
        { label: 'Data',           field: 'date',  thClass: 'bg-warning', pipe: DatePipe },
        { label: 'Data formatada', field: 'date',  thClass: 'bg-warning', pipe: DatePipe, pipeArgs: ['dd MMM yyyy'] },
    ];

    data = [
        { name: 'Álvaro',  email: 'alvaro@email.com',  date: '2023-08-23' },
        { name: 'Marinho', email: 'marinho@email.com', date: '2023-08-23' },
    ];

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}