# NgBsModalService
Modal Service for Angular and Bootstrap 5.

## Getting started
### Step 1: Install `ng-bs-modal-service`

#### NPM
```shell
npm install --save ng-bs-modal-service
```
#### YARN
```shell
yarn add ng-bs-modal-service
```
### Step 2: Import the NgBsModalServiceModule
```js
import { NgBsModalServiceModule } from 'ng-bs-modal-service';

@NgModule({
  declarations: [...],
  imports: [NgBsModalServiceModule],
  bootstrap: [...]
})
export class AppModule {}
```

### Step 3: Add ng-bs-modal-service tag
Add in `app-component.html`

```html
<ng-bs-modal-service></ng-bs-modal-service>
```

### Usage
Data source:
```js
constructor(private modalService: NgBsModalService) {}

showModal(modalBody: TemplateRef<any>) {
    this.modalService.open({
        header: 'Modal',
        body: modalBody
    }, { 
        customClass: { modalHeader: 'bg-danger text-white' }
    })
}
```

In template:
```html
<button type="button" class="btn btn-primary" (click)="showModal(modalBody)">Show Modal</button>

<ng-template #modalBody>
    <img src="https://placehold.co/800x400" alt="placeholder">
</ng-template>
```

### Interfaces
```js
ModalService.open(content: NgBsModalServiceContent | TemplateRef<any>, options?: NgBsModalServiceOptions)
ModalService.close() // close current modal
ModalService.closeAll() // close all modal queue

NgBsModalServiceContent {
    body: TemplateRef<any> | string,
    header?: TemplateRef<any> | string,
    footer?: TemplateRef<any>
}

NgBsModalServiceOptions {
    disabledBodyScroll?: boolean;
    size?: 'sm' | 'lg' | 'xl',
    staticBackdrop?: boolean,
    withoutClose?: boolean,
    popoverTo?: HTMLElement,
    carousel?: {
        index: number,
        images: { url: string, fileName: string }[]
    },
    customClass?: {
        modal?: string;
        modalHeader?: string,
        modalBody?: string;
        modalFooter?: string,
    }
}
```
## CSS Variables

```css
:host {
    --modal-image-height: 80vh;
}
```
