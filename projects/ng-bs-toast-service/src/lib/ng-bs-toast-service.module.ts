import { NgModule } from '@angular/core';
import { NgBsToastServiceComponent } from './ng-bs-toast-service.component';
import { NgBsToastService } from './ng-bs-toast-service.service';

@NgModule({
    imports: [NgBsToastServiceComponent],
    exports: [NgBsToastServiceComponent],
    providers: [NgBsToastService]
})
export class NgBsToastServiceModule { }
