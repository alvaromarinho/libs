import { AfterViewInit, Component, inject, signal, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgBsModalService } from 'ng-bs-modal-service';
import { NgCollapseComponent } from 'ng-collapse';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';

declare const Prism: any;

@Component({
    selector: 'bs-modal-example',
    standalone: true,
    imports: [NgClass, NgCollapseComponent, PageHeaderComponent],
    styles: [`:host { --modal-image-height: 50vh; }`],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './ng-bs-modal-service.component.html'
})
export class BsModalExampleComponent implements AfterViewInit {

    private modalService = inject(NgBsModalService);

    toggleCode = signal(false);
    lastAction = signal<string | null>(null);

    images = [
        { url: 'https://placehold.co/410x1210', name: 'Image 1' },
        { url: 'https://placehold.co/420x220', name: 'Image 2' },
        { url: 'https://placehold.co/830x830', name: 'Image 3' },
    ];

    ngAfterViewInit() {
        Prism.highlightAll();
    }

    showModalContent(content: TemplateRef<any>) {
        this.lastAction.set('Modal com ng-template completo');
        this.modalService.open(content);
    }

    showModalImg(index: number) {
        this.lastAction.set(`Carousel — imagem ${index + 1}`);
        this.modalService.open({ header: 'Carousel' }, { carousel: { index, images: this.images } });
    }

    showPopover(body: TemplateRef<any>, element: HTMLElement) {
        this.lastAction.set('Popover modal');
        this.modalService.open({ header: 'Modal', body }, {
            size: 'lg',
            popoverTo: element,
            customClass: { modalHeader: 'bg-danger text-white' }
        });
    }

    openQueueModal(body?: TemplateRef<any>) {
        this.lastAction.set(`Queue Modal`);
        this.modalService.open({
            header: body ? 'Modal' : 'Queue Modal',
            body: body ?? 'Este é um modal de exemplo para demonstrar o comportamento de fila.'
        });
    }

    showModalWithClose(body: TemplateRef<any>) {
        this.lastAction.set('Modal com closed$');
        this.modalService.open({ header: 'Feche via X, backdrop ou ESC', body })
            .subscribe(() => this.lastAction.set('Modal fechado (closed$ disparou)'));
    }
}
