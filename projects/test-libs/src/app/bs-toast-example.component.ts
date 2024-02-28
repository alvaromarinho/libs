import { Component, TemplateRef } from '@angular/core';
import { NgBsModalService } from 'ng-bs-modal-service';
import { NgBsToastService, NgBsToastServiceComponent } from 'ng-bs-toast-service';

@Component({
    selector: 'bs-toast-example',
    template: `
            <div class="d-flex align-items-center border-bottom pb-1 mb-3">
                <h1 class="fs-3 fw-light me-3 mb-0">Bootstrap Toast</h1>
                <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode = !toggleCode">
                     <i class="bi bi-code me-1"></i> CODE
                </button>
            </div>

            <!-- code -->
            <ng-collapse [toggle]="toggleCode">
                <div class="style-code rounded mb-3">
Instalation (app.component.html):
<pre><code class="language-html">&lt;ng-bs-toast-service&gt;&lt;/ng-bs-toast-service&gt;</code></pre>
Typescript:
<pre><code class="language-js">constructor(private toastService: NgBsToastService) &#123; &#125;

showToast() &#123;
    this.toastService.send('Titulo 1', 'Message 1', 'primary');
&#125;</code></pre>

Template:
<pre><code class="language-html">&lt;button type="button" class="btn btn-primary px-5" (click)="showToast()"&gt;Show Toast&lt;/button&gt;</code></pre>
                </div>
            </ng-collapse>

            <!-- component -->
            <ng-bs-toast-service></ng-bs-toast-service>
            <button type="button" class="btn btn-primary px-5" (click)="showToast()">Show Toast</button>
    `
})

export class BsToastExampleComponent {

    toggleCode?: boolean;

    constructor(private toastService: NgBsToastService) {}

    showToast() {
        this.toastService.send('Titulo 1', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla convallis, justo a ullamcorper aliquet, nunc nunc tincidunt nunc, nec tincidunt nunc nunc nec nunc.', 'primary');
        setTimeout(() => this.toastService.send('Titulo 2', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla convallis, justo a ullamcorper aliquet, nunc nunc tincidunt nunc, nec tincidunt nunc nunc nec nunc.', 'success'), 1000);
        setTimeout(() => this.toastService.send('Titulo 3', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla convallis, justo a ullamcorper aliquet, nunc nunc tincidunt nunc, nec tincidunt nunc nunc nec nunc.', 'warning'), 2000);
        setTimeout(() => this.toastService.send('Titulo 4', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla convallis, justo a ullamcorper aliquet, nunc nunc tincidunt nunc, nec tincidunt nunc nunc nec nunc.', 'danger'), 3000);
    }

}