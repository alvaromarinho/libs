import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';

@Component({
    selector: 'ng-dd-file',
    templateUrl: './ng-dd-file.component.html',
    styleUrls: ['./ng-dd-file.component.css']
})
export class NgDdFileComponent {

    @ViewChild('fileDropRef', { static: false }) fileDropRef: TemplateRef<any> | any;

    @Input() btnClass?: { file?: string, remove?: string };
    @Input() filesList?: any[];
    @Input() labels = { text: 'Arraste e solte os arquivos', btn: 'SELECIONE O ARQUIVO' };
    @Input() maxFiles?: number;
    @Input() maxFileSize?: number;
    @Input() maxTotalSize?: number;
    @Input() multiple?: boolean;
    @Input() typeFileAccept: string = '*';

    @Output() fileError = new EventEmitter<any>();
    @Output() fileRemove = new EventEmitter<{ file: any, index: number }>();
    @Output() filesAdd = new EventEmitter<any[]>();

    triggerIputFile() {
        this.fileDropRef.nativeElement.click();
    }

    fileBrowseHandler($event: any) {
        const filesArray = $event.target?.files || $event;
        const files: any[] = [];
        let total = 0
        this.maxTotalSize && [...(this.filesList || []), ...Array.from(filesArray)]?.map((file) => {
            total += file.size;
            console.log(total, (this.maxTotalSize!*1000))
            if (total > (this.maxTotalSize!*1000)) {
                this.fileError.emit('Capacidade máxima dos arquivos atingida!');
                throw new Error('Maximum capacity reached');
            };
        })
        Array.from(filesArray).map(async (file: any) => {
            if (this.maxFileSize && file.size > (this.maxFileSize*1000)) {
                this.fileError.emit('Arquivo maior que o permitido!');
                throw new Error('File larger than allowed');
            }

            files.push(file);
            if (this.isImg(file.name)) {
                file.base64 = await this.getBase64(file);
            }
        });
        
        this.maxFiles ? files.splice(this.maxFiles, files.length) : false;
        this.filesAdd.emit(files);
    }

    removeFile(file: any, index: number) {
        this.fileRemove.emit({ file, index });
    }

    private isImg(url: string) {
        return url.indexOf('.png') !== -1 || url.indexOf('.jpg') !== -1 || url.indexOf('.jpeg') !== -1
    }

    private async getBase64(file: any) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
}
