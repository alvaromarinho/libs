import { AfterViewInit, Component, signal } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'gt-manual-tags',
    standalone: true,
    imports: [NgGenerateTableComponent, NgCollapseComponent],
    template: `
        <div class="d-flex align-items-center mb-2">
            <h1 class="fs-3 fw-light me-3 mb-0">Manual <code>&lt;thead&gt;</code>&nbsp;&nbsp;<code>&lt;tbody&gt;</code>&nbsp;&nbsp;<code>&lt;tfoot&gt;</code></h1>
            <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode.set(!toggleCode())">
                <i class="bi bi-code me-1"></i> CODE
            </button>
        </div>

        <ng-collapse [toggle]="toggleCode()">
            <div class="style-code rounded mb-3">
Template:
<pre><code class="language-html">&lt;ng-generate-table [columns]="columns" [data]="data" tableClass="table table-sm table-bordered"&gt;
    &lt;thead position="top"&gt;
        &lt;tr&gt;&lt;th colspan="4"&gt;custom top THEAD&lt;/th&gt;&lt;/tr&gt;
    &lt;/thead&gt;
    &lt;thead position="bottom"&gt;
        &lt;tr&gt;&lt;th colspan="4"&gt;custom bottom THEAD&lt;/th&gt;&lt;/tr&gt;
    &lt;/thead&gt;
    &lt;tbody position="top"&gt;
        &lt;tr&gt;&lt;td colspan="4"&gt;custom top TBODY&lt;/td&gt;&lt;/tr&gt;
    &lt;/tbody&gt;
    &lt;tbody position="bottom"&gt;
        &lt;tr&gt;&lt;td colspan="4"&gt;custom bottom TBODY&lt;/td&gt;&lt;/tr&gt;
    &lt;/tbody&gt;
    &lt;tfoot&gt;
        &lt;tr&gt;&lt;td colspan="4"&gt;custom TFOOT&lt;/td&gt;&lt;/tr&gt;
    &lt;/tfoot&gt;
&lt;/ng-generate-table&gt;</code></pre>
            </div>
        </ng-collapse>

        <div class="table-responsive">
            <ng-generate-table
                [mobileView]="mobileView"
                [columns]="columns"
                [data]="data"
                tableClass="table table-sm table-bordered mb-4">
                <thead position="top">
                    <tr><th colspan="4" class="fw-normal text-danger fst-italic">custom top THEAD</th></tr>
                </thead>
                <thead position="bottom">
                    <tr><th colspan="4" class="fw-normal text-danger fst-italic">custom bottom THEAD</th></tr>
                </thead>
                <tbody position="top">
                    <tr><td colspan="4" class="fw-normal text-danger fst-italic">custom top TBODY</td></tr>
                </tbody>
                <tbody position="bottom">
                    <tr><td colspan="4" class="fw-normal text-danger fst-italic">custom bottom TBODY</td></tr>
                </tbody>
                <tfoot>
                    <tr><td colspan="4" class="fw-normal text-danger fst-italic">custom TFOOT</td></tr>
                </tfoot>
            </ng-generate-table>
        </div>
    `
})
export class GTManualTagsComponent implements AfterViewInit {

    toggleCode = signal(false);

    mobileView = window.innerWidth < 768;

    columns: NgGenerateTableColumns[] = [
        { label: 'Name',  field: 'name' },
        { label: 'Email', field: 'email' },
        { label: 'Data',  field: 'date' },
    ];

    data = [
        { name: 'Álvaro',  email: 'alvaro@email.com',  date: '2023-08-23' },
        { name: 'Marinho', email: 'marinho@email.com', date: '2023-08-23' },
    ];

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}