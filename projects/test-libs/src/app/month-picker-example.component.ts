import { AfterViewInit, Component, signal } from '@angular/core';
import { NgMonthPickerComponent } from 'ng-month-picker';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'month-picker-example',
    standalone: true,
    imports: [NgMonthPickerComponent, NgCollapseComponent],
    template: `
        <div class="d-flex align-items-center border-bottom pb-1 mb-3">
            <h1 class="fs-3 fw-light me-3 mb-0">Month Picker</h1>
            <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode.set(!toggleCode())">
                <i class="bi bi-code me-1"></i> CODE
            </button>
        </div>

        <ng-collapse [toggle]="toggleCode()">
            <div class="style-code rounded mb-3">
Template:
<pre><code class="language-html">&lt;ng-month-picker [value]="month()" (valueChange)="month.set($event)"&gt;&lt;/ng-month-picker&gt;</code></pre>
            </div>
        </ng-collapse>

        <div class="row">
            <div class="col-12 col-sm-4 col-md-3">
                <ng-month-picker [value]="month()" (valueChange)="month.set($event)"></ng-month-picker>
            </div>
        </div>

        <div class="alert alert-info py-1 mt-3 small">
            Valor selecionado: <strong>{{ month() }}</strong>
        </div>
    `
})
export class MonthPickerExampleComponent implements AfterViewInit {

    toggleCode = signal(false);
    month = signal(new Date().toISOString().slice(0, 7));

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}
