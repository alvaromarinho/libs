import { AfterViewInit, Component, signal } from '@angular/core';
import { NgDdFileComponent } from 'ng-dd-file';
import { NgCollapseComponent } from 'ng-collapse';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';

declare const Prism: any;

@Component({
    selector: 'dd-file-example',
    standalone: true,
    imports: [NgDdFileComponent, NgCollapseComponent, PageHeaderComponent],
    templateUrl: './ng-dd-file.component.html'
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
