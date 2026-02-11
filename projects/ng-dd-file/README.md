# ng-dd-file

[![npm version](https://badge.fury.io/js/ng-dd-file.svg)](https://www.npmjs.com/package/ng-dd-file)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Drag and drop file upload component for Angular with multiple files support, file size validation, and automatic image preview.

## ✨ Features

- 📁 **Drag & Drop** - Intuitive drag and drop interface
- 🖱️ **Click to browse** - Traditional file picker support
- 📸 **Image preview** - Automatic base64 preview for images
- ✅ **File validation** - Size limits per file and total
- 📊 **Multiple files** - Support for single or multiple uploads
- 🎨 **Customizable** - Custom labels and CSS classes
- 🔍 **File type filter** - Accept specific file types
- ⚡ **Standalone component support** (Angular 14+)
- 🔧 **NgModule compatible** (backward compatible)

## 🔧 Compatibility

| ng-dd-file | Angular       | Standalone |
|------------|---------------|------------|
| 1.0.x      | 14.x - 18.x   | ✅ Yes     |
| 0.1.x      | 15.x          | ❌ No      |

## 📦 Installation

### NPM
```bash
npm install --save ng-dd-file
```

### YARN
```bash
yarn add ng-dd-file
```

## 🚀 Usage

### Method 1: Standalone Component (Angular 14+) ⚡ Recommended

**app.component.ts:**
```typescript
import { Component } from '@angular/core';
import { NgDdFileComponent } from 'ng-dd-file';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgDdFileComponent],
  template: `
    <ng-dd-file 
      [filesList]="filesList" 
      [multiple]="true"
      [maxFiles]="5"
      [maxFileSize]="2048"
      [labels]="{ text: 'Drag and drop files here', btn: 'BROWSE FILES' }"
      (filesAdd)="onFilesAdd($event)"
      (fileRemove)="onFileRemove($event)"
      (fileError)="onFileError($event)">
    </ng-dd-file>

    <div *ngFor="let file of filesList; let i = index">
      {{ file.name }} - {{ formatFileSize(file.size) }}
    </div>
  `
})
export class AppComponent {
  filesList: File[] = [];

  onFilesAdd(files: File[]) {
    this.filesList.push(...files);
    console.log('Files added:', files);
  }

  onFileRemove(event: { file: File, index: number }) {
    this.filesList.splice(event.index, 1);
    console.log('File removed:', event);
  }

  onFileError(error: FileError) {
    console.error('File error:', error);
    alert(`${error.message}${error.file ? ` (${error.file.name})` : ''}`);
  }

  formatFileSize(bytes: number): string {
    return bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(2) + ' KB';
  }
}
```

---

### Method 2: NgModule (Traditional) 🔧

**Step 1: Import the module**

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgDdFileModule } from 'ng-dd-file';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgDdFileModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

**Step 2: Use in your component**

**app.component.html:**
```html
<ng-dd-file 
  [btnClass]="{ file: 'custom-file-btn', remove: 'custom-remove-btn' }"
  [filesList]="filesList" 
  [labels]="{ text: 'Arraste e solte os arquivos', btn: 'SELECIONE O ARQUIVO' }"
  [maxFiles]="3"
  [maxFileSize]="200"
  [maxTotalSize]="300"
  [multiple]="true"
  typeFileAccept="image/*"
  (fileError)="fileError($event)"
  (fileRemove)="fileRemove($event)" 
  (filesAdd)="filesAdd($event)">
</ng-dd-file>

<div *ngFor="let file of filesList; let i = index">
  {{ file.name }}
</div>
```

**app.component.ts:**
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  filesList: any[] = [];

  filesAdd(files: any[]) {
    this.filesList.push(...files);
  }

  fileRemove(event: { file: any, index: number }) {
    this.filesList.splice(event.index, 1);
  }

  fileError(error: FileError) {
    console.error('File error:', error.type, error.message, error.file?.name);
    // Handle different error types
    switch(error.type) {
      case 'size':
        alert(`File "${error.file?.name}" is too large!`);
        break;
      case 'total':
        alert('Total file size limit exceeded!');
        break;
      case 'type':
        alert(`File type not allowed: ${error.file?.name}`);
        break;
    }
  }
}
```

---

## 📖 API Reference

### Inputs

| Input            | Type                              | Default | Description |
|------------------|-----------------------------------|---------|-------------|
| `btnClass`       | `{ file?: string, remove?: string }` | -    | Custom CSS classes for file input and remove button |
| `filesList`      | `any[]`                           | -       | Array of files to display |
| `labels`         | `{ text: string, btn: string }`   | `{ text: 'Arraste e solte os arquivos', btn: 'SELECIONE O ARQUIVO' }` | Drag area text and button label |
| `maxFiles`       | `number`                          | -       | Maximum number of files allowed |
| `maxFileSize`    | `number` (KB)                     | -       | Maximum size per file in kilobytes |
| `maxTotalSize`   | `number` (KB)                     | -       | Maximum total size of all files in kilobytes |
| `multiple`       | `boolean`                         | `false` | Allow multiple file selection |
| `typeFileAccept` | `string`                          | `'*'`   | File type filter (e.g., 'image/*', '.pdf', etc.) |

### Outputs

| Output       | Type                                                    | Description                    |
|--------------|---------------------------------------------------------|--------------------------------|
| `filesAdd`   | `EventEmitter<FileWithBase64[]>`                        | Emitted when files are added   |
| `fileRemove` | `EventEmitter<{ file: FileWithBase64, index: number }>` | Emitted when a file is removed |
| `fileError`  | `EventEmitter<FileError>`                               | Emitted when validation fails  |

### Interfaces

```typescript
interface FileWithBase64 extends File {
  base64?: string;  // Base64 string for image preview (automatically added for images)
  url?: string;     // Optional URL property
}

