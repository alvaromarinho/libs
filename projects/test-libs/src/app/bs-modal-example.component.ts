import { AfterViewInit, Component, inject, signal, TemplateRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgBsModalService } from 'ng-bs-modal-service';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'bs-modal-example',
    standalone: true,
    imports: [NgClass, NgCollapseComponent],
    styles: [`:host { --modal-image-height: 50vh; }`],
    template: `
        <div class="d-flex align-items-center border-bottom pb-1 mb-3">
            <h1 class="fs-3 fw-light me-3 mb-0">Bootstrap Modal</h1>
            <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode.set(!toggleCode())">
                <i class="bi bi-code me-1"></i> CODE
            </button>
        </div>

        <ng-collapse [toggle]="toggleCode()">
            <div class="style-code rounded mb-3">
Instalação (app.component.html):
<pre><code class="language-html">&lt;ng-bs-modal-service /&gt;</code></pre>
Typescript:
<pre><code class="language-js">modalService = inject(NgBsModalService);

showModal(body: TemplateRef&lt;any&gt;) &#123;
    this.modalService.open(&#123; header: 'Modal', body &#125;);
&#125;</code></pre>
Template:
<pre><code class="language-html">&lt;button (click)="showModal(modalBody)"&gt;Show Modal&lt;/button&gt;

&lt;ng-template #modalBody&gt;
    &lt;img src="https://placehold.co/766x400" alt="placeholder"&gt;
&lt;/ng-template&gt;</code></pre>
            </div>
        </ng-collapse>

        @if (lastAction()) {
            <div class="alert alert-info py-1 mb-3 small">
                <strong>Último aberto:</strong> {{ lastAction() }}
            </div>
        }

        <div class="d-flex flex-wrap gap-2 mb-3">
            <button class="btn btn-success px-5" (click)="showPopover(modalBody, el)" #el>Popover</button>
            <button class="btn btn-primary px-5" (click)="openQueueModal(modalBody)">Modal A</button>
            <button class="btn btn-secondary px-5" (click)="showModalContent(modalContent)">Modal Content</button>
        </div>

        <div class="d-flex overflow-auto mb-4">
            @for (img of images; track img.url; let last = $last; let i = $index) {
                <div [ngClass]="{'me-3': !last}" style="cursor:pointer" (click)="showModalImg(i)">
                    <img class="rounded" [src]="img.url" [alt]="img.name" height="100" width="100">
                </div>
            }
        </div>

        <!-- Queue behavior -->
        <div class="border-top pt-3">
            <h2 class="fs-5 fw-light mb-1">Queue behavior</h2>
            <p class="text-muted small mb-2">
                Abra o <strong>Modal A</strong> e abra o <strong>Modal B</strong>.
                O B sobrepõe o A. Ao fechar o B, o A reaparece automaticamente.
            </p>
        </div>

        <ng-template #modalBody>
            <button class="btn btn-outline-secondary" (click)="openQueueModal()">Abrir Modal B (sobre A)</button>
            <input type="text" class="form-control mb-2">
            <img src="https://placehold.co/766x400" alt="placeholder">
        </ng-template>

        <ng-template #modalContent>
            <div class="modal-header">Header</div>
            <div class="modal-body">Body</div>
            <div class="modal-footer">Footer</div>
        </ng-template>
    `
})
export class BsModalExampleComponent implements AfterViewInit {

    private modalService = inject(NgBsModalService);

    toggleCode = signal(false);
    lastAction = signal<string | null>(null);

    images = [
        { url: 'https://placehold.co/410x1210', name: 'Image 1' },
        { url: 'https://placehold.co/420x220', name: 'Image 2' },
        { url: 'https://placehold.co/830x830', name: 'Image 3' },
    ];

    ngAfterViewInit() {
        Prism.highlightAll();
    }

    showModalContent(content: TemplateRef<any>) {
        this.lastAction.set('Modal com ng-template completo');
        this.modalService.open(content);
    }

    showModalImg(index: number) {
        this.lastAction.set(`Carousel — imagem ${index + 1}`);
        this.modalService.open({ header: 'Carousel' }, { carousel: { index, images: this.images } });
    }

    showPopover(body: TemplateRef<any>, element: HTMLElement) {
        this.lastAction.set('Popover modal');
        this.modalService.open({ header: 'Modal', body }, {
            size: 'lg',
            popoverTo: element,
            customClass: { modalHeader: 'bg-danger text-white' }
        });
    }

    openQueueModal(body?: TemplateRef<any>) {
        this.lastAction.set(`Queue Modal`);
        this.modalService.open({
            header: body ? 'Modal' : 'Queue Modal',
            body: body ?? 'Este é um modal de exemplo para demonstrar o comportamento de fila.'
        });
    }
}