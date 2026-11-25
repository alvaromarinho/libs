import { AfterViewInit, Component, signal } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'gt-loading-empty-example',
    standalone: true,
    imports: [NgGenerateTableComponent, NgCollapseComponent],
    templateUrl: './loading-empty.component.html'
})
export class GTLoadingEmptyExampleComponent implements AfterViewInit {

    toggleCode = signal(false);
    loading = signal(false);
    hasData = signal(true);

    mobileView = window.innerWidth < 768;

    columns: NgGenerateTableColumns[] = [
        { label: 'Name',  field: 'name' },
        { label: 'Email', field: 'email' },
        { label: 'Data',  field: 'date' },
    ];

    data = [
        { name: 'Álvaro',  email: 'alvaro@email.com',  date: '2024-01-15' },
        { name: 'Marinho', email: 'marinho@email.com', date: '2024-03-22' },
    ];

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}
