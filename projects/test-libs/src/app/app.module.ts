import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgGenerateTableModule } from 'ng-generate-table';
import { NgDdFileModule } from 'ng-dd-file';
import { NgCollapseModule } from 'ng-collapse';
import { NgBsCalendarModule } from 'ng-bs-calendar';
import { NgBsModalModule } from 'ng-bs-modal';

import { GTClassPipeExampleComponent, GTManualTagsComponent, GTRowClickExampleComponent, GTSimpleExampleComponent } from './generate-table-example';
import { DDExampleComponent } from './dd-example.component';
import { CollapseExampleComponent } from './collapse-example.component';
import { BsCalendarExampleComponent } from './bs-calendar-example.component';

@NgModule({
    declarations: [
        AppComponent,
        GTSimpleExampleComponent,
        GTManualTagsComponent,
        GTRowClickExampleComponent,
        GTClassPipeExampleComponent,
        DDExampleComponent,
        CollapseExampleComponent,
        BsCalendarExampleComponent,
    ],
    imports: [
        BrowserModule,
        NgCollapseModule,
        NgGenerateTableModule,
        NgDdFileModule,
        NgBsCalendarModule,
        NgBsModalModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
