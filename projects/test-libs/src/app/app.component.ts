import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent {

    pages: any = {
        ngBsModalService: true,
        ngBsCalendar: false,
        ngGenerateTable: false,
        ngDdFile: false,
        ngCollapse: false
    }
    
    changePage(page: string) {
        Object.keys(this.pages).map((key) => {
            this.pages[key] = page == key ? true : false;
        });
    }

}
