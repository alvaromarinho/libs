import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { NgGenerateTableColumns } from 'ng-generate-table';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styles: [`
        /deep/ .dark { background-color: black; color: white; }
        /deep/ .text-red { color: red; }
    `],
    providers: [DatePipe]
})
export class AppComponent {

    filesIn?: any[]

    data = [
        { name: 'Álvaro', email: 'alvaro@email.com', date: '2023-08-23' },
        { name: 'Marinho', email: 'marinho@email.com', date: '2023-08-23' },
    ]

    columns: NgGenerateTableColumns[] = [
        { label: 'Name', field: 'name' },
        { label: 'Email', field: 'email' },
        { label: 'Data', field: 'date' },
        {
            template: (rowData: any) => `<button type="button">Click to show ${rowData.name}'s email</button>`,
            click: (rowData: any) => alert(rowData.email)
        }
    ]

    columnsManualTags: NgGenerateTableColumns[] = [
        { label: 'Name', field: 'name' },
        { label: 'Email', field: 'email' },
        { label: 'Data', field: 'date' },
    ]

    columnsClassAndPipe: NgGenerateTableColumns[] = [
        { label: 'Name', field: 'name', thClass: 'text-red', tdClass: 'dark' },
        { label: 'Email', field: 'email', tdClass: 'dark' },
        { field: 'date', pipe: DatePipe },
        { field: 'date', pipe: DatePipe, pipeArgs: ['dd MMM yyyy'] },
    ]

    filesOut($event: any) {
        this.filesIn = this.filesIn ? [...this.filesIn, ...$event] : $event
    }
}
