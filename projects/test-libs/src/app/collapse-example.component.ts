import { AfterViewInit, Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'collapse-example',
    standalone: true,
    imports: [NgClass, NgCollapseComponent],
    template: `
        <div class="d-flex align-items-center border-bottom pb-1 mb-3">
            <h1 class="fs-3 fw-light me-3 mb-0">Collapse</h1>
            <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode.set(!toggleCode())">
                <i class="bi bi-code me-1"></i> CODE
            </button>
        </div>

        <ng-collapse [toggle]="toggleCode()">
            <div class="style-code rounded mb-3">
Template:
<pre><code class="language-html">&lt;button (click)="toggle.set(!toggle())"&gt;Collapse&lt;/button&gt;

&lt;ng-collapse [toggle]="toggle()" [transitionDuration]="500"&gt;
    &lt;div class="card card-body"&gt;...&lt;/div&gt;
&lt;/ng-collapse&gt;</code></pre>
            </div>
        </ng-collapse>

        <div class="d-flex align-items-center gap-3 mb-3">
            <button class="btn px-5" [ngClass]="toggle() ? 'btn-danger' : 'btn-primary'"
                (click)="toggle.set(!toggle())">
                {{ toggle() ? 'Hide Collapse' : 'Show Collapse' }}
            </button>

            <!-- demo do input transitionDuration -->
            <label class="small mb-0">Duração:</label>
            <select class="form-select form-select-sm w-auto"
                (change)="duration.set(+$any($event.target).value)">
                <option value="200">200ms</option>
                <option value="500" selected>500ms (padrão)</option>
                <option value="1000">1000ms</option>
                <option value="2000">2000ms</option>
            </select>
        </div>

        <ng-collapse [toggle]="toggle()" [transitionDuration]="duration()">
            <div class="card card-body mb-3">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Quasi expedita quisquam necessitatibus vitae maxime temporibus minima ex officia
                nostrum aspernatur deserunt dolorum quaerat sunt aliquam, repudiandae non in fugit! Tempore.
            </div>
        </ng-collapse>
    `
})
export class CollapseExampleComponent implements AfterViewInit {
    
    toggle = signal(false);
    toggleCode = signal(false);
    duration = signal(500);

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}