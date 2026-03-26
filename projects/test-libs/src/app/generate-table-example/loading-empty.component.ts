import { AfterViewInit, Component, signal } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'gt-loading-empty-example',
    standalone: true,
    imports: [NgGenerateTableComponent, NgCollapseComponent],
    template: `
        <div class="d-flex align-items-center mb-2">
            <h1 class="fs-3 fw-light me-3 mb-0">Loading / Empty State</h1>
            <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode.set(!toggleCode())">
                <i class="bi bi-code me-1"></i> CODE
            </button>
        </div>

        <ng-collapse [toggle]="toggleCode()">
            <div class="style-code rounded mb-3">
Typescript:
<pre><code class="language-js">loading = signal(false);
hasData = signal(true);</code></pre>
            </div>
            <div class="style-code rounded mb-3">
Template:
<pre><code class="language-html">&lt;ng-generate-table
    [columns]="columns"
    [data]="hasData() ? data : []"
    [loading]="loading()"
    [config]="&#123; emptyMessage: 'Nenhum registro encontrado.', loadingMessage: 'Aguarde...' &#125;"
    tableClass="table table-sm table-bordered"&gt;
&lt;/ng-generate-table&gt;</code></pre>
            </div>
        </ng-collapse>

        <div class="d-flex gap-2 mb-3">
            <button class="btn btn-outline-primary" (click)="loading.set(!loading())">
                {{ loading() ? 'Parar loading' : 'Simular loading' }}
            </button>
            <button class="btn btn-outline-secondary" (click)="hasData.update(v => !v)">
                {{ hasData() ? 'Limpar dados (empty state)' : 'Restaurar dados' }}
            </button>
        </div>

        <div class="table-responsive">
            <ng-generate-table
                [mobileView]="mobileView"
                [columns]="columns"
                [data]="hasData() ? data : []"
                [loading]="loading()"
                [config]="{ emptyMessage: 'Nenhum registro encontrado.', loadingMessage: 'Aguarde...' }"
                tableClass="table table-sm table-bordered mb-4">
            </ng-generate-table>
        </div>
    `
})
export class GTLoadingEmptyExampleComponent implements AfterViewInit {

    toggleCode = signal(false);
    loading = signal(false);
    hasData = signal(true);

    mobileView = window.innerWidth < 768;

    columns: NgGenerateTableColumns[] = [
        { label: 'Name',  field: 'name' },
        { label: 'Email', field: 'email' },
        { label: 'Data',  field: 'date' },
    ];

    data = [
        { name: 'Álvaro',  email: 'alvaro@email.com',  date: '2024-01-15' },
        { name: 'Marinho', email: 'marinho@email.com', date: '2024-03-22' },
    ];

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}