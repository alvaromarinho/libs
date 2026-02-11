import { NgModule } from '@angular/core';
import { NgBsModalServiceComponent } from './ng-bs-modal-service.component';
import { NgBsModalService } from './ng-bs-modal-service.service';

@NgModule({
  imports: [NgBsModalServiceComponent],
  exports: [NgBsModalServiceComponent],
  providers: [NgBsModalService]
})
export class NgBsModalServiceModule { }
