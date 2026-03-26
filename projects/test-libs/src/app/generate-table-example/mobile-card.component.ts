import { AfterViewInit, Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'gt-mobile-card-example',
    standalone: true,
    imports: [NgClass, NgGenerateTableComponent, NgCollapseComponent],
    template: `
        <div class="d-flex align-items-center mb-2">
            <h1 class="fs-3 fw-light me-3 mb-0">Mobile Card Template</h1>
            <button class="btn btn-sm btn-secondary py-0" type="button" (click)="toggleCode.set(!toggleCode())">
                <i class="bi bi-code me-1"></i> CODE
            </button>
        </div>
        <p class="text-muted small mb-3">
            <code>[mobileView]="true"</code> forçado para demonstração. Use <code>#cardMobile</code> para customizar o card.
        </p>

        <ng-collapse [toggle]="toggleCode()">
            <div class="style-code rounded mb-3">
Template:
<pre><code class="language-html" [innerHTML]="codeSnippet"></code></pre>
            </div>
        </ng-collapse>

        @if (lastRow()) {
            <div class="alert alert-info py-1 mb-2 small">
                <strong>Clicado:</strong> {{ lastRow() }}
            </div>
        }

        <ng-generate-table
            [columns]="columns"
            [data]="data"
            [mobileView]="true"
            [rowClickable]="true"
            (rowClick)="lastRow.set($any($event).row.name + ' — ' + $any($event).row.email)">

            <ng-template #cardMobile let-row>
                <div class="card mb-2 border-start border-4"
                    [ngClass]="'border-' + $any(row).badge"
                    style="cursor:pointer"
                    (click)="lastRow.set($any(row).name + ' — ' + $any(row).email)">
                    <div class="card-body py-2">
                        <div class="fw-bold">{{ $any(row).name }}</div>
                        <div class="text-muted small">{{ $any(row).email }}</div>
                        <span class="badge mt-1" [ngClass]="'bg-' + $any(row).badge">{{ $any(row).role }}</span>
                    </div>
                </div>
            </ng-template>

        </ng-generate-table>
    `
})
export class GTMobileCardExampleComponent implements AfterViewInit {

    toggleCode = signal(false);
    lastRow = signal<string | null>(null);

    codeSnippet = `&lt;ng-generate-table [columns]="columns" [data]="data" [mobileView]="true"&gt;

    &lt;ng-template #cardMobile let-row&gt;
        &lt;div class="card mb-2"&gt;
            &lt;div class="card-body py-2"&gt;
                &lt;div class="fw-bold"&gt;{{ row.name }}&lt;/div&gt;
                &lt;div class="text-muted small"&gt;{{ row.email }}&lt;/div&gt;
                &lt;span class="badge bg-primary"&gt;{{ row.role }}&lt;/span&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/ng-template&gt;

&lt;/ng-generate-table&gt;`;

    columns: NgGenerateTableColumns[] = [
        { label: 'Nome',  field: 'name' },
        { label: 'Email', field: 'email' },
        { label: 'Role',  field: 'role' },
    ];

    data = [
        { name: 'Álvaro',   email: 'alvaro@email.com',  role: 'Admin',  badge: 'danger'  },
        { name: 'Marinho',  email: 'marinho@email.com', role: 'Editor', badge: 'primary' },
        { name: 'Fernanda', email: 'fern@email.com',    role: 'Viewer', badge: 'success' },
    ];

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}