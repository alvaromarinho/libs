import { NgModule } from '@angular/core';
import { NgBsModalServiceComponent } from './ng-bs-modal-service.component';
import { CommonModule } from '@angular/common';
import { NgBsModalService } from './ng-bs-modal-service.service';

@NgModule({
  declarations: [NgBsModalServiceComponent],
  imports: [CommonModule,],
  exports: [NgBsModalServiceComponent],
  providers: [NgBsModalService]
})
export class NgBsModalServiceModule { }
