import { NgModule } from '@angular/core';
import { NgGenerateTableComponent } from './ng-generate-table.component';
import { CommonModule } from '@angular/common';
import { DynamicPipe } from './dynamic.pipe';
import { SafeHtmlPipe } from './safeHtml.pipe';

@NgModule({
    declarations: [
        NgGenerateTableComponent,
        DynamicPipe,
        SafeHtmlPipe
    ],
    imports: [CommonModule],
    exports: [NgGenerateTableComponent]
})
export class NgGenerateTableModule { }
