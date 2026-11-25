import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { NgCollapseComponent } from './ng-collapse.component';

@Component({
    standalone: true,
    imports: [NgCollapseComponent],
    template: `
        <ng-collapse [toggle]="toggle()" [transitionDuration]="100">
            <div style="height: 50px">content</div>
        </ng-collapse>
    `
})
class HostComponent {

    readonly toggle = signal(false);

}

describe('NgCollapseComponent', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    const container = (): HTMLDivElement => fixture.nativeElement.querySelector('.ng-collapse');

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HostComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        // jsdom não faz layout: scrollHeight seria sempre 0
        Object.defineProperty(container(), 'scrollHeight', { value: 50, configurable: true });
    });

    it('should create', async () => {
        await fixture.whenStable();
        expect(container()).toBeTruthy();
    });

    it('starts collapsed when toggle is false', async () => {
        await fixture.whenStable();
        expect(container().classList.contains('show')).toBe(false);
        expect(container().style.maxHeight).toBe('0px');
    });

    it('projects content', async () => {
        await fixture.whenStable();
        expect(container().textContent).toContain('content');
    });

    it('initializes expanded without animation when toggle starts true', async () => {
        host.toggle.set(true);
        await fixture.whenStable();

        expect(container().classList.contains('show')).toBe(true);
        expect(container().classList.contains('overflow')).toBe(true);
        expect(container().style.maxHeight).not.toBe('0px');
    });

    describe('with fake timers', () => {
        // Avança o relógio falso e deixa o Angular renderizar o que os timers mudaram
        const advance = async (ms: number) => {
            await vi.advanceTimersByTimeAsync(ms);
            await fixture.whenStable();
        };

        // Só os timers: o requestAnimationFrame real deixa o agendador zoneless renderizar
        beforeEach(() => {
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        });
        afterEach(() => {
            vi.useRealTimers();
        });

        it('expands when toggle changes to true', async () => {
            await advance(0);

            host.toggle.set(true);
            await advance(0);

            await advance(10); // isExpanded = true
            await advance(10); // maxHeight medido
            expect(container().classList.contains('show')).toBe(true);
            expect(container().style.maxHeight).not.toBe('0px');

            await advance(100); // transitionDuration -> overflow visível
            expect(container().classList.contains('overflow')).toBe(true);
        });

        it('collapses when toggle changes back to false', async () => {
            await advance(0);

            host.toggle.set(true);
            await advance(0);
            await advance(10);
            await advance(10);
            await advance(100);

            host.toggle.set(false);
            await advance(0);

            await advance(10); // maxHeight -> 0
            expect(container().style.maxHeight).toBe('0px');
            expect(container().classList.contains('overflow')).toBe(false);

            await advance(300); // atraso fixo do collapse -> totalmente oculto
            expect(container().classList.contains('show')).toBe(false);
        });

        it('interrupting mid-expand collapses cleanly (no stale timers)', async () => {
            await advance(0);

            host.toggle.set(true);
            await advance(0);
            // Interrompe no meio da expansão
            await advance(10);

            host.toggle.set(false);
            await advance(0);
            await advance(400);

            expect(container().style.maxHeight).toBe('0px');
            expect(container().classList.contains('overflow')).toBe(false);
        });

        it('does not throw on destroy with pending timers', async () => {
            await advance(0);
            host.toggle.set(true);
            await advance(0);
            await vi.advanceTimersByTimeAsync(10);

            expect(() => fixture.destroy()).not.toThrow();
            // Timer pendente que disparasse depois do destroy rejeitaria aqui
            await vi.advanceTimersByTimeAsync(1000);
            expect(vi.getTimerCount()).toBe(0);
        });
    });
});
