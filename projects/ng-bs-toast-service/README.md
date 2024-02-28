# NgBsToastService
Toast Service for Angular and Bootstrap 5.

## Getting started
### Step 1: Install `ng-bs-toast-service`

#### NPM
```shell
npm install --save ng-bs-toast-service
```
#### YARN
```shell
yarn add ng-bs-toast-service
```
### Step 2: Import the NgBsToastServiceModule
```js
import { NgBsToastServiceModule } from 'ng-bs-toast-service';

@NgModule({
  declarations: [...],
  imports: [NgBsToastServiceModule],
  bootstrap: [...]
})
export class AppModule {}
```

### Step 3: Add ng-bs-toast-service tag
Add in `app-component.html`

```html
<ng-bs-toast-service></ng-bs-toast-service>
```

### Usage
Data source:
```js
constructor(private toastService: NgBsToastService) {}

showToast() {
    this.toastService.send('Titulo 1', 'Message 1', 'primary');
}
```

In template:
```html
<button type="button" class="btn btn-primary" (click)="showToast()">Show Toast</button>
```

### Interfaces
```js
ToastService.send(title: string, message: string | null, style?: 'success' | 'warning' | 'danger' | 'primary')
```
