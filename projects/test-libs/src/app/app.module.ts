import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgGenerateTableModule } from 'ng-generate-table';
import { NgDdFileModule } from 'ng-dd-file';
import { NgCollapseModule } from 'ng-collapse';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        NgCollapseModule,
        NgGenerateTableModule,
        NgDdFileModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
