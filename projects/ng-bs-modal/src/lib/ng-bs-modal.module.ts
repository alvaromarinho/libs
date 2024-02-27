import { NgModule } from '@angular/core';
import { NgBsModalComponent } from './ng-bs-modal.component';
import { CommonModule } from '@angular/common';
import { NgBsModalService } from './ng-bs-modal.service';

@NgModule({
  declarations: [NgBsModalComponent],
  imports: [CommonModule,],
  exports: [NgBsModalComponent],
  providers: [NgBsModalService]
})
export class NgBsModalModule { }
