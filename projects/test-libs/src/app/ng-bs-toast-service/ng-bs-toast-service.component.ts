import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { NgBsToastService, ToastPosition, ToastStyle, ToastTheme } from 'ng-bs-toast-service';
import { NgCollapseComponent } from 'ng-collapse';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';

declare const Prism: any;

const STYLES: ToastStyle[] = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
const POSITIONS: ToastPosition[] = ['top-start', 'top-center', 'top-end', 'middle-center', 'bottom-start', 'bottom-center', 'bottom-end'];
const THEMES: ToastTheme[] = ['bootstrap', 'bootstrap-dark'];

@Component({
    selector: 'bs-toast-example',
    standalone: true,
    imports: [NgCollapseComponent, PageHeaderComponent],
    templateUrl: './ng-bs-toast-service.component.html'
})
export class BsToastExampleComponent implements AfterViewInit {

    private toastService = inject(NgBsToastService);

    readonly styles = STYLES;
    readonly positions = POSITIONS;
    readonly themes = THEMES;

    toggleCode = signal(false);
    lastSent = signal<string | null>(null);
    theme = signal<ToastTheme>('bootstrap');
    position = signal<ToastPosition>('top-end');

    ngAfterViewInit() {
        Prism.highlightAll();
    }

    send(style: ToastStyle) {
        this.lastSent.set(`${style} · tema ${this.theme()} · ${this.position()}`);
        this.toastService.send(
            this.title(style),
            'Passe o mouse pra pausar a barra de progresso.',
            style,
            undefined,
            { theme: this.theme(), position: this.position() }
        );
    }

    sendTitleOnly() {
        this.lastSent.set('primary (sem mensagem)');
        this.toastService.send('Apenas título, sem corpo de mensagem', null, 'primary', undefined, {
            theme: this.theme(), position: this.position(),
        });
    }

    sendAll() {
        this.lastSent.set('todos os 8 estilos em sequência');
        this.styles.forEach((style, i) => {
            setTimeout(() => this.toastService.send(this.title(style), 'Mensagem', style, undefined, {
                theme: this.theme(), position: this.position(),
            }), i * 300);
        });
    }

    sendQueueDemo() {
        this.lastSent.set('7 de uma vez — o container comporta 5, o resto fica na fila');
        for (let i = 1; i <= 7; i++) {
            this.toastService.send(`Toast ${i}`, 'Fila de notificações (maxToastsPerPosition)', 'primary', 6000, {
                theme: this.theme(), position: this.position(),
            });
        }
    }

    sendWithClose() {
        this.lastSent.set('aguardando fechamento…');
        this.toastService.send('Fecho sozinho em 3s', '…ou clique no X — o Observable completa do mesmo jeito.', 'info', 3000, {
            theme: this.theme(), position: this.position(),
        }).subscribe(() => this.lastSent.set('toast fechado — Observable de send() completou'));
    }

    dismissAll() {
        this.toastService.dismissAll();
    }

    private title(style: ToastStyle): string {
        return style.charAt(0).toUpperCase() + style.slice(1);
    }
}
