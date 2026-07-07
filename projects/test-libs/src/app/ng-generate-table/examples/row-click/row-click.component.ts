import { AfterViewInit, Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'gt-row-click-example',
    standalone: true,
    imports: [NgGenerateTableComponent, NgCollapseComponent],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './row-click.component.html'
})
export class GTRowClickExampleComponent implements AfterViewInit {

    toggleCode = signal(false);
    lastRow = signal<any>(null);

    mobileView = window.innerWidth < 768;

    columns: NgGenerateTableColumns[] = [
        { label: 'Name',  field: 'name' },
        { label: 'Email', field: 'email' },
        { label: 'Data',  field: 'date' },
    ];

    data = [
        { name: 'Álvaro',  email: 'alvaro@email.com',  date: '2023-08-23' },
        { name: 'Marinho', email: 'marinho@email.com', date: '2023-08-23' },
    ];

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}
