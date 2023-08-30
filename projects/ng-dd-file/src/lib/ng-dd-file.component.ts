import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';

@Component({
    selector: 'ng-dd-file',
    templateUrl: './ng-dd-file.component.html',
    styleUrls: ['./ng-dd-file.component.css']
})
export class NgDdFileComponent {

    @ViewChild('fileDropRef', { static: false }) fileDropRef: TemplateRef<any> | any;

    @Input() btnClass?: { file?: string, remove?: string };
    @Input() labels = { text: 'Arraste e solte os arquivos', btn: 'SELECIONE O ARQUIVO' };

    @Input() filesIn?: any[];
    @Input() maxFiles?: number;
    @Input() multiple?: boolean;
    @Input() typeFileAccept: string = '*';

    @Output() filesOut = new EventEmitter<any[]>();
    @Output() fileRemove = new EventEmitter<any>();

    triggerIputFile() {
        this.fileDropRef.nativeElement.click();
    }

    fileBrowseHandler($event: any) {
        const filesArray = $event.target?.files || $event;
        const files: any[] = [];
        Array.from(filesArray).map(async (file: any) => {
            files.push(file);
            if (this.isImg(file.name))
                file.base64 = await this.getBase64(file);
        });
        this.maxFiles ? files.splice(this.maxFiles, files.length) : false;
        this.filesOut.emit(files);
    }

    removeFile(file: any, index: number) {
        this.fileRemove.emit({...file, index});
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
