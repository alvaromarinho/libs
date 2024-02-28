import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent {

    toggleNav?: boolean;

    pages: any = {
        ngBsCalendar: true,
        ngBsModalService: false,
        ngBsToastService: false,
        ngCollapse: false,
        ngDdFile: false,
        ngGenerateTable: false,
    }
    
    changePage(page: string) {
        this.toggleNav = false;
        Object.keys(this.pages).map((key) => {
            this.pages[key] = page == key ? true : false;
        });
    }

}
