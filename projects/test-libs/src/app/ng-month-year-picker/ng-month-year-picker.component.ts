import { AfterViewInit, Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgMonthYearPickerComponent } from 'ng-month-year-picker';
import { NgCollapseComponent } from 'ng-collapse';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';

declare const Prism: any;

@Component({
    selector: 'month-year-picker-example',
    standalone: true,
    imports: [NgMonthYearPickerComponent, NgCollapseComponent, PageHeaderComponent],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './ng-month-year-picker.component.html'
})
export class MonthYearPickerExampleComponent implements AfterViewInit {

    toggleCode = signal(false);
    month = signal(new Date().toISOString().slice(0, 7));
    disabled = signal(false);

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}
