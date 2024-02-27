import { Component } from '@angular/core';

@Component({
    selector: 'dd-file-example',
    template: `
            <div class="d-flex align-items-center mb-2">
                <h1 class="fs-3 fw-light me-3 mb-0">Drag and Drop File</h1>
                <button class="btn btn-sm btn-secondary py-0" type="button" data-bs-toggle="collapse" data-bs-target="#dd-code">
                     <i class="bi bi-code me-1"></i> CODE
                </button>
            </div>
            <div class="mb-3">
                <ng-dd-file 
                    [btnClass]="{ file: 'btn btn-primary', remove: 'btn btn-sm btn-danger' }"
                    [filesList]="files" 
                    [labels]="{ text: 'Arraste e solte os arquivos', btn: 'SELECIONE O ARQUIVO' }"
                    [maxFiles]="3"
                    [maxFileSize]="200"
                    [maxTotalSize]="300"
                    typeFileAccept="*"
    
                    (fileError)="error($event)"
                    (fileRemove)="files = []" 
                    (filesAdd)="filesAdd($event)" 
                ></ng-dd-file>
            </div>
            <div class="collapse" id="dd-code">
                <div class="style-code rounded mb-3">
Typescript:
<pre><code class="language-js">files?: any[]

filesAdd($event: any) &#123;
    this.files = this.files ? [...this.files, ...$event] : $event
&#125;

error($event: string) &#123;
    alert($event)
&#125;</code></pre>
                </div>
                <div class="style-code rounded mb-3">
Template:
<pre><code class="language-html">&lt;ng-dd-file 
    &#91;btnClass&#93;="&#123; file: 'btn btn-primary', remove: 'btn btn-sm btn-danger' &#125;"
    &#91;filesList&#93;="files" 
    &#91;labels&#93;="&#123; text: 'Arraste e solte os arquivos', btn: 'SELECIONE O ARQUIVO' &#125;"
    &#91;maxFiles&#93;="3"
    &#91;maxFileSize&#93;="200"
    &#91;maxTotalSize&#93;="300"
    typeFileAccept="*"

    &#40;fileError&#41;="error&#40;$event&#41;"
    &#40;fileRemove&#41;="files = &#91;&#93;"
    &#40;filesAdd&#41;="filesAdd&#40;$event&#41;"
&gt;&lt;/ng-dd-file&gt;</code></pre>
                </div>
            </div>
    `
})

export class DdFileExampleComponent {

    files?: any[]

    filesAdd($event: any) {
        this.files = this.files ? [...this.files, ...$event] : $event
    }

    error($event: string) {
        alert($event)
    }

}