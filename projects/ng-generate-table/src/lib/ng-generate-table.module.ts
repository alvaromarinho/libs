import { NgModule } from '@angular/core';
import { NgGenerateTableComponent } from './ng-generate-table.component';
import { DynamicPipe } from './dynamic.pipe';
import { SafeHtmlPipe } from './safeHtml.pipe';

@NgModule({
    imports: [
        NgGenerateTableComponent,
        DynamicPipe,
        SafeHtmlPipe
    ],
    exports: [
        NgGenerateTableComponent,
        DynamicPipe,
        SafeHtmlPipe
    ]
})
export class NgGenerateTableModule { }
