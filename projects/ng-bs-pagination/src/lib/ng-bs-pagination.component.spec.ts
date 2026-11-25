import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgBsPaginationComponent } from './ng-bs-pagination.component';
import { PaginationFirstLast, PaginationLayout, PaginationPrevNext } from './ng-bs-pagination.model';

@Component({
    standalone: true,
    imports: [NgBsPaginationComponent],
    template: `
        <ng-bs-pagination [total]="total()" [current]="current()" [itemPerPage]="itemPerPage()" [maxPagesToShow]="maxPagesToShow()"
            [size]="size()" [layout]="layout()" [prevNext]="prevNext()" [firstLast]="firstLast()"
            (change)="onChange($event)" (first)="onChange($event)" (last)="onChange($event)">
        </ng-bs-pagination>
    `
})
class HostComponent {

    readonly total = signal(200);
    readonly current = signal(1);
    readonly itemPerPage = signal(10);
    readonly maxPagesToShow = signal(5);
    readonly size = signal<'sm' | 'md' | 'lg'>('md');
    readonly layout = signal<PaginationLayout | undefined>(undefined);
    readonly prevNext = signal<PaginationPrevNext | undefined>(undefined);
    readonly firstLast = signal<PaginationFirstLast | undefined>(undefined);
    readonly emitted: number[] = [];

    onChange(page: number): void {
        this.emitted.push(page);
        this.current.set(page);
    }

}

@Component({
    standalone: true,
    imports: [NgBsPaginationComponent],
    template: `
        <ng-bs-pagination [total]="45" [current]="2">
            <ng-template let-start="start" let-end="end" let-total="total" let-totalPages="totalPages">
                <span class="custom-info">{{ start }}-{{ end }}/{{ total }} ({{ totalPages }})</span>
            </ng-template>
        </ng-bs-pagination>
    `
})
class TemplateHostComponent {

}

