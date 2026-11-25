import { Directive, output, signal } from '@angular/core';

@Directive({
    selector: '[ddFile]',
    standalone: true,
    host: {
        '[class.fileover]': 'fileOver()',
        '(dragover)': 'onDragOver($event)',
        '(dragleave)': 'onDragLeave($event)',
        '(drop)': 'onDrop($event)',
    },
})
export class NgDdFileDirective {

    readonly droppedFile = output<FileList>();

    protected readonly fileOver = signal(false);

    protected onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.fileOver.set(true);
    }

    protected onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.fileOver.set(false);
    }

    protected onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.fileOver.set(false);
        const files = event.dataTransfer?.files;
        if (files?.length) {
            this.droppedFile.emit(files);
        }
    }

}
