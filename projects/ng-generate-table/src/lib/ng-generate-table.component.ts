import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface NgGenerateTableColumns {
    label?: string,
    field?: string,

    thClass?: string,
    tdClass?: string,

    pipe?: any,
    pipeArgs?: any[],

    template?: Function,
    click?: Function
}

@Component({
    selector: 'ng-generate-table',
    templateUrl: './ng-generate-table.component.html',
    styleUrls:['./ng-generate-table.component.css']
})
export class NgGenerateTableComponent {

    @Input() data!: any[];
    @Input() columns!: NgGenerateTableColumns[];
    @Input() tableClass?: string;
    @Input() loading?: boolean;
    @Input() rowClickable?: boolean;
    @Output() rowClick = new EventEmitter();

}
