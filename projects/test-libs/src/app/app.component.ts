import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { NgGenerateTableColumns } from 'ng-generate-table';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styles: [`
        /deep/ .dark { background-color: black; color: white; }
        /deep/ .bg-gray { background-color: #ddd; }
        /deep/ .text-red { color: red; }
    `],
    providers: [DatePipe]
})
export class AppComponent {

    files?: any[]

    data = [
        { name: 'Álvaro', email: 'alvaro@email.com', date: '2023-08-23' },
        { name: 'Marinho', email: 'marinho@email.com', date: '2023-08-23' },
    ]

    columns: NgGenerateTableColumns[] = [
        { label: 'Name', field: 'name' },
        { label: 'Email', field: 'email' },
        { label: 'Data', field: 'date' },
    ]

    columnsTemplate: NgGenerateTableColumns[] = [
        { label: 'Name', field: 'name' },
        { label: 'Email', field: 'email' },
        { label: 'Data', field: 'date' },
        {
            template: (rowData: any) => `<button type="button">Click to show ${rowData.name}'s email</button>`,
            click: (rowData: any) => alert(rowData.email)
        }
    ]

    columnsClassAndPipe: NgGenerateTableColumns[] = [
        { label: 'Name', field: 'name', thClass: 'text-red', tdClass: 'dark' },
        { label: 'Email', field: 'email', tdClass: 'dark' },
        { field: 'date', pipe: DatePipe },
        { field: 'date', pipe: DatePipe, pipeArgs: ['dd MMM yyyy'] },
    ]

    rowClick(rowData : any) {
        alert(rowData.email)
    }

    filesAdd($event: any) {
        this.files = this.files ? [...this.files, ...$event] : $event
    }

    error($event: string) {
        alert($event)
    }

    toggle?: boolean;
}
