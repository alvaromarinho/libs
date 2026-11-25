import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

@Component({
    selector: 'ng-month-year-picker',
    standalone: true,
    templateUrl: './ng-month-year-picker.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './ng-month-year-picker.component.css',
    host: { '(document:click)': 'close()' },
})
export class NgMonthYearPickerComponent {

    /** Texto exibido no botão. Se vazio, é derivado de `value` + `monthNames`. */
    readonly label = input<string>();
    readonly todayLabel = input('Hoje');
    readonly monthNames = input(['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']);
    readonly disabled = input(false);
    /** `YYYY-MM`. */
    readonly value = input('');
    readonly valueChange = output<string>();

    protected readonly showPicker = signal(false);
    protected readonly pickerYear = signal(new Date().getFullYear());

    private readonly selectedYear = computed(() => parseInt(this.value()?.split('-')[0]) || 0);
    private readonly selectedMonth = computed(() => parseInt(this.value()?.split('-')[1]) || 0);

    protected readonly displayLabel = computed(() => {
        const label = this.label();
        if (label) return label;
        const year = this.selectedYear();
        const month = this.selectedMonth();
        if (!year || !month) return '';
        return `${this.monthNames()[month - 1]} ${year}`;
    });

    protected close(): void {
        this.showPicker.set(false);
    }

    protected toggle(event: Event): void {
        event.stopPropagation();
        if (this.disabled()) return;
        // pickerYear só aparece com o picker aberto: sincroniza ao abrir, sem reagir a value enquanto aberto.
        if (!this.showPicker()) this.pickerYear.set(this.selectedYear() || new Date().getFullYear());
        this.showPicker.update(show => !show);
    }

    protected changeYear(delta: number): void {
        this.pickerYear.update(year => year + delta);
    }

    protected select(monthIndex: number): void {
        const value = `${this.pickerYear()}-${String(monthIndex + 1).padStart(2, '0')}`;
        this.valueChange.emit(value);
        this.showPicker.set(false);
    }

    protected selectToday(): void {
        const today = new Date();
        this.pickerYear.set(today.getFullYear());
        this.select(today.getMonth());
    }

    protected isSelected(monthIndex: number): boolean {
        return this.selectedYear() === this.pickerYear() && this.selectedMonth() === monthIndex + 1;
    }

}
