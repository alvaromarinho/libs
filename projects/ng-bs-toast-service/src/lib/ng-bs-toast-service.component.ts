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

    ngOnInit() {
        this.toastService.listen().pipe(takeUntil(this.destroy$)).subscribe((data) => this.addToast(data));
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        
        // Cleanup all toast instances
        this.toastData.forEach(toast => {
            if (toast.instance) {
                try {
                    toast.instance.dispose();
                } catch (e) {
                    // Ignore disposal errors if element is already removed
                }
            }
        });
    }

    private addToast(data: ToastMessage) {
        const id = this.toastCounter++;
        const toastData: ToastData = { 
            ...data, 
            id,
            style: data.style || 'primary',
            duration: data.duration || 5000
        };
        
        this.toastData.push(toastData);
        this.initializeToast(id, toastData, 0);
    }

    private initializeToast(id: number, toastData: ToastData, attempt: number): void {
        // Maximum 10 attempts (about 500ms total)
        if (attempt >= 10) {
            console.error(`Failed to initialize toast ${id} after ${attempt} attempts`);
            return;
        }

        // Exponential backoff: 0, 10, 20, 40, 80ms...
        const delay = attempt === 0 ? 0 : Math.min(10 * Math.pow(2, attempt - 1), 100);
        
        setTimeout(() => {
            const element = document.getElementById(`toast_${id}`);
            
            if (element) {
                try {
                    const toastInstance = new Toast(element, {
                        autohide: true,
                        delay: toastData.duration
                    });
                    
                    toastData.instance = toastInstance;
                    toastInstance.show();

                    element.addEventListener('hidden.bs.toast', () => this.removeToast(id));
                } catch (error) {
                    console.error(`Error initializing toast ${id}:`, error);
                }
            } else {
                this.initializeToast(id, toastData, attempt + 1);
            }
        }, delay);
    }

    private removeToast(id: number) {
        const index = this.toastData.findIndex(t => t.id === id);
        if (index !== -1) {
            const toastData = this.toastData[index];
            if (toastData.instance) {
                try {
                    toastData.instance.dispose();
                } catch (e) {
                    // Ignore disposal errors if element is already removed
                }
            }
            this.toastData.splice(index, 1);
        }
    }
}