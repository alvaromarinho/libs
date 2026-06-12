import { Routes } from '@angular/router';
import { BsCalendarExampleComponent } from './ng-bs-calendar/ng-bs-calendar.component';
import { BsModalExampleComponent } from './ng-bs-modal-service/ng-bs-modal-service.component';
import { BsToastExampleComponent } from './ng-bs-toast-service/ng-bs-toast-service.component';
import { BsPaginationExampleComponent } from './ng-bs-pagination/ng-bs-pagination.component';
import { CollapseExampleComponent } from './ng-collapse/ng-collapse.component';
import { DdFileExampleComponent } from './ng-dd-file/ng-dd-file.component';
import { MonthYearPickerExampleComponent } from './ng-month-year-picker/ng-month-year-picker.component';
import { GenerateTableExamplesComponent } from './ng-generate-table/ng-generate-table.component';

export const routes: Routes = [
    { path: 'ng-bs-calendar', component: BsCalendarExampleComponent },
    { path: 'ng-bs-modal-service', component: BsModalExampleComponent },
    { path: 'ng-bs-toast-service', component: BsToastExampleComponent },
    { path: 'ng-bs-pagination', component: BsPaginationExampleComponent },
    { path: 'ng-collapse', component: CollapseExampleComponent },
    { path: 'ng-dd-file', component: DdFileExampleComponent },
    { path: 'ng-month-year-picker', component: MonthYearPickerExampleComponent },
    { path: 'ng-generate-table', component: GenerateTableExamplesComponent },
    { path: '', redirectTo: 'ng-bs-calendar', pathMatch: 'full' },
    { path: '**', redirectTo: 'ng-bs-calendar' },
];
