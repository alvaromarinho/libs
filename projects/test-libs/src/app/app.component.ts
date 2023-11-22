import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent {

    loading = false;

    calendar = [{
        id: 123,
        start: '2023-11-21T09:00:00',
        end: '2023-11-21T14:00:00',
        title: 'title 1',
        description: 'description 1',
        color: '#ff0000cc'
    }, {
        id: 456,
        start: '2023-11-23T13:00:00',
        end: '2023-11-25T17:00:00',
        title: 'title 2',
        description: 'description 2',
        color: '#0000ffcc'
    }]

    log($event: any) {
        // this.loading = true;
        // setTimeout(() => {
            console.log($event)
    //         this.loading = false;
    //     }, 2000)
    }

}
