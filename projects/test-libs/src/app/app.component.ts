import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgCollapseComponent } from 'ng-collapse';
import { NgBsModalServiceComponent } from 'ng-bs-modal-service';
import { NgBsToastServiceComponent } from 'ng-bs-toast-service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        NgCollapseComponent,
        NgBsModalServiceComponent,
        NgBsToastServiceComponent,
    ]
})
export class AppComponent {
    toggleNav = signal(false);

    navItems: { path: string; label: string; icon: string; }[] = [
        { path: 'ng-bs-calendar', label: 'ng-bs-calendar', icon: 'bi-calendar3' },
        { path: 'ng-bs-modal-service', label: 'ng-bs-modal-service', icon: 'bi-window-stack' },
        { path: 'ng-bs-toast-service', label: 'ng-bs-toast-service', icon: 'bi-bell' },
        { path: 'ng-bs-pagination', label: 'ng-bs-pagination', icon: 'bi-arrow-left-right' },
        { path: 'ng-collapse', label: 'ng-collapse', icon: 'bi-arrows-collapse' },
        { path: 'ng-dd-file', label: 'ng-dd-file', icon: 'bi-cloud-upload' },
        { path: 'ng-month-year-picker', label: 'ng-month-year-picker', icon: 'bi-calendar-month' },
        { path: 'ng-generate-table', label: 'ng-generate-table', icon: 'bi-table' },
    ];
}
