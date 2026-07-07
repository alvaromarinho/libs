import { AfterViewInit, Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgBsToastService } from 'ng-bs-toast-service';
import { NgCollapseComponent } from 'ng-collapse';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';

type ToastStyle = 'primary' | 'success' | 'warning' | 'danger';

declare const Prism: any;

@Component({
    selector: 'bs-toast-example',
    standalone: true,
    imports: [NgCollapseComponent, PageHeaderComponent],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './ng-bs-toast-service.component.html'
})
export class BsToastExampleComponent implements AfterViewInit {

    private toastService = inject(NgBsToastService);

    toggleCode = signal(false);
    lastSent = signal<string | null>(null);

    ngAfterViewInit() {
        Prism.highlightAll();
    }

    send(style: ToastStyle) {
        this.lastSent.set(style);
        this.toastService.send('Título', 'Mensagem de exemplo para este estilo de toast.', style);
    }

    sendTitleOnly() {
        this.lastSent.set('primary (sem mensagem)');
        this.toastService.send('Apenas título, sem corpo de mensagem', null, 'primary');
    }

    sendAll() {
        this.lastSent.set('todos');
        this.toastService.send('Primary', 'Mensagem', 'primary');
        setTimeout(() => this.toastService.send('Success', 'Mensagem', 'success'), 800);
        setTimeout(() => this.toastService.send('Warning', 'Mensagem', 'warning'), 1600);
        setTimeout(() => this.toastService.send('Danger',  'Mensagem', 'danger'),  2400);
    }
}
