import { NgModule, LOCALE_ID } from '@angular/core';
import { NgBsCalendarComponent } from './ng-bs-calendar.component';
import { CommonModule, registerLocaleData } from '@angular/common';

import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

@NgModule({
    declarations: [
        NgBsCalendarComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        NgBsCalendarComponent
    ],
    providers: [
        { provide: LOCALE_ID, useValue: 'pt-BR' }
    ]
})
export class NgBsCalendarModule { }
