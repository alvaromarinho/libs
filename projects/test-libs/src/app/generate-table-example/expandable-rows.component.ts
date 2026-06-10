import { AfterViewInit, Component, signal } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'gt-expandable-rows-example',
    standalone: true,
    imports: [NgGenerateTableComponent, NgCollapseComponent],
    template: `
        <div class="d-flex align-items-center mb-2">
            <h1 class="fs-3 fw-light me-3 mb-0">Expandable Rows</h1>
            <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode.set(!toggleCode())">
                <i class="bi bi-code me-1"></i> CODE
            </button>
        </div>
        <p class="text-muted small mb-3">
            Coluna com <code>isExpand: true</code> renderiza um botão de toggle. O estado fica em <code>expandedRows</code>,
            controlado pelo consumidor via <code>[(expandedRows)]</code>. Ao expandir, o conteúdo do <code>#rowDetail</code>
            aparece abaixo da linha.
        </p>

        <ng-collapse [toggle]="toggleCode()">
            <div class="style-code rounded mb-3">
Typescript:
<pre><code class="language-js">columns: NgGenerateTableColumns[] = [
    &#123; isExpand: true &#125;,
    &#123; label: 'Cliente', field: 'customer' &#125;,
    &#123; label: 'Total', field: 'total' &#125;,
];

expandedRows = new Set&lt;any&gt;();</code></pre>
            </div>
            <div class="style-code rounded mb-3">
Template:
<pre><code class="language-html" [innerHTML]="detailRowSnippet"></code></pre>
            </div>
        </ng-collapse>

        <div class="table-responsive">
            <ng-generate-table
                [columns]="detailColumns"
                [data]="orders"
                [(expandedRows)]="expandedRows"
                tableClass="table table-sm table-bordered">

                <ng-template #rowDetail let-order>
                    <p class="mb-1"><strong>Endereço:</strong> {{ order.address }}</p>
                    <p class="mb-0"><strong>Itens:</strong> {{ order.items.join(', ') }}</p>
                </ng-template>
            </ng-generate-table>
        </div>
    `
})
export class GTExpandableRowsExampleComponent implements AfterViewInit {

    toggleCode = signal(false);

    expandedRows = new Set<any>();

    detailRowSnippet = `&lt;ng-generate-table
    [columns]="columns" [data]="orders"
    [(expandedRows)]="expandedRows"&gt;

    &lt;ng-template #rowDetail let-order&gt;
        &lt;p&gt;&lt;strong&gt;Endereço:&lt;/strong&gt; {{ order.address }}&lt;/p&gt;
        &lt;p&gt;&lt;strong&gt;Itens:&lt;/strong&gt; {{ order.items.join(', ') }}&lt;/p&gt;
    &lt;/ng-template&gt;
&lt;/ng-generate-table&gt;`;

    detailColumns: NgGenerateTableColumns[] = [
        { isExpand: true },
        { label: 'Cliente', field: 'customer' },
        { label: 'Total', field: 'total' },
    ];

    orders = [
        { id: 1, customer: 'Álvaro',   total: 'R$ 150,00', address: 'Rua A, 123 — São Paulo/SP',     items: ['Teclado', 'Mouse'] },
        { id: 2, customer: 'Marinho',  total: 'R$ 89,90',  address: 'Rua B, 456 — Rio de Janeiro/RJ', items: ['Monitor'] },
        { id: 3, customer: 'Fernanda', total: 'R$ 320,00', address: 'Rua C, 789 — Belo Horizonte/MG', items: ['Notebook', 'Mochila', 'Mouse'] },
    ];

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}
