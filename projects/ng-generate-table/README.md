# NgGenerateTable
Generate table for Angular

## Getting started
### Step 1: Install `ng-generate-table`

#### NPM
```shell
npm install --save ng-generate-table
```
#### YARN
```shell
yarn add ng-generate-table
```
### Step 2: Import the NgGenerateTableModule
```js
import { NgGenerateTableModule } from 'ng-generate-table';

@NgModule({
    declarations: [...],
    imports: [NgGenerateTableModule],
    bootstrap: [...]
})
export class AppModule {}
```

## Usage

@Inputs and @Outputs
```js
@Input() data: any[];
@Input() columns: NgGenerateTableColumns[];
@Input() tableClass?: string;
@Input() loading?: boolean;
@Input() mobileView?: boolean;
@Input() rowClickable?: boolean;
@Output() rowClick = new EventEmitter();
```
Columns Interface:
```js
NgGenerateTableColumns {
    label?: string;
    field?: string;
    thClass?: string;
    tdClass?: string;
    pipe?: any;
    pipeArgs?: any[];
    template?: Function;
    click?: Function;
    isAction?: boolean;
}
```

In template:
```html
<ng-generate-table [columns]="columns" [data]="data"></ng-generate-table>
```

Data source:
```js
data: CustomData[] = [
    { name: 'Álvaro', email: 'alvaro@email.com', date: '2023-08-23' },
    { name: 'Marinho', email: 'marinho@email.com', date: '2023-08-23' },
]
```

### Simple example
```js
columns: NgGenerateTableColumns[] = [
    { label: 'Name', field: 'name' },
    { label: 'Email', field: 'email' },
    { label: 'Data', field: 'date' },
]
```

### Custom template
```js
columns: NgGenerateTableColumns[] = [
    { label: 'Name', field: 'name' },
    { label: 'Email', field: 'email' },
    { label: 'Data', field: 'date' },
    {
        template: (rowData: CustomData) => `<button type="button">Click to show ${rowData.name}'s email</button>`,
        click: (rowData: CustomData, event?: MouseEvent) => alert(rowData.email)
    }
]
```

### With Angular PIPE`s and custom CLASS
```js
columnsClassAndPipe: NgGenerateTableColumns[] = [
    { label: 'Name', field: 'name', thClass: 'text-red', tdClass: 'bg-dark' },
    { label: 'Email', field: 'email', thClass: 'text-red' },
    { field: 'date', pipe: DatePipe },
    { field: 'date', pipe: DatePipe, pipeArgs: ['dd MMM yyyy'] },
]
```

### Loading and TableClass
```html
<ng-generate-table [columns]="columns" [data]="data" [loading]="true" [tableClass]="custom-table"></ng-generate-table>
```

### Card Mobile View
#### default view
```html
<ng-generate-table [mobileView]="mobileView" [columns]="columns" [data]="data">
</ng-generate-table>
```

#### custom view
```html
<ng-generate-table [mobileView]="mobileView" [columns]="columns" [data]="data">
    <ng-template #cardMobile let-rowData>
        ...
    </ng-template>
</ng-generate-table>
```

### Clickable row
```html
<ng-generate-table [columns]="columns" [data]="data" [rowClickable]="true" (rowClick)="rowClick($event)"></ng-generate-table>
```

### Custom `<thead>` `<tbody>` `<tfooter>`
```html
<ng-generate-table [columns]="columns" [data]="data">
    <!-- above the thead -->
    <thead position="top"> 
        <tr>
            <th colspan="6">Manual &lt;thead&gt; (top)</th>
        </tr>
    </thead>
    <!-- below the thead -->
    <thead position="bottom">
        <tr>
            <th colspan="6">Manual &lt;thead&gt; (bottom)</th>
        </tr>
    </thead>

    <!-- above the tbody -->
    <tbody position="top">
        <tr>
            <td colspan="6">Manual &lt;tbody&gt; (top)</td>
        </tr>
    </tbody>
    <!-- below the tbody -->
    <tbody position="bottom">
        <tr>
            <td colspan="6">Manual &lt;tbody&gt; (bottom)</td>
        </tr>
    </tbody>

    <tfoot>
        <tr>
            <td colspan="6">Manual &lt;tfoot&gt;</td>
        </tr>
    </tfoot>
</ng-generate-table>
```

## Custom styles
If your custom class doesn't work, use the `/deep/` selector

```css
/deep/ .text-red { color: red; }
```
