import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgGenerateTableModule } from 'ng-generate-table';
import { NgDdFileModule } from 'ng-dd-file';
import { NgCollapseModule } from 'ng-collapse';
import { NgBsCalendarModule } from 'ng-bs-calendar';
import { NgBsModalServiceModule } from 'ng-bs-modal-service';

import { GTClassPipeExampleComponent, GTManualTagsComponent, GTRowClickExampleComponent, GTSimpleExampleComponent } from './generate-table-example';
import { DdFileExampleComponent } from './dd-file-example.component';
import { CollapseExampleComponent } from './collapse-example.component';
import { BsCalendarExampleComponent } from './bs-calendar-example.component';
import { BsModalExampleComponent } from './bs-modal-example.component';

@NgModule({
    declarations: [
        AppComponent,
        BsCalendarExampleComponent,
        BsModalExampleComponent,
        CollapseExampleComponent,
        DdFileExampleComponent,
        GTClassPipeExampleComponent,
        GTManualTagsComponent,
        GTRowClickExampleComponent,
        GTSimpleExampleComponent,
    ],
    imports: [
        BrowserModule,
        NgBsCalendarModule,
        NgBsModalServiceModule,
        NgCollapseModule,
        NgDdFileModule,
        NgGenerateTableModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
