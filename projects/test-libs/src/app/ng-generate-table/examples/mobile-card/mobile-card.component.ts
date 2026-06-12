import { AfterViewInit, Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'gt-mobile-card-example',
    standalone: true,
    imports: [NgClass, NgGenerateTableComponent, NgCollapseComponent],
    templateUrl: './mobile-card.component.html'
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
