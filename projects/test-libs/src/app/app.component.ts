import { Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgCollapseComponent } from 'ng-collapse';
import { NgBsModalServiceComponent } from 'ng-bs-modal-service';
import { NgBsToastServiceComponent } from 'ng-bs-toast-service';
import { BsCalendarExampleComponent } from './bs-calendar-example.component';
import { BsModalExampleComponent } from './bs-modal-example.component';
import { BsToastExampleComponent } from './bs-toast-example.component';
import { CollapseExampleComponent } from './collapse-example.component';
import { DdFileExampleComponent } from './dd-file-example.component';
import { GTSimpleExampleComponent, GTManualTagsComponent, GTRowClickExampleComponent, GTClassPipeExampleComponent, GTLoadingEmptyExampleComponent, GTMobileCardExampleComponent } from './generate-table-example';

type PageKey = 'ngBsCalendar' | 'ngBsModalService' | 'ngBsToastService' | 'ngCollapse' | 'ngDdFile' | 'ngGenerateTable';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [
        NgClass,
        NgCollapseComponent,
        NgBsModalServiceComponent,
        NgBsToastServiceComponent,
        BsCalendarExampleComponent,
        BsModalExampleComponent,
        BsToastExampleComponent,
        CollapseExampleComponent,
        DdFileExampleComponent,
        GTSimpleExampleComponent,
        GTManualTagsComponent,
        GTRowClickExampleComponent,
        GTClassPipeExampleComponent,
        GTLoadingEmptyExampleComponent,
        GTMobileCardExampleComponent,
    ]
})
export class AppComponent {
    toggleNav = signal(false);
    currentPage = signal<PageKey>('ngBsCalendar');

    navItems: { key: PageKey; label: string }[] = [
        { key: 'ngBsCalendar',     label: 'ng-bs-calendar' },
        { key: 'ngBsModalService', label: 'ng-bs-modal-service' },
        { key: 'ngBsToastService', label: 'ng-bs-toast-service' },
        { key: 'ngCollapse',       label: 'ng-collapse' },
        { key: 'ngDdFile',         label: 'ng-dd-file' },
        { key: 'ngGenerateTable',  label: 'ng-generate-table' },
    ];

    changePage(page: PageKey) {
        this.toggleNav.set(false);
        this.currentPage.set(page);
    }
}