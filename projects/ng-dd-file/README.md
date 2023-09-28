# NgDdFile
Drag and Drop File for Angular

## Getting started
### Step 1: Install `ng-dd-file`

#### NPM
```shell
npm install --save ng-dd-file
```
#### YARN
```shell
yarn add ng-dd-file
```
### Step 2: Import the NgDdFileModule
```js
import { NgDdFileModule } from 'ng-dd-file';

@NgModule({
  declarations: [...],
  imports: [NgDdFileModule],
  bootstrap: [...]
})
export class AppModule {}
```

### Usage
In template use `ng-dd-file` component with your options

```html
<ng-dd-file 
    [btnClass]="{ file: 'text-red' }"
    [filesList]="filesList" 
    [labels]="{ text: 'Arraste e solte os arquivos', btn: 'SELECIONE O ARQUIVO' }"
    [maxFiles]="3"
    [maxFileSize]="200"
    [maxTotalSize]="300"
    [multiple]="true"
    typeFileAccept="*"

    (fileError)="fileError($event)"
    (fileRemove)="fileRemove($event)" 
    (filesAdd)="filesAdd($event)" 
></ng-dd-file>
```

## API
### Inputs
| Input  | Type | Default | Description |
| ---------------- | -------------------------------- | ----- | ------------------------------------------------- |
| [btnClass]       | { file: string, remove: string } |   -   | Custom class for `input:file` and `button:remove` |
| [filesList]      | any[]                            |   -   | List of files                                     |
| [labels]         | { text: string, btn: string }    | { text: 'Arraste e solte os arquivos', btn: 'SELECIONE O ARQUIVO' } | Text and button labels |
| [maxFiles]       | number                           |   -   | Maximum files allowed               |
| [maxFileSize]    | number (`kB`)                    |   -   | Maximum size of each file           |
| [maxTotalSize]   | number (`kB`)                    |   -   | Maximum size of all file            |
| [multiple]       | boolean                          | false | Allowed to add more than one file   |
| [typeFileAccept] | string                           |   *   | Same as HTML attribute: accept      |

### Outputs

| Output  | Description |
| ------------- | ----------- |
| (fileError)   | Fired when `[maxFileSize]` or `[maxTotalSize]` |
| (fileRemove)  | Fired when `button:remove` is clicked |
| (filesAdd)    | Fired when `File` is add |


## Custom styles
If your custom class doesn't work, use the `/deep/` selector

```css
/deep/ .text-red { color: red; }
```
