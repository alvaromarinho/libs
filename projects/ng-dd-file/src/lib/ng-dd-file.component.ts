import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { NgDdFileDirective } from './ng-dd-file.directive';

export interface FileWithBase64 extends File {
    base64?: string;
    url?: string;
}

export interface FileError {
    type: 'size' | 'total' | 'type' | 'count';
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
    // Arquivos aceitos de lotes que ainda leem o preview (base64): contam no limite até o filesAdd.
    private pending: File[] = [];

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
        const current = [...(this.filesList() ?? []), ...this.pending];
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

        const available = maxFiles ? Math.max(0, maxFiles - current.length) : Infinity;

        for (const file of selected) {
            if (maxFileSize && file.size > maxFileSize * 1024) {
                this.fileError.emit({ type: 'size', message: 'Arquivo maior que o permitido!', file });
                continue;
            }

            if (!this.isValidFileType(file)) {
                this.fileError.emit({ type: 'type', message: 'Tipo de arquivo não permitido!', file });
                continue;
            }

            if (files.length >= available) {
                this.fileError.emit({ type: 'count', message: 'Limite de arquivos atingido!', file });
                continue;
            }

            files.push(file);
        }

        this.pending = [...this.pending, ...files];
        try {
            for (const file of files) {
                if (this.isImg(file)) {
                    file.base64 = await this.getBase64(file);
                }
            }
            this.filesAdd.emit(files);
        } finally {
            this.pending = this.pending.filter(file => !files.includes(file));
        }
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
