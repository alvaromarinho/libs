import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgDdFileDirective } from './ng-dd-file.directive';

interface FileWithBase64 extends File {
    base64?: string;
    url?: string;
}

interface FileError {
    type: 'size' | 'total' | 'type';
    message: string;
    file?: File;
}

@Component({
    selector: 'ng-dd-file',
    standalone: true,
    imports: [CommonModule, NgDdFileDirective],
    templateUrl: './ng-dd-file.component.html',
    styleUrls: ['./ng-dd-file.component.css']
})
export class NgDdFileComponent {

    @ViewChild('fileDropRef', { static: false }) fileDropRef!: ElementRef<HTMLInputElement>;

    @Input() btnClass?: { file?: string, remove?: string };
    @Input() filesList?: FileWithBase64[];
    @Input() labels = { text: 'Arraste e solte os arquivos', btn: 'SELECIONE O ARQUIVO' };
    @Input() maxFiles?: number;
    @Input() maxFileSize?: number; // em KB
    @Input() maxTotalSize?: number; // em KB
    @Input() multiple?: boolean;
    @Input() typeFileAccept: string = '*';

    @Output() fileError = new EventEmitter<FileError>();
    @Output() fileRemove = new EventEmitter<{ file: FileWithBase64, index: number }>();
    @Output() filesAdd = new EventEmitter<FileWithBase64[]>();

    triggerIputFile() {
        this.fileDropRef.nativeElement.click();
    }

    async fileBrowseHandler($event: any) {
        const filesArray: FileList = $event.target?.files || $event;
        const files: FileWithBase64[] = [];
        
        if (this.maxTotalSize) {
            let total = 0;
            const allFiles = [...(this.filesList || []), ...Array.from(filesArray)];
            
            for (const file of allFiles) {
                total += file.size;
            }
            
            if (total > (this.maxTotalSize * 1024)) {
                this.fileError.emit({
                    type: 'total',
                    message: 'Capacidade máxima dos arquivos atingida!'
                });
                return;
            }
        }
        
        for (const file of Array.from(filesArray)) {
            if (this.maxFileSize && file.size > (this.maxFileSize * 1024)) {
                this.fileError.emit({
                    type: 'size',
                    message: 'Arquivo maior que o permitido!',
                    file: file
                });
                continue;
            }
            
            if (!this.isValidFileType(file)) {
                this.fileError.emit({
                    type: 'type',
                    message: 'Tipo de arquivo não permitido!',
                    file: file
                });
                continue;
            }
            
            const fileWithBase64 = file as FileWithBase64;

            if (this.isImg(file)) {
                fileWithBase64.base64 = await this.getBase64(file) as string;
            }
            
            files.push(fileWithBase64);
            
            if (this.maxFiles && files.length >= this.maxFiles) {
                break;
            }
        }
        
        if ($event.target) {
            $event.target.value = '';
        }
        
        this.filesAdd.emit(files);
    }

    removeFile(file: FileWithBase64, index: number) {
        this.fileRemove.emit({ file, index });
    }

    private isImg(file: File): boolean {
        return file.type.startsWith('image/');
    }
    

    private isValidFileType(file: File): boolean {
        if (this.typeFileAccept === '*') {
            return true;
        }
        
        const acceptedTypes = this.typeFileAccept.split(',').map(type => type.trim());
        
        for (const acceptedType of acceptedTypes) {
            if (acceptedType.startsWith('.')) {
                if (file.name.toLowerCase().endsWith(acceptedType.toLowerCase())) {
                    return true;
                }
            } else if (acceptedType.endsWith('/*')) {
                const mimePrefix = acceptedType.slice(0, -2);
                if (file.type.startsWith(mimePrefix)) {
                    return true;
                }
            } else if (file.type === acceptedType) {
                return true;
            }
        }
        
        return false;
    }

    private async getBase64(file: File): Promise<string | ArrayBuffer | null> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
}