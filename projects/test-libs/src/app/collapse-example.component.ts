import { Component } from '@angular/core';

@Component({
    selector: 'collapse-example',
    template: `
        <div class="d-flex align-items-center border-bottom pb-1 mb-3">
            <h1 class="fs-3 fw-light me-3 mb-0">Collapse</h1>
            <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode = !toggleCode">
                    <i class="bi bi-code me-1"></i> CODE
            </button>
        </div>
        <button class="btn px-5 mb-3" [ngClass]="toggle ? 'btn-danger' : 'btn-primary'" (click)="toggle = !toggle">
            {{ toggle ? 'Hide Collapse' : 'Show Collapse' }}
        </button>
        <ng-collapse [toggle]="toggle">
            <div class="card card-body mb-3">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                Quasi expedita quisquam necessitatibus vitae maxime temporibus minima ex officia 
                nostrum aspernatur deserunt dolorum quaerat sunt aliquam, repudiandae non in fugit! Tempore.
            </div>
        </ng-collapse>

        <!-- code -->
        <ng-collapse [toggle]="toggleCode">
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
        </ng-collapse>
    `
})

export class CollapseExampleComponent {

    toggle?: boolean;
    toggleCode?: boolean;

}