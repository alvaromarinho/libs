# NgCollapse
Collapse for Angular

## Getting started
### Step 1: Install `ng-collapse`

#### NPM
```shell
npm install --save ng-collapse
```
#### YARN
```shell
yarn add ng-collapse
```
### Step 2: Import the NgCollapseModule
```js
import { NgCollapseModule } from 'ng-collapse';

@NgModule({
  declarations: [...],
  imports: [NgCollapseModule],
  bootstrap: [...]
})
export class AppModule {}
```

### Usage
In template use `ng-collapse` component with your options. The `toggle` attribute controls the opening or closing of the collapse

```html
<button (click)="toggle = !toggle">Toggle Collapse</button>
<ng-collapse [toggle]="toggle">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. 
    Quasi expedita quisquam necessitatibus vitae maxime temporibus minima ex officia 
    nostrum aspernatur deserunt dolorum quaerat sunt aliquam, repudiandae non in fugit! Tempore.
</ng-collapse>
```
