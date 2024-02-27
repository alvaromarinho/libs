import { Component } from '@angular/core';

@Component({
    selector: 'collapse-example',
    template: `
            <div class="d-flex align-items-center">
                <h1 class="fs-3 fw-light me-3">Drag and Drop File</h1>
                <button class="btn btn-sm btn-secondary py-0" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-code">
                     <i class="bi bi-code me-1"></i> CODE
                </button>
            </div>
            <div class="mb-3">
                <button class="btn px-5 mb-3" [ngClass]="toggle ? 'btn-danger' : 'btn-success'" (click)="toggle = !toggle">{{ toggle ? 'Hide Collapse' : 'Show Collapse' }}</button>
                <ng-collapse [toggle]="toggle">
                    <div class="card card-body">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                        Quasi expedita quisquam necessitatibus vitae maxime temporibus minima ex officia 
                        nostrum aspernatur deserunt dolorum quaerat sunt aliquam, repudiandae non in fugit! Tempore.
                    </div>
                </ng-collapse>
            </div>
            <div class="collapse" id="collapse-code">
                <div class="style-code rounded mb-3">
Template:
<pre><code class="language-html">&lt;button class="btn btn-success mb-3" (click)="toggle = !toggle"&gt;Collapse&lt;/button&gt;
&lt;ng-collapse &#91;toggle&#93;="toggle"&gt;
    &lt;div class="card card-body"&gt;
        Lorem ipsum dolor sit amet consectetur adipisicing elit. 
        Quasi expedita quisquam necessitatibus vitae maxime temporibus minima ex officia 
        nostrum aspernatur deserunt dolorum quaerat sunt aliquam, repudiandae non in fugit! Tempore.
    &lt;/div&gt;
&lt;/ng-collapse&gt;</code></pre>
                </div>
            </div>
    `
})

export class CollapseExampleComponent {

    toggle?: boolean;

}