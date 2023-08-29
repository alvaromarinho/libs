import { Component, Input } from '@angular/core';

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
    templateUrl: 'ng-generate-table.component.html',
    styles: [`
        table { position: relative; table-layout: auto; width: 100%; border-collapse: collapse; }
        .table-spinner { position: absolute; top: 0; bottom: 0; display: flex; align-items: center; justify-content: center; width: 100%; background-color: rgba(255,255,255,.75); z-index: 1; }
        .spinner-border { display: inline-block; width: 2rem; height: 2rem; vertical-align: -0.125em; border: 0.25em solid currentcolor; border-right-color: transparent; border-radius: 50%; animation: 0.75s linear infinite spinner-border; }
        .no-data { text-align: center }
        @keyframes spinner-border { to { transform: rotate(360deg); } }
    `]
})
export class NgGenerateTableComponent {

    @Input() data!: any[];
    @Input() columns!: NgGenerateTableColumns[];

    @Input() loading?: boolean;
    @Input() tableClass?: string;

}
