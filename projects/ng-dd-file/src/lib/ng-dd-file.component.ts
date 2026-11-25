import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { NgDdFileDirective } from './ng-dd-file.directive';

export interface FileWithBase64 extends File {
    base64?: string;
    url?: string;
}

export interface FileError {
    type: 'size' | 'total' | 'type';
    message: string;
    file?: File;
}

@Component({
    selector: 'ng-dd-file',
    standalone: true,
    imports: [NgDdFileDirective],
    templateUrl: './ng-dd-file.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./ng-dd-file.component.css']
})
export class NgDdFileComponent {

    readonly btnClass = input<{ file?: string, remove?: string }>();
    readonly filesList = input<FileWithBase64[]>();
    readonly labels = input({ text: 'Arraste e solte os arquivos', btn: 'SELECIONE O ARQUIVO' });
    readonly maxFiles = input<number>();
    /** Em KB. */
    readonly maxFileSize = input<number>();
    /** Em KB. */
    readonly maxTotalSize = input<number>();
    readonly multiple = input<boolean>();
    readonly typeFileAccept = input('*');

    readonly fileError = output<FileError>();
    readonly fileRemove = output<{ file: FileWithBase64, index: number }>();
    readonly filesAdd = output<FileWithBase64[]>();

    private readonly fileDropRef = viewChild<ElementRef<HTMLInputElement>>('fileDropRef');

    protected limitReached(): boolean {
        const maxFiles = this.maxFiles();
        return !!maxFiles && (this.filesList()?.length ?? 0) >= maxFiles;
    }

    protected triggerInputFile(): void {
        this.fileDropRef()?.nativeElement.click();
    }

    protected async onInputChange(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const files = Array.from(input.files ?? []);
        input.value = '';
        await this.addFiles(files);
    }

    protected async onDrop(files: FileList): Promise<void> {
        await this.addFiles(Array.from(files));
    }

    protected removeFile(file: FileWithBase64, index: number): void {
        this.fileRemove.emit({ file, index });
    }

    private async addFiles(selected: File[]): Promise<void> {
        const current = this.filesList() ?? [];
        const maxTotalSize = this.maxTotalSize();
        const maxFileSize = this.maxFileSize();
        const maxFiles = this.maxFiles();
        const files: FileWithBase64[] = [];

        if (maxTotalSize) {
            const total = [...current, ...selected].reduce((sum, file) => sum + file.size, 0);
            if (total > maxTotalSize * 1024) {
                this.fileError.emit({ type: 'total', message: 'Capacidade máxima dos arquivos atingida!' });
                return;
            }
        }

        // maxFiles conta os arquivos que já estão em filesList.
        const available = maxFiles ? Math.max(0, maxFiles - current.length) : Infinity;

        for (const file of selected) {
            if (files.length >= available) break;

            if (maxFileSize && file.size > maxFileSize * 1024) {
                this.fileError.emit({ type: 'size', message: 'Arquivo maior que o permitido!', file });
                continue;
            }

            if (!this.isValidFileType(file)) {
                this.fileError.emit({ type: 'type', message: 'Tipo de arquivo não permitido!', file });
                continue;
            }

            const fileWithBase64 = file as FileWithBase64;
            if (this.isImg(file)) {
                fileWithBase64.base64 = await this.getBase64(file);
            }
            files.push(fileWithBase64);
        }

        this.filesAdd.emit(files);
    }

    private isImg(file: File): boolean {
        return file.type.startsWith('image/');
    }

    private isValidFileType(file: File): boolean {
        const accept = this.typeFileAccept();
        if (accept === '*') return true;

        return accept.split(',').map(type => type.trim()).some(acceptedType => {
            if (acceptedType.startsWith('.')) return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
            if (acceptedType.endsWith('/*')) return file.type.startsWith(acceptedType.slice(0, -1));
            return file.type === acceptedType;
        });
    }

    private getBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

}