interface FileError {
  type: 'size' | 'total' | 'type';   // Error type
  message: string;                   // Error description
  file?: File;                       // The file that caused the error (when applicable)
}

---

## 💡 Examples

### Image Upload with Preview

```typescript
import { Component } from '@angular/core';
import { NgDdFileComponent } from 'ng-dd-file';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, NgDdFileComponent],
  template: `
    <ng-dd-file 
      [filesList]="images" 
      [multiple]="true"
      [maxFiles]="4"
      [maxFileSize]="5120"
      typeFileAccept="image/*"
      [labels]="{ text: 'Drop images here', btn: 'SELECT IMAGES' }"
      (filesAdd)="onImagesAdd($event)"
      (fileRemove)="onImageRemove($event)">
    </ng-dd-file>

    <div class="image-preview" *ngFor="let image of images">
      <img [src]="image.base64" alt="Preview" style="max-width: 200px;">
      <p>{{ image.name }}</p>
    </div>
  `
})
export class ImageUploadComponent {
  images: any[] = [];

  onImagesAdd(files: any[]) {
    this.images.push(...files);
  }

  onImageRemove(event: { file: any, index: number }) {
    this.images.splice(event.index, 1);
  }
}
```

### PDF Documents Only

```typescript
import { Component } from '@angular/core';
import { NgDdFileComponent } from 'ng-dd-file';

@Component({
  selector: 'app-pdf-upload',
  standalone: true,
  imports: [NgDdFileComponent],
  template: `
    <ng-dd-file 
      [filesList]="documents" 
      [multiple]="true"
      [maxFileSize]="10240"
      typeFileAccept=".pdf"
      [labels]="{ text: 'Drop PDF files', btn: 'SELECT PDFs' }"
      (filesAdd)="onPdfAdd($event)"
      (fileError)="onError($event)">
    </ng-dd-file>
  `
})
export class PdfUploadComponent {
  documents: File[] = [];

  onPdfAdd(files: File[]) {
    this.documents.push(...files);
  }

  onError(error: FileError) {
    alert(`${error.message}${error.file ? ` (${error.file.name})` : ''}`);
  }
}
```

### Single File Upload

```typescript
import { Component } from '@angular/core';
import { NgDdFileComponent } from 'ng-dd-file';

@Component({
  selector: 'app-single-upload',
  standalone: true,
  imports: [NgDdFileComponent],
  template: `
    <ng-dd-file 
      [filesList]="file ? [file] : []" 
      [multiple]="false"
      [maxFiles]="1"
      [labels]="{ text: 'Drop one file', btn: 'SELECT FILE' }"
      (filesAdd)="onFileAdd($event)">
    </ng-dd-file>

    <div *ngIf="file">
      Selected: {{ file.name }}
    </div>
  `
})
export class SingleUploadComponent {
  file: File | null = null;

  onFileAdd(files: File[]) {
    this.file = files[0];
  }
}
```

### Form Integration with Upload

```typescript
import { Component } from '@angular/core';
import { NgDdFileComponent } from 'ng-dd-file';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-upload',
  standalone: true,
  imports: [CommonModule, NgDdFileComponent],
  template: `
    <form (submit)="uploadFiles($event)">
      <ng-dd-file 
        [filesList]="files" 
        [multiple]="true"
        (filesAdd)="onFilesAdd($event)"
        (fileRemove)="onFileRemove($event)"
        (fileError)="onFileError($event)">
      </ng-dd-file>

      <button type="submit" [disabled]="files.length === 0">
        Upload {{ files.length }} file(s)
      </button>
    </form>

    <div *ngIf="uploading">Uploading...</div>
    <div *ngIf="uploadSuccess">Upload successful!</div>
    <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
  `
})
export class FormUploadComponent {
  files: File[] = [];
  uploading = false;
  uploadSuccess = false;
  error = '';

  constructor(private http: HttpClient) {}

  onFilesAdd(files: File[]) {
    this.files.push(...files);
    this.error = '';
  }

  onFileRemove(event: { file: File, index: number }) {
    this.files.splice(event.index, 1);
  }

  onFileError(error: FileError) {
    this.error = `${error.message}${error.file ? ` (${error.file.name})` : ''}`;
  }

  uploadFiles(event: Event) {
    event.preventDefault();
    this.uploading = true;

    const formData = new FormData();
    this.files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    this.http.post('/api/upload', formData).subscribe({
      next: () => {
        this.uploading = false;
        this.uploadSuccess = true;
        this.files = [];
      },
      error: (err) => {
        this.uploading = false;
        console.error('Upload error:', err);
      }
    });
  }
}
```

