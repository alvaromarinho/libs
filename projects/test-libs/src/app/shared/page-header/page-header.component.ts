import { Component, model, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'page-header',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './page-header.component.html'
})
export class PageHeaderComponent {
    toggleCode = model.required<boolean>();
}
