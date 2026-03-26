import { AfterViewInit, Component, signal } from '@angular/core';
import { NgDdFileComponent } from 'ng-dd-file';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'dd-file-example',
    standalone: true,
    imports: [NgDdFileComponent, NgCollapseComponent],
    template: `
        <div class="d-flex align-items-center mb-2">
            <h1 class="fs-3 fw-light me-3 mb-0">Drag and Drop File</h1>
            <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode.set(!toggleCode())">
                <i class="bi bi-code me-1"></i> CODE
            </button>
        </div>

        <ng-collapse [toggle]="toggleCode()">
            <div class="style-code rounded mb-3">
Typescript:
<pre><code class="language-js">files = signal&lt;File[]&gt;([]);

onFilesAdd(newFiles: File[]) &#123;
    this.files.update(existing => [...existing, ...newFiles]);
&#125;</code></pre>
            </div>
            <div class="style-code rounded mb-3">
Template:
<pre><code class="language-html">&lt;ng-dd-file
    [btnClass]="&#123; file: 'btn btn-primary', remove: 'btn btn-sm btn-danger' &#125;"
    [filesList]="files()"
    [maxFiles]="3"
    [maxFileSize]="200"
    [maxTotalSize]="300"
    (fileError)="lastError.set($event.message)"
    (fileRemove)="files.set([])"
    (filesAdd)="onFilesAdd($event)"
/&gt;</code></pre>
            </div>
        </ng-collapse>

        @if (files().length) {
            <div class="alert alert-success py-1 mt-2 small">
                <strong>{{ files().length }} arquivo(s) adicionado(s):</strong>
                @for (f of files(); track f.name) {
                    <span class="badge bg-secondary ms-1">{{ f.name }}</span>
                }
            </div>
        }
        @if (lastError()) {
            <div class="alert alert-danger py-1 mt-2 small">
                <strong>Erro:</strong> {{ lastError() }}
            </div>
        }

        <ng-dd-file
            [btnClass]="{ file: 'btn btn-primary', remove: 'btn btn-sm btn-danger' }"
            [filesList]="files()"
            [labels]="{ text: 'Arraste e solte os arquivos', btn: 'SELECIONE O ARQUIVO' }"
            [maxFiles]="3"
            [maxFileSize]="200"
            [maxTotalSize]="300"
            typeFileAccept="*"
            (fileError)="lastError.set($event.message)"
            (fileRemove)="onFilesRemove($event)"
            (filesAdd)="onFilesAdd($event)">
        </ng-dd-file>
    `
})
export class DdFileExampleComponent implements AfterViewInit {

    toggleCode = signal(false);
    files = signal<any[]>([]);
    lastError = signal<string | null>(null);

    ngAfterViewInit() {
        Prism.highlightAll();
    }

    onFilesAdd(newFiles: any[]) {
        this.lastError.set(null);
        this.files.update(existing => [...existing, ...newFiles]);
    }

    onFilesRemove(fileRemoved: { file: any; index: number; }) {
        this.lastError.set(null);
        this.files.update(existing => existing.filter((_, i) => i !== fileRemoved.index));
    }
}