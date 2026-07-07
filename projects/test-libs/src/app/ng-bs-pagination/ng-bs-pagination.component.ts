import { AfterViewInit, Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgBsPaginationComponent } from 'ng-bs-pagination';
import { NgCollapseComponent } from 'ng-collapse';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';

declare const Prism: any;

@Component({
    selector: 'bs-pagination-example',
    standalone: true,
    imports: [NgBsPaginationComponent, NgCollapseComponent, PageHeaderComponent],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './ng-bs-pagination.component.html'
})
export class BsPaginationExampleComponent implements AfterViewInit {

    toggleCode = signal(false);

    current1 = signal(1);
    current2 = signal(1);
    current3 = signal(1);
    current4 = signal(1);
    current5 = signal(1);
    current6 = signal(1);
    current7 = signal(1);

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}
