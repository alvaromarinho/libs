import { AfterViewInit, Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgCollapseComponent } from 'ng-collapse';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { GTSimpleExampleComponent } from './examples/simple/simple.component';
import { GTManualTagsComponent } from './examples/manual-tags/manual-tags.component';
import { GTRowClickExampleComponent } from './examples/row-click/row-click.component';
import { GTClassPipeExampleComponent } from './examples/class-pipe/class-pipe.component';
import { GTLoadingEmptyExampleComponent } from './examples/loading-empty/loading-empty.component';
import { GTMobileCardExampleComponent } from './examples/mobile-card/mobile-card.component';
import { GTExpandableRowsExampleComponent } from './examples/expandable-rows/expandable-rows.component';

declare const Prism: any;

type GTTab = 'simple' | 'manual' | 'rowClick' | 'classPipe' | 'loadingEmpty' | 'mobileCard' | 'expandableRows';

@Component({
    selector: 'generate-table-examples',
    standalone: true,
    imports: [
        NgCollapseComponent,
        PageHeaderComponent,
        GTSimpleExampleComponent,
        GTManualTagsComponent,
        GTRowClickExampleComponent,
        GTClassPipeExampleComponent,
        GTLoadingEmptyExampleComponent,
        GTMobileCardExampleComponent,
        GTExpandableRowsExampleComponent,
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './ng-generate-table.component.html'
})
export class GenerateTableExamplesComponent implements AfterViewInit {

    toggleCode = signal(false);
    activeTab = signal<GTTab>('simple');

    ngAfterViewInit() {
        Prism.highlightAll();
    }
}
