import { AfterViewInit, Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgGenerateTableComponent, NgGenerateTableColumns } from 'ng-generate-table';
import { NgCollapseComponent } from 'ng-collapse';

declare const Prism: any;

@Component({
    selector: 'gt-class-pipe-example',
    standalone: true,
    imports: [NgGenerateTableComponent, NgCollapseComponent],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './class-pipe.component.html'
})
export class GTClassPipeExampleComponent implements AfterViewInit {

    toggleCode = signal(false);

    mobileView = window.innerWidth < 768;

    columns: NgGenerateTableColumns[] = [
        { label: 'Name',           field: 'name',  thClass: 'bg-secondary text-white', tdClass: 'text-danger' },
        { label: 'Email',          field: 'email', thClass: 'bg-secondary text-white', tdClass: 'text-success' },
        { label: 'Data',           field: 'date',  thClass: 'bg-warning', pipe: DatePipe },
        { label: 'Data formatada', field: 'date',  thClass: 'bg-warning', pipe: DatePipe, pipeArgs: ['dd MMM yyyy'] },
    ];

    data = [
        { name: 'Álvaro',  email: 'alvaro@email.com',  date: '2023-08-23' },
        { name: 'Marinho', email: 'marinho@email.com', date: '2023-08-23' },
    ];

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}
