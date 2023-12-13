import { Component, Input } from '@angular/core';

@Component({
    selector: 'ng-collapse',
    template: `
        <div class="ng-collapse" [ngClass]="{'show': getToggle(), 'overflow': overflow}">
            <ng-content></ng-content>
        </div>
    `,
    styles: [`
        .ng-collapse { max-height: 0; overflow: hidden; transition: max-height 0.3s; }
        .ng-collapse.show { max-height: 100vh; transition: max-height 0.5s ease-in; }
        .ng-collapse.show.overflow { overflow: visible }
    `]
})
export class NgCollapseComponent {

    @Input() toggle?: boolean;
    protected overflow?: boolean;

    getToggle() {
        if (this.toggle) {
            setTimeout(() => this.overflow = true, 500);
        } else {
            this.overflow = false
        }

        return this.toggle;
    }

}
