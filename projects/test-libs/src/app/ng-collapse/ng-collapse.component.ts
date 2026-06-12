import { AfterViewInit, Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgCollapseComponent } from 'ng-collapse';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';

declare const Prism: any;

@Component({
    selector: 'collapse-example',
    standalone: true,
    imports: [NgClass, NgCollapseComponent, PageHeaderComponent],
    templateUrl: './ng-collapse.component.html'
})
export class CollapseExampleComponent implements AfterViewInit {

    toggle = signal(false);
    toggleCode = signal(false);
    duration = signal(500);

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}
