import { OnInit, ChangeDetectorRef, Component } from '@angular/core';
import { NgBsToastService } from './ng-bs-toast-service.service';
import { Toast } from 'bootstrap';

interface ToastData {
    id: number;
    title: string;
    message: string;
    style: 'success' | 'warning' | 'danger' | 'primary';
}

@Component({
    selector: 'ng-bs-toast-service',
    templateUrl: './ng-bs-toast-service.component.html',
    styleUrls: ['./ng-bs-toast-service.component.css']
})
export class NgBsToastServiceComponent implements OnInit {

    toasts: Toast[] = [];
    toastData: ToastData[] = [];

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private toastService: NgBsToastService
    ) { }

    ngOnInit() {
        this.toastService.listen().subscribe((data) => {
            const id = Math.floor(Math.random() * 10000);
            this.toastData.push({ ...data, id });
            this.changeDetectorRef.detectChanges();
            this.toasts.push(new Toast(`#toast_${id}`))
            this.toasts[this.toasts.length - 1]?.show();
            setTimeout(() => {
                const index = this.toasts.findIndex((toast: Toast) => !toast.isShown())
                this.toasts.splice(index, 1)
                this.toastData.splice(index, 1)
            }, 7000);
        });
    }

}
