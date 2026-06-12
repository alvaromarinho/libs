import { AfterViewInit, Component, signal } from '@angular/core';
import { NgBsPaginationComponent } from 'ng-bs-pagination';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'bs-pagination-example',
    standalone: true,
    imports: [NgBsPaginationComponent, NgCollapseComponent],
    template: `
        <div class="d-flex align-items-center border-bottom pb-1 mb-3">
            <h1 class="fs-3 fw-light me-3 mb-0">Pagination</h1>
            <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode.set(!toggleCode())">
                <i class="bi bi-code me-1"></i> CODE
            </button>
        </div>

        <ng-collapse [toggle]="toggleCode()">
            <div class="style-code rounded mb-3">
Template:
<pre><code class="language-html">&lt;ng-bs-pagination
    [total]="124" [current]="current()" [itemPerPage]="10"
    (change)="current.set($event)" (first)="current.set($event)" (last)="current.set($event)"&gt;
&lt;/ng-bs-pagination&gt;</code></pre>
            </div>
        </ng-collapse>

        <h2 class="fs-5 fw-light mt-4">Padrão (layout stacked, info abaixo)</h2>
        <ng-bs-pagination
            [total]="124" [current]="current1()" [itemPerPage]="10"
            (change)="current1.set($event)" (first)="current1.set($event)" (last)="current1.set($event)">
        </ng-bs-pagination>

        <h2 class="fs-5 fw-light mt-4">Empilhado (info abaixo)</h2>
        <ng-bs-pagination
            [total]="124" [current]="current4()" [itemPerPage]="10"
            [layout]="{ type: 'stacked', infoPosition: 'end' }"
            (change)="current4.set($event)" (first)="current4.set($event)" (last)="current4.set($event)">
        </ng-bs-pagination>

        <h2 class="fs-5 fw-light mt-4">Split (info à direita)</h2>
        <ng-bs-pagination
            [total]="124" [current]="current2()" [itemPerPage]="10"
            [layout]="{ type: 'split', infoPosition: 'end' }"
            (change)="current2.set($event)" (first)="current2.set($event)" (last)="current2.set($event)">
        </ng-bs-pagination>

        <h2 class="fs-5 fw-light mt-4">Split (info à esquerda)</h2>
        <ng-bs-pagination
            [total]="124" [current]="current2()" [itemPerPage]="10"
            [layout]="{ type: 'split', infoPosition: 'start' }"
            (change)="current2.set($event)" (first)="current2.set($event)" (last)="current2.set($event)">
        </ng-bs-pagination>

        <h2 class="fs-5 fw-light mt-4">Centralizado (info à esquerda)</h2>
        <ng-bs-pagination
            [total]="124" [current]="current3()" [itemPerPage]="10"
            [layout]="{ type: 'center' }"
            (change)="current3.set($event)" (first)="current3.set($event)" (last)="current3.set($event)">
        </ng-bs-pagination>

        <h2 class="fs-5 fw-light mt-4">Centralizado (info à direita)</h2>
        <ng-bs-pagination
            [total]="124" [current]="current3()" [itemPerPage]="10"
            [layout]="{ type: 'center', infoPosition: 'end' }"
            (change)="current3.set($event)" (first)="current3.set($event)" (last)="current3.set($event)">
        </ng-bs-pagination>

        <h2 class="fs-5 fw-light mt-4">Sem primeira/última, navegação em texto, tamanho pequeno</h2>
        <ng-bs-pagination
            [total]="124" [current]="current5()" [itemPerPage]="10" size="sm"
            [firstLast]="{ show: false }"
            [prevNext]="{ mode: 'text', labels: { prev: 'Anterior', next: 'Próxima' } }"
            (change)="current5.set($event)" (first)="current5.set($event)" (last)="current5.set($event)">
        </ng-bs-pagination>

        <h2 class="fs-5 fw-light mt-4">Tamanho grande, primeira/última em texto</h2>
        <ng-bs-pagination
            [total]="124" [current]="current6()" [itemPerPage]="10" size="lg"
            [firstLast]="{ mode: 'text', labels: { first: 'Início', last: 'Fim' } }"
            (change)="current6.set($event)" (first)="current6.set($event)" (last)="current6.set($event)">
        </ng-bs-pagination>

        <h2 class="fs-5 fw-light mt-4">Info customizada (ng-content)</h2>
        <ng-bs-pagination
            [total]="124" [current]="current7()" [itemPerPage]="10"
            (change)="current7.set($event)" (first)="current7.set($event)" (last)="current7.set($event)">
            <ng-template let-start="start" let-end="end" let-total="total">
                Exibindo registros <strong>{{ start }}</strong> a <strong>{{ end }}</strong> de <strong>{{ total }}</strong>
            </ng-template>
        </ng-bs-pagination>
    `
})
export class BsPaginationExampleComponent implements AfterViewInit {

    toggleCode = signal(false);

    current1 = signal(1);
    current2 = signal(1);
    current3 = signal(1);
    current4 = signal(1);
    current5 = signal(1);
    current6 = signal(1);
    current7 = signal(1);

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}
