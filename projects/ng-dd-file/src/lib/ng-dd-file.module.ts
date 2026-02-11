import { NgModule } from '@angular/core';
import { NgDdFileComponent } from './ng-dd-file.component';
import { NgDdFileDirective } from './ng-dd-file.directive';

@NgModule({
    imports: [NgDdFileComponent, NgDdFileDirective],
    exports: [NgDdFileComponent, NgDdFileDirective]
})
export class NgDdFileModule { }
