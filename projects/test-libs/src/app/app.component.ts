import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    ngOnInit() { }

    log($event: any) {
        console.log($event);
    }

}
