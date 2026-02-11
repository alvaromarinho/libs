import { OnInit, OnDestroy, Component, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { NgBsToastService, ToastMessage } from './ng-bs-toast-service.service';
import { Toast } from 'bootstrap';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

interface ToastData extends ToastMessage {
    id: number;
    instance?: Toast;
}

@Component({
    selector: 'ng-bs-toast-service',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ng-bs-toast-service.component.html',
    styleUrls: ['./ng-bs-toast-service.component.css']
})
export class NgBsToastServiceComponent implements OnInit, OnDestroy {
    @ViewChildren('toastElement') toastElements!: QueryList<ElementRef>;

    toastData: ToastData[] = [];
    private destroy$ = new Subject<void>();
    private toastCounter = 0;

    constructor(private toastService: NgBsToastService) { }

    ngOnInit(): void {
        this.toastService.listen()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                this.addToast(data);
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        
        // Cleanup all toast instances
        this.toastData.forEach(toast => {
            toast.instance?.dispose();
        });
    }

    private addToast(data: ToastMessage): void {
        const id = this.toastCounter++;
        const toastData: ToastData = { 
            ...data, 
            id,
            style: data.style || 'primary',
            duration: data.duration || 5000
        };
        
        this.toastData.push(toastData);

        // Wait for view to update
        setTimeout(() => {
            const element = document.getElementById(`toast_${id}`);
            if (element) {
                const toastInstance = new Toast(element, {
                    autohide: true,
                    delay: toastData.duration
                });
                
                toastData.instance = toastInstance;
                toastInstance.show();

                // Remove from array when hidden
                element.addEventListener('hidden.bs.toast', () => {
                    this.removeToast(id);
                    toastInstance.dispose();
                });
            }
        }, 0);
    }

    private removeToast(id: number): void {
        const index = this.toastData.findIndex(t => t.id === id);
        if (index !== -1) {
            this.toastData[index].instance?.dispose();
            this.toastData.splice(index, 1);
        }
    }
}