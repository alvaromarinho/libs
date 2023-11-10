import { Component } from '@angular/core';
import { NgGenerateTableColumns } from 'ng-generate-table';

@Component({
    selector: 'gt-manual-tags',
    template: `
        <div class="d-flex align-items-center">
            <h1 class="fs-3 fw-light me-3">Manual <code>&lt;thead&gt;</code>&nbsp;&nbsp;<code>&lt;tbody&gt;</code>&nbsp;&nbsp;<code>&lt;tfoot&gt;</code></h1>
            <button class="btn btn-sm btn-secondary py-0" type="button" data-bs-toggle="collapse" data-bs-target="#table-manual-code">
                    <i class="bi bi-code me-1"></i> CODE
            </button>
        </div>
        <div class="table-responsive">
            <ng-generate-table [columns]="columns" [data]="data" tableClass="table table-sm table-bordered mb-4">
                <thead position="top">
                    <tr><th colspan="6" class="fw-normal">custom top THEAD</th></tr>
                </thead>
                <thead position="bottom">
                    <tr><th colspan="6" class="fw-normal">custom bottom THEAD</th></tr>
                </thead>

                <tbody position="top">
                    <tr><td colspan="6">custom top TBODY</td></tr>
                </tbody>
                <tbody position="bottom">
                    <tr><td colspan="6">custom bottom TBODY</td></tr>
                </tbody>

                <tfoot>
                    <tr><td colspan="6">custom TFOOT</td></tr>
                </tfoot>
            </ng-generate-table>
        </div>
        <div class="collapse" id="table-manual-code">
            <div class="style-code rounded mb-3">
Typescript:
<pre><code class="language-js">columns: NgGenerateTableColumns[] = [
    &#123; label: 'Name', field: 'name' &#125;,
    &#123; label: 'Email', field: 'email' &#125;,
    &#123; label: 'Data', field: 'date' &#125;
]

data: CustomData = [
    &#123; name: 'Álvaro', email: 'alvaro&#64;email.com', date: '2023-08-23' &#125;,
    &#123; name: 'Marinho', email: 'marinho&#64;email.com', date: '2023-08-23' &#125;,
]</code></pre>
            </div>
            <div class="style-code rounded mb-3">
            Template:
<pre><code class="language-html">&lt;ng-generate-table [columns]="columns" [data]="data" tableClass="table table-sm table-bordered mb-4"&gt;
    &lt;thead position="top"&gt;
        &lt;tr&gt;&lt;th colspan="6" class="fw-normal"&gt;custom top THEAD&lt;/th&gt;&lt;/tr&gt;
    &lt;/thead&gt;
    &lt;thead position="bottom"&gt;
        &lt;tr&gt;&lt;th colspan="6" class="fw-normal"&gt;custom bottom THEAD&lt;/th&gt;&lt;/tr&gt;
    &lt;/thead&gt;

    &lt;tbody position="top"&gt;
        &lt;tr&gt;&lt;td colspan="6"&gt;custom top TBODY&lt;/td&gt;&lt;/tr&gt;
    &lt;/tbody&gt;
    &lt;tbody position="bottom"&gt;
        &lt;tr&gt;&lt;td colspan="6"&gt;custom bottom TBODY&lt;/td&gt;&lt;/tr&gt;
    &lt;/tbody&gt;

    &lt;tfoot&gt;
        &lt;tr&gt;&lt;td colspan="6"&gt;custom tfoot&lt;/td&gt;&lt;/tr&gt;
    &lt;/tfoot&gt;
&lt;/ng-generate-table&gt;</code></pre>
            </div>
        </div>
    `
})

export class GTManualTagsComponent {

    columns: NgGenerateTableColumns[] = [
        { label: 'Name', field: 'name' },
        { label: 'Email', field: 'email' },
        { label: 'Data', field: 'date' },
    ]

    data = [
        { name: 'Álvaro', email: 'alvaro@email.com', date: '2023-08-23' },
        { name: 'Marinho', email: 'marinho@email.com', date: '2023-08-23' },
    ]

}