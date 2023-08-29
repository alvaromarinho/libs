import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgDdFileComponent } from './ng-dd-file.component';
import { NgDdFileDirective } from './ng-dd-file.directive';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        NgDdFileComponent,
        NgDdFileDirective
    ],
    imports: [
        CommonModule,
        FormsModule
    ],
    exports: [NgDdFileComponent]
})
export class NgDdFileModule { }
