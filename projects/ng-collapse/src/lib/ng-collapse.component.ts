import { Component, Input } from '@angular/core';

@Component({
    selector: 'ng-collapse',
    template: `
        <div class="ng-collapse" [ngClass]="{'show': toggle}">
            <ng-content></ng-content>
        </div>
    `,
    styles: [`
        .ng-collapse { max-height: 0; overflow: hidden; transition: max-height 0.3s; }
        .ng-collapse.show { max-height: 100vh; transition: max-height 0.5s ease-in; }
    `]
})
export class NgCollapseComponent {

    @Input() toggle?: boolean;
    @Input() time?: boolean;

}
