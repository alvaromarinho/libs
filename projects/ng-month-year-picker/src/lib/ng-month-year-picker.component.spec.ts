import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgMonthYearPickerComponent } from './ng-month-year-picker.component';

const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

@Component({
    standalone: true,
    imports: [NgMonthYearPickerComponent],
    template: `
        <ng-month-year-picker [value]="value()" [label]="label()" [disabled]="disabled()" [monthNames]="monthNames()"
            [todayLabel]="todayLabel()" (valueChange)="onChange($event)">
        </ng-month-year-picker>
    `
})
class HostComponent {

    readonly value = signal('');
    readonly label = signal<string | undefined>(undefined);
    readonly disabled = signal(false);
    readonly monthNames = signal(['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']);
    readonly todayLabel = signal('Hoje');
    readonly emitted: string[] = [];

    onChange(value: string): void {
        this.emitted.push(value);
    }

}

@Component({
    standalone: true,
    imports: [NgMonthYearPickerComponent],
    template: `<ng-month-year-picker [(value)]="value"></ng-month-year-picker>`
})
class TwoWayHostComponent {

    value = '2020-03';

}

describe('NgMonthYearPickerComponent', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    const el = (): HTMLElement => fixture.nativeElement;
    const trigger = (): HTMLButtonElement => el().querySelector('.trigger')!;
    const dropdown = (): HTMLElement | null => el().querySelector('.dropdown');
    const year = (): string => el().querySelector('.year')!.textContent!.trim();
    const months = (): HTMLButtonElement[] => Array.from(el().querySelectorAll('.month-btn'));
    const navButtons = (): HTMLButtonElement[] => Array.from(el().querySelectorAll('.nav-btn'));

    const open = async (): Promise<void> => {
        trigger().click();
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
        expect(trigger()).toBeTruthy();
        expect(dropdown()).toBeNull();
    });

    describe('label', () => {
        it('shows the explicit label when set', async () => {
            host.label.set('Custom');
            host.value.set('2026-05');
            await fixture.whenStable();
            expect(trigger().textContent!.trim()).toBe('Custom');
        });

        it('derives the label from value and monthNames', async () => {
            host.value.set('2026-05');
            await fixture.whenStable();
            expect(trigger().textContent!.trim()).toBe('Mai 2026');
        });

        it('is empty when value is empty or invalid', async () => {
            expect(trigger().textContent!.trim()).toBe('');
            host.value.set('not-a-date');
            await fixture.whenStable();
            expect(trigger().textContent!.trim()).toBe('');
        });

        it('respects custom monthNames', async () => {
            host.monthNames.set(EN_MONTHS);
            host.value.set('2024-01');
            await fixture.whenStable();
            expect(trigger().textContent!.trim()).toBe('January 2024');
        });
    });

    describe('toggle', () => {
        it('opens the picker on the year of value', async () => {
            host.value.set('2020-03');
            await fixture.whenStable();
            await open();
            expect(dropdown()).toBeTruthy();
            expect(year()).toBe('2020');
        });

        it('opens on the current year when value is empty', async () => {
            await open();
            expect(year()).toBe(String(new Date().getFullYear()));
        });

        it('closes when already open', async () => {
            await open();
            await open();
            expect(dropdown()).toBeNull();
        });

        it('does nothing when disabled', async () => {
            host.disabled.set(true);
            await fixture.whenStable();
            expect(trigger().disabled).toBe(true);
            trigger().dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await fixture.whenStable();
            expect(dropdown()).toBeNull();
        });
    });

    describe('year navigation', () => {
        it('changes only the browsed year', async () => {
            host.value.set('2026-05');
            await fixture.whenStable();
            await open();

            navButtons()[0].click();
            await fixture.whenStable();
            expect(year()).toBe('2025');

            navButtons()[1].click();
            navButtons()[1].click();
            await fixture.whenStable();
            expect(year()).toBe('2027');
            expect(host.emitted).toEqual([]);
        });
    });

    describe('select', () => {
        it('emits YYYY-MM with zero-padded month and closes the picker', async () => {
            host.value.set('2026-05');
            await fixture.whenStable();
            await open();

            months()[0].click();
            await fixture.whenStable();

            expect(host.emitted).toEqual(['2026-01']);
            expect(dropdown()).toBeNull();
        });

        it('emits double-digit months without padding artifacts', async () => {
            host.value.set('2026-05');
            await fixture.whenStable();
            await open();

            months()[11].click();

            expect(host.emitted).toEqual(['2026-12']);
        });

        it('does not change the label by itself (parent owns value)', async () => {
            host.value.set('2020-01');
            await fixture.whenStable();
            await open();

            months()[5].click();
            await fixture.whenStable();

            expect(host.emitted).toEqual(['2020-06']);
            expect(trigger().textContent!.trim()).toBe('Jan 2020');
        });
    });

    describe('today button', () => {
        it('shows todayLabel and emits the current year-month from any browsed year', async () => {
            const today = new Date();
            const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            host.value.set('1999-02');
            host.todayLabel.set('Today');
            await fixture.whenStable();
            await open();

            const todayBtn = el().querySelector<HTMLButtonElement>('.today-btn')!;
            expect(todayBtn.textContent!.trim()).toBe('Today');
            todayBtn.click();
            await fixture.whenStable();

            expect(host.emitted).toEqual([expected]);
            expect(dropdown()).toBeNull();
        });
    });

    describe('selected month', () => {
        it('marks only the month of value in the year of value', async () => {
            host.value.set('2026-05');
            await fixture.whenStable();
            await open();

            const selected = months().map(m => m.classList.contains('selected'));
            expect(selected.indexOf(true)).toBe(4);
            expect(selected.filter(Boolean).length).toBe(1);
        });

        it('marks nothing while browsing a different year', async () => {
            host.value.set('2026-05');
            await fixture.whenStable();
            await open();

            navButtons()[0].click();
            await fixture.whenStable();

            expect(months().some(m => m.classList.contains('selected'))).toBe(false);
        });
    });

    describe('outside click', () => {
        it('closes the picker on document click', async () => {
            await open();
            document.body.click();
            await fixture.whenStable();
            expect(dropdown()).toBeNull();
        });

        it('stays open when clicking inside the dropdown', async () => {
            await open();
            el().querySelector<HTMLElement>('.year')!.click();
            await fixture.whenStable();
            expect(dropdown()).toBeTruthy();
        });
    });

    describe('value changes from the parent', () => {
        it('reopens on the new year after value changed while closed', async () => {
            host.value.set('2026-05');
            await fixture.whenStable();
            await open();
            await open();

            host.value.set('2018-07');
            await fixture.whenStable();
            await open();

            expect(year()).toBe('2018');
        });

        it('keeps the browsed year while open', async () => {
            host.value.set('2026-05');
            await fixture.whenStable();
            await open();
            navButtons()[1].click();
            await fixture.whenStable();

            host.value.set('2018-07');
            await fixture.whenStable();

            expect(year()).toBe('2027');
        });
    });

    describe('two-way binding', () => {
        it('updates the parent through [(value)]', async () => {
            const twoWay = TestBed.createComponent(TwoWayHostComponent);
            await twoWay.whenStable();
            const root: HTMLElement = twoWay.nativeElement;

            root.querySelector<HTMLButtonElement>('.trigger')!.click();
            await twoWay.whenStable();
            root.querySelectorAll<HTMLButtonElement>('.month-btn')[7].click();
            await twoWay.whenStable();

            expect(twoWay.componentInstance.value).toBe('2020-08');
            expect(root.querySelector('.trigger')!.textContent!.trim()).toBe('Ago 2020');
        });
    });
});
