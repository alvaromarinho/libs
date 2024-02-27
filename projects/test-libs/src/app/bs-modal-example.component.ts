import { Component, TemplateRef } from '@angular/core';
import { NgBsModalService } from 'ng-bs-modal-service';

@Component({
    selector: 'bs-modal-example',
    template: `
            <div class="d-flex align-items-center border-bottom pb-1 mb-3">
                <h1 class="fs-3 fw-light me-3 mb-0">Bootstrap Modal</h1>
                <button class="btn btn-sm btn-secondary py-0" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-code">
                     <i class="bi bi-code me-1"></i> CODE
                </button>
            </div>
            <div class="mb-3">
                <ng-bs-modal-service></ng-bs-modal-service>
                <button type="button" class="btn btn-primary px-5" (click)="showModal(modalBody)">Show Modal</button>
                <ng-template #modalBody>
                    <img src="https://placehold.co/800x400" alt="placeholder">
                </ng-template>
            </div>
            <div class="collapse" id="collapse-code">
                <div class="style-code rounded mb-3">
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
            </div>
    `
})

export class BsModalExampleComponent {

    constructor(private modalService: NgBsModalService) {}

    showModal(modalBody: TemplateRef<any>) {
        this.modalService.open({
            body: modalBody,
            header: 'Modal',
        }, { 
            size: 'lg',
            customClass: { modalHeader: 'bg-danger text-white' }
        })
    }

}