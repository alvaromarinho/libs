import { Component, model } from '@angular/core';

@Component({
    selector: 'page-header',
    standalone: true,
    templateUrl: './page-header.component.html'
})
export class PageHeaderComponent {
    toggleCode = model.required<boolean>();
}
