import { AfterViewInit, Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'gt-expandable-rows-example',
    standalone: true,
    imports: [NgGenerateTableComponent, NgCollapseComponent],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './expandable-rows.component.html'
})
export class GTExpandableRowsExampleComponent implements AfterViewInit {

    toggleCode = signal(false);

    orders = [
        { id: 1, customer: 'Álvaro',   total: 'R$ 150,00', address: 'Rua A, 123 — São Paulo/SP',     items: ['Teclado', 'Mouse'] },
        { id: 2, customer: 'Marinho',  total: 'R$ 89,90',  address: 'Rua B, 456 — Rio de Janeiro/RJ', items: ['Monitor'] },
        { id: 3, customer: 'Fernanda', total: 'R$ 320,00', address: 'Rua C, 789 — Belo Horizonte/MG', items: ['Notebook', 'Mochila', 'Mouse'] },
    ];

    // Pedido do Marinho já começa expandido
    expandedRows = new Set<any>([this.orders.find(o => o.customer === 'Marinho')?.id]);

    detailRowSnippet = `&lt;ng-generate-table
    [columns]="columns" [data]="orders"
    [(expandedRows)]="expandedRows"&gt;

    &lt;ng-template #rowDetail let-order&gt;
        &lt;p&gt;&lt;strong&gt;Endereço:&lt;/strong&gt; {{ order.address }}&lt;/p&gt;
        &lt;p&gt;&lt;strong&gt;Itens:&lt;/strong&gt; {{ order.items.join(', ') }}&lt;/p&gt;
    &lt;/ng-template&gt;
&lt;/ng-generate-table&gt;`;

    detailColumns: NgGenerateTableColumns[] = [
        { label: 'Cliente', field: 'customer' },
        { label: 'Total', field: 'total' },
    ];

    expandableRow = (order: any) => order.customer === 'Marinho' || order.customer === 'Álvaro';

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}
