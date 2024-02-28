import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { NgBsCalendarModule } from 'ng-bs-calendar';
import { NgBsModalServiceModule } from 'ng-bs-modal-service';
import { NgCollapseModule } from 'ng-collapse';
import { NgDdFileModule } from 'ng-dd-file';
import { NgGenerateTableModule } from 'ng-generate-table';

import { BsCalendarExampleComponent } from './bs-calendar-example.component';
import { BsModalExampleComponent } from './bs-modal-example.component';
import { BsToastExampleComponent } from './bs-toast-example.component';
import { CollapseExampleComponent } from './collapse-example.component';
import { DdFileExampleComponent } from './dd-file-example.component';
import { GTClassPipeExampleComponent, GTManualTagsComponent, GTRowClickExampleComponent, GTSimpleExampleComponent } from './generate-table-example';
import { NgBsToastServiceModule } from 'ng-bs-toast-service';

@NgModule({
    declarations: [
        AppComponent,
        BsCalendarExampleComponent,
        BsModalExampleComponent,
        BsToastExampleComponent,
        CollapseExampleComponent,
        DdFileExampleComponent,
        GTClassPipeExampleComponent,
        GTManualTagsComponent,
        GTRowClickExampleComponent,
        GTSimpleExampleComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NgBsCalendarModule,
        NgBsModalServiceModule,
        NgBsToastServiceModule,
        NgCollapseModule,
        NgDdFileModule,
        NgGenerateTableModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
