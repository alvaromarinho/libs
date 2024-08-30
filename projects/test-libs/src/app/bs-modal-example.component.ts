import { Component, TemplateRef } from '@angular/core';
import { NgBsModalService } from 'ng-bs-modal-service';

@Component({
    selector: 'bs-modal-example',
    styles: [`:host { --modal-image-height: 50vh; }`],
    template: `
            <div class="d-flex align-items-center border-bottom pb-1 mb-3">
                <h1 class="fs-3 fw-light me-3 mb-0">Bootstrap Modal</h1>
                <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode = !toggleCode">
                     <i class="bi bi-code me-1"></i> CODE
                </button>
            </div>

            <!-- code -->
            <ng-collapse [toggle]="toggleCode">
                <div class="style-code rounded mb-3">
Instalation (app.component.html):
<pre><code class="language-html">&lt;ng-bs-modal-service&gt;&lt;/ng-bs-modal-service&gt;</code></pre>
Typescript:
<pre><code class="language-js">constructor(private modalService: NgBsModalService) &#123; &#125;

showModal(modalBody: TemplateRef&lt;any&gt;) &#123;
    this.modalService.open(&#123;
        header: 'Modal',
        body: modalBody
    &#125;, &#123; 
        customClass: &#123; modalHeader: 'bg-danger text-white' &#125;
    &#125;)
&#125;</code></pre>
Template:
<pre><code class="language-html">&lt;button type="button" class="btn btn-primary px-5" (click)="showModal(modalBody)"&gt;Show Modal&lt;/button&gt;

&lt;ng-template #modalBody&gt;
    &lt;img src="https://placehold.co/800x400" alt="placeholder"&gt;
&lt;/ng-template&gt;</code></pre>
                </div>
            </ng-collapse>

            <!-- component -->
            <ng-bs-modal-service></ng-bs-modal-service>
            <div class="d-flex align-items-end justify-content-between">
                <button type="button" class="btn btn-success px-5" (click)="showPopover(modalBody, element)" #element>Show Modal like Popover</button>
                <button type="button" class="btn btn-primary px-5" (click)="showModal(modalBody)">Show Modal</button>
                <button type="button" class="btn btn-secondary px-5" (click)="showModalContent(modalContent)">Show Modal Content</button>
            </div>
            
            <div class="d-flex overflow-auto mt-4">
                <div [ngClass]="{'me-3': !last}" (click)="showModalImg(index)" *ngFor="let img of images; last as last; index as index">
                    <img class="rounded" [src]="img.url" [alt]="img.name" height="100" width="100">
                </div>
            </div>
            
            <ng-template #modalBody>
                <input type="text">
                <img src="https://placehold.co/766x400" alt="placeholder">
            </ng-template>

            <ng-template #modalContent>
                <div class="modal-header">Header</div>
                <div class="modal-body">Body</div>
                <div class="modal-footer">Footer</div>
            </ng-template>
    `
})

export class BsModalExampleComponent {

    toggleCode?: boolean;
    images = [
        { url: 'https://placehold.co/410x1210', name: 'Image 1' },
        { url: 'https://placehold.co/420x220', name: 'Image 2' },
        { url: 'https://placehold.co/830x830', name: 'Image 3' }
    ];

    constructor(private modalService: NgBsModalService) { }

    showModal(body: TemplateRef<any>) {
        this.modalService.open({ header: 'Modal', body });
    }

    showModalContent(content: TemplateRef<any>) {
        this.modalService.open(content);
    }

    showModalImg(index: number) {
        this.modalService.open(
            { header: 'Carousel' },
            { carousel: { index, images: this.images } }
        );
    }

    showPopover(body: TemplateRef<any>, element: HTMLElement) {
        this.modalService.open({ header: 'Modal', body }, {
            size: 'lg',
            popoverTo: element,
            customClass: { modalHeader: 'bg-danger text-white' }
        });
    }

}