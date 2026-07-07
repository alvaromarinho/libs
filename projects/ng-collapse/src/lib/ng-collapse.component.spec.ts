import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { NgCollapseComponent } from './ng-collapse.component';

@Component({
  standalone: true,
  imports: [NgCollapseComponent],
  // Angular 22: default é OnPush; host precisa de Eager para propagar mutação de `toggle`
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <ng-collapse [toggle]="toggle" [transitionDuration]="100">
      <div style="height: 50px">content</div>
    </ng-collapse>
  `
})
class HostComponent {
  toggle = false;
}

describe('NgCollapseComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const container = (): HTMLDivElement =>
    fixture.nativeElement.querySelector('.ng-collapse');

  const advance = (ms: number) => {
    vi.advanceTimersByTime(ms);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    // jsdom não faz layout: scrollHeight seria sempre 0
    Object.defineProperty(container(), 'scrollHeight', { value: 50, configurable: true });
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(container()).toBeTruthy();
  });

  it('starts collapsed when toggle is false', () => {
    fixture.detectChanges();
    expect(container().classList.contains('show')).toBe(false);
    expect(container().style.maxHeight).toBe('0px');
  });

  it('projects content', () => {
    fixture.detectChanges();
    expect(container().textContent).toContain('content');
  });

  it('initializes expanded without animation when toggle starts true', () => {
    host.toggle = true;
    fixture.detectChanges();
    fixture.detectChanges(); // ngAfterViewInit usa markForCheck (OnPush)

    expect(container().classList.contains('show')).toBe(true);
    expect(container().classList.contains('overflow')).toBe(true);
    expect(container().style.maxHeight).not.toBe('0px');
  });

  describe('with fake timers', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('expands when toggle changes to true', () => {
      fixture.detectChanges();

      host.toggle = true;
      fixture.detectChanges();

      advance(10); // isExpanded = true
      advance(10); // maxHeight measured
      expect(container().classList.contains('show')).toBe(true);
      expect(container().style.maxHeight).not.toBe('0px');

      advance(100); // transitionDuration -> overflow visible
      expect(container().classList.contains('overflow')).toBe(true);
    });

    it('collapses when toggle changes back to false', () => {
      fixture.detectChanges();

      host.toggle = true;
      fixture.detectChanges();
      advance(10);
      advance(10);
      advance(100);

      host.toggle = false;
      fixture.detectChanges();

      advance(10); // maxHeight -> 0
      expect(container().style.maxHeight).toBe('0px');
      expect(container().classList.contains('overflow')).toBe(false);

      advance(300); // atraso fixo do collapse -> totalmente oculto
      expect(container().classList.contains('show')).toBe(false);
    });

    it('interrupting mid-expand collapses cleanly (no stale timers)', () => {
      fixture.detectChanges();

      host.toggle = true;
      fixture.detectChanges();
      // Interrompe no meio da expansão
      advance(10);

      host.toggle = false;
      fixture.detectChanges();
      advance(400);

      expect(container().style.maxHeight).toBe('0px');
      expect(container().classList.contains('overflow')).toBe(false);
    });

    it('does not throw on destroy with pending timers', () => {
      fixture.detectChanges();
      host.toggle = true;
      fixture.detectChanges();
      vi.advanceTimersByTime(10);

      expect(() => fixture.destroy()).not.toThrow();
      expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
    });
  });
});