describe('NgBsPaginationComponent', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    const el = (): HTMLElement => fixture.nativeElement;
    const pageNumbers = (): number[] => Array.from(el().querySelectorAll('.page-item:not([title]) .page-link'))
        .map(b => Number(b.textContent)).filter(n => !isNaN(n) && n > 0);
    const numbered = (): HTMLButtonElement[] => Array.from(el().querySelectorAll<HTMLButtonElement>('.page-link'))
        .filter(b => !b.title);
    const byTitle = (title: string): HTMLButtonElement => el().querySelector<HTMLButtonElement>(`.page-link[title="${title}"]`)!;
    const info = (): string => el().querySelector('.text-muted')?.textContent?.trim() ?? '';
    const wrapper = (): HTMLElement => el().querySelector('ng-bs-pagination > div')!;

    const set = async (fn: () => void): Promise<void> => {
        fn();
        await fixture.whenStable();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HostComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(el().querySelector('.pagination')).toBeTruthy();
    });

    describe('total pages', () => {
        it('rounds up partial pages', async () => {
            await set(() => {
                host.total.set(95);
                host.current.set(10);
            });
            expect(pageNumbers().at(-1)).toBe(10);
        });

        it('renders nothing when there is a single page or no items', async () => {
            await set(() => host.total.set(5));
            expect(el().querySelector('.pagination')).toBeNull();
            await set(() => host.total.set(0));
            expect(el().querySelector('.pagination')).toBeNull();
        });
    });

    describe('pages window', () => {
        it('centers the window on current', async () => {
            await set(() => host.current.set(10));
            expect(pageNumbers()).toEqual([8, 9, 10, 11, 12]);
        });

        it('clamps at the start', () => {
            expect(pageNumbers()).toEqual([1, 2, 3, 4, 5]);
        });

        it('clamps at the end', async () => {
            await set(() => host.current.set(20));
            expect(pageNumbers()).toEqual([16, 17, 18, 19, 20]);
        });

        it('shows fewer pages when totalPages < maxPagesToShow', async () => {
            await set(() => host.total.set(25));
            expect(pageNumbers()).toEqual([1, 2, 3]);
        });

        it('respects maxPagesToShow', async () => {
            await set(() => {
                host.maxPagesToShow.set(3);
                host.current.set(10);
            });
            expect(pageNumbers()).toEqual([9, 10, 11]);
        });

        it('marks the current page as active', async () => {
            await set(() => host.current.set(2));
            expect(el().querySelector('.page-item.active')?.textContent?.trim()).toBe('2');
        });
    });

    describe('info', () => {
        it('shows start/end for a middle page', async () => {
            await set(() => host.current.set(3));
            expect(info()).toBe('Mostrando 21–30 de 200');
        });

        it('clamps end on the last page', async () => {
            await set(() => {
                host.total.set(95);
                host.current.set(10);
            });
            expect(info()).toBe('Mostrando 91–95 de 95');
        });

        it('hides when layout.showInfo is false', async () => {
            await set(() => host.layout.set({ showInfo: false }));
            expect(el().querySelector('.text-muted')).toBeNull();
        });

        it('renders a projected template with the info context', async () => {
            const custom = TestBed.createComponent(TemplateHostComponent);
            await custom.whenStable();
            expect(custom.nativeElement.querySelector('.custom-info')?.textContent).toBe('11-20/45 (5)');
        });
    });

    describe('inputs merge with defaults', () => {
        it('layout merges partial values (default is stacked, info at start)', async () => {
            expect(wrapper().classList).toContain('flex-column');
            await set(() => host.layout.set({ infoPosition: 'end' }));
            expect(wrapper().classList).toContain('flex-column');
            expect(wrapper().classList).toContain('flex-column-reverse');
        });

        it('prevNext merges nested labels', async () => {
            await set(() => host.prevNext.set({ mode: 'text', labels: { prev: 'Anterior' } }));
            expect(byTitle('Página anterior').textContent?.trim()).toBe('Anterior');
            expect(byTitle('Próxima página').textContent?.trim()).toBe('›');
            expect(byTitle('Página anterior').querySelector('span')?.getAttribute('aria-hidden')).toBeNull();
        });

        it('icon mode hides the label from screen readers', () => {
            expect(byTitle('Página anterior').querySelector('span')?.getAttribute('aria-hidden')).toBe('true');
        });

        it('firstLast merges nested labels and can hide the buttons', async () => {
            expect(byTitle('Primeira página').textContent?.trim()).toBe('«');
            expect(byTitle('Última página').textContent?.trim()).toBe('»');
            await set(() => host.firstLast.set({ show: false }));
            expect(byTitle('Primeira página')).toBeNull();
        });

        it('goes back to defaults when the input is cleared', async () => {
            await set(() => host.prevNext.set({ labels: { prev: 'Anterior' } }));
            await set(() => host.prevNext.set(undefined));
            expect(byTitle('Página anterior').textContent?.trim()).toBe('‹');
        });
    });

    describe('navigation', () => {
        beforeEach(async () => {
            await set(() => {
                host.total.set(100);
                host.current.set(5);
            });
        });

        it('emits change when clicking a page', async () => {
            numbered().find(b => b.textContent?.trim() === '6')!.click();
            await fixture.whenStable();
            expect(host.emitted).toEqual([6]);
            expect(el().querySelector('.page-item.active')?.textContent?.trim()).toBe('6');
        });

        it('emits change for prev and next', async () => {
            byTitle('Página anterior').click();
            await fixture.whenStable();
            byTitle('Próxima página').click();
            expect(host.emitted).toEqual([4, 5]);
        });

        it('does not emit for the current page', () => {
            numbered().find(b => b.textContent?.trim() === '5')!.click();
            expect(host.emitted).toEqual([]);
        });

        it('does not go below the first or past the last page', async () => {
            await set(() => host.current.set(1));
            byTitle('Página anterior').click();
            byTitle('Primeira página').click();
            await set(() => host.current.set(10));
            byTitle('Próxima página').click();
            byTitle('Última página').click();
            expect(host.emitted).toEqual([]);
        });

        it('disables first/prev on the first page and next/last on the last', async () => {
            await set(() => host.current.set(1));
            expect(byTitle('Primeira página').parentElement!.classList).toContain('disabled');
            expect(byTitle('Página anterior').parentElement!.classList).toContain('disabled');
            expect(byTitle('Próxima página').parentElement!.classList).not.toContain('disabled');
        });

        it('first emits 1 and last emits totalPages', () => {
            byTitle('Primeira página').click();
            expect(host.emitted).toEqual([1]);
            byTitle('Última página').click();
            expect(host.emitted).toEqual([1, 10]);
        });
    });

    describe('css classes', () => {
        it('size adds pagination-sm/lg and nothing for md', async () => {
            const ul = (): Element => el().querySelector('ul')!;
            expect(ul().className).toBe('pagination mb-0');
            await set(() => host.size.set('sm'));
            expect(ul().classList).toContain('pagination-sm');
            expect(ul().classList).toContain('pagination');
            await set(() => host.size.set('lg'));
            expect(ul().classList).toContain('pagination-lg');
            expect(ul().classList).not.toContain('pagination-sm');
        });

        it('center layout centers without flex-column', async () => {
            await set(() => host.layout.set({ type: 'center' }));
            expect(wrapper().classList).toContain('justify-content-center');
            expect(wrapper().classList).toContain('gap-3');
            expect(wrapper().classList).not.toContain('flex-column');
        });

        it('split layout with info at end reverses the row', async () => {
            await set(() => host.layout.set({ type: 'split', infoPosition: 'end' }));
            expect(wrapper().classList).toContain('justify-content-between');
            expect(wrapper().classList).toContain('flex-row-reverse');
        });
    });
});
