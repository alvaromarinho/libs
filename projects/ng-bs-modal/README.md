# NgBsModal
Modal Service for Angular and Bootstrap 5.

## Getting started
### Step 1: Install `ng-bs-modal`

#### NPM
```shell
npm install --save ng-bs-modal
```
#### YARN
```shell
yarn add ng-bs-modal
```
### Step 2: Import the NgBsModalModule
```js
import { NgBsModalModule } from 'ng-bs-modal';

@NgModule({
  declarations: [...],
  imports: [NgBsModalModule],
  bootstrap: [...]
})
export class AppModule {}
```

### Step 3: Add ng-bs-modal tag
Add in `app-component.html`

```html
<ng-bs-modal></ng-bs-modal>
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

## Interfaces
```js
ModalService.open(content: NgBsModalContent | TemplateRef<any>, options?: NgBsModalOptions)

NgBsModalContent {
    body: TemplateRef<any> | string,
    header?: TemplateRef<any> | string,
    footer?: TemplateRef<any>
}

NgBsModalOptions {
    disabledBodyScroll?: boolean;
    size?: 'sm' | 'lg' | 'xl',
    staticBackdrop?: boolean,
    withoutClose?: boolean,
    customClass?: {
        modal?: string;
        modalHeader?: string,
        modalBody?: string;
        modalFooter?: string,
    }
}
```
