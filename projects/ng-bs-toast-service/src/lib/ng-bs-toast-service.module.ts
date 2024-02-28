import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgBsToastServiceComponent } from './ng-bs-toast-service.component';
import { NgBsToastService } from './ng-bs-toast-service.service';

@NgModule({
    declarations: [NgBsToastServiceComponent],
    imports: [CommonModule],
    exports: [NgBsToastServiceComponent],
    providers: [NgBsToastService]
})
export class NgBsToastServiceModule { }
