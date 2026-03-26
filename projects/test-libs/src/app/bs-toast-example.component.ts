import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { NgBsToastService } from 'ng-bs-toast-service';
import { NgCollapseComponent } from 'ng-collapse';

type ToastStyle = 'primary' | 'success' | 'warning' | 'danger';

declare const Prism: any;

@Component({
    selector: 'bs-toast-example',
    standalone: true,
    imports: [NgCollapseComponent],
    template: `
        <div class="d-flex align-items-center border-bottom pb-1 mb-3">
            <h1 class="fs-3 fw-light me-3 mb-0">Bootstrap Toast</h1>
            <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode.set(!toggleCode())">
                <i class="bi bi-code me-1"></i> CODE
            </button>
        </div>

        <ng-collapse [toggle]="toggleCode()">
            <div class="style-code rounded mb-3">
Instalação (app.component.html):
<pre><code class="language-html">&lt;ng-bs-toast-service /&gt;</code></pre>
Typescript:
<pre><code class="language-js">toastService = inject(NgBsToastService);

send(style: string) &#123;
    this.toastService.send('Título', 'Mensagem', style);
&#125;</code></pre>
Template:
<pre><code class="language-html">&lt;button (click)="send('primary')"&gt;Primary&lt;/button&gt;</code></pre>
            </div>
        </ng-collapse>

        @if (lastSent()) {
            <div class="alert alert-info py-1 mb-3 small">
                <strong>Último enviado:</strong> estilo <code>{{ lastSent() }}</code>
            </div>
        }

        <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-primary"         (click)="send('primary')">Primary</button>
            <button class="btn btn-success"         (click)="send('success')">Success</button>
            <button class="btn btn-warning"         (click)="send('warning')">Warning</button>
            <button class="btn btn-danger"          (click)="send('danger')">Danger</button>
            <button class="btn btn-outline-secondary" (click)="sendTitleOnly()">Só título</button>
            <button class="btn btn-outline-dark"    (click)="sendAll()">Todos</button>
        </div>
    `
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