### File Size Validation

```typescript
import { Component } from '@angular/core';
import { NgDdFileComponent } from 'ng-dd-file';

@Component({
  selector: 'app-validated-upload',
  standalone: true,
  imports: [NgDdFileComponent],
  template: `
    <ng-dd-file 
      [filesList]="files" 
      [multiple]="true"
      [maxFiles]="10"
      [maxFileSize]="2048"
      [maxTotalSize]="10240"
      [labels]="{ 
        text: 'Max 2MB per file, 10MB total', 
        btn: 'SELECT FILES' 
      }"
      (filesAdd)="onFilesAdd($event)"
      (fileError)="onError($event)">
    </ng-dd-file>

    <div class="error" *ngIf="errorMessage">
      {{ errorMessage }}
    </div>
  `
})
export class ValidatedUploadComponent {
  files: File[] = [];
  errorMessage = '';

  onFilesAdd(files: File[]) {
    this.files.push(...files);
    this.errorMessage = '';
  }

  onError(error: FileError) {
    this.errorMessage = `${error.message}${error.file ? ` (${error.file.name})` : ''}`;
    setTimeout(() => this.errorMessage = '', 5000);
  }
}
```

---

## 🎨 Customization

### Custom Styling

```html
<ng-dd-file 
  [btnClass]="{ 
    file: 'my-file-button', 
    remove: 'my-remove-button' 
  }">
</ng-dd-file>
```

```css
/* Use ::ng-deep for deep styling */
::ng-deep .my-file-button {
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
}

::ng-deep .my-remove-button {
  background: #dc3545;
  color: white;
}
```

### Custom Labels (Internationalization)

```typescript
// English
labels = { text: 'Drag and drop files here', btn: 'BROWSE' }

// Portuguese
labels = { text: 'Arraste e solte os arquivos', btn: 'SELECIONAR' }

// Spanish
labels = { text: 'Arrastra y suelta archivos aquí', btn: 'EXAMINAR' }
```

---

## 🌍 Complete Standalone Example

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { NgDdFileComponent } from 'ng-dd-file';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgDdFileComponent],
  template: `
    <div class="container">
      <h1>File Upload Demo</h1>
      
      <ng-dd-file 
        [filesList]="files" 
        [multiple]="true"
        [maxFiles]="5"
        [maxFileSize]="5120"
        [maxTotalSize]="20480"
        typeFileAccept="image/*,.pdf"
        [labels]="{ 
          text: 'Drag and drop or click to upload', 
          btn: 'SELECT FILES' 
        }"
        [btnClass]="{ file: 'btn-primary', remove: 'btn-danger' }"
        (filesAdd)="onFilesAdd($event)"
        (fileRemove)="onFileRemove($event)"
        (fileError)="onError($event)">
      </ng-dd-file>

      <div class="error" *ngIf="error">{{ error }}</div>

      <div class="files-list" *ngIf="files.length > 0">
        <h3>Uploaded Files ({{ files.length }})</h3>
        <div class="file-item" *ngFor="let file of files; let i = index">
          <img *ngIf="file.base64" [src]="file.base64" alt="preview">
          <div class="file-info">
            <strong>{{ file.name }}</strong>
            <span>{{ formatSize(file.size) }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .error { color: red; margin: 10px 0; }
    .files-list { margin-top: 20px; }
    .file-item { display: flex; gap: 10px; padding: 10px; border: 1px solid #ddd; margin: 5px 0; }
    .file-item img { width: 50px; height: 50px; object-fit: cover; }
  `]
})
export class AppComponent {
  files: any[] = [];
  error = '';

  onFilesAdd(files: any[]) {
    this.files.push(...files);
    this.error = '';
  }

  onFileRemove(event: { file: any, index: number }) {
    this.files.splice(event.index, 1);
  }

  onError(error: FileError) {
    // Build detailed error message
    let errorMsg = error.message;
    
    if (error.file) {
      errorMsg += ` (File: ${error.file.name})`;
    }
    
    this.error = errorMsg;
    setTimeout(() => this.error = '', 5000);
    
    // Log for debugging
    console.error('File Error:', {
      type: error.type,
      message: error.message,
      file: error.file?.name
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }
}
```

---

## ⚠️ Important Notes

1. **File sizes are in KB**: `maxFileSize` and `maxTotalSize` are specified in kilobytes (KB).

2. **Image preview**: Images (png, jpg, jpeg) automatically get a `base64` property for preview.

3. **File validation**: Errors are thrown when limits are exceeded - make sure to handle the `fileError` event.

4. **Accept types**: Use standard HTML accept patterns: `'image/*'`, `'.pdf,.doc'`, etc.

5. **Error handling**: The `fileError` event returns a `FileError` object with `type`, `message`, and optionally `file` properties, allowing for detailed error handling and user feedback.

---

## 📄 License

MIT © Alvaro Marinho

## 🐛 Issues

Report issues at: https://github.com/alvaromarinho/libs/issues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.