import { Component, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';

@Component({
    selector: 'ng-month-picker',
    standalone: true,
    templateUrl: './ng-month-picker.component.html',
    styleUrl: './ng-month-picker.component.css',
})
export class NgMonthPickerComponent implements OnChanges {

    /** Valor no formato `YYYY-MM`. */
    @Input() value = '';
    /** Texto exibido no botão. Se vazio, é derivado de `value` + `monthNames`. */
    @Input() label?: string;
    /** Nomes dos meses exibidos no grid (padrão: PT-BR). */
    @Input() monthNames: string[] = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    @Output() valueChange = new EventEmitter<string>();

    showPicker = false;
    pickerYear = new Date().getFullYear();

    get displayLabel(): string {
        if (this.label) return this.label;
        const [y, m] = this.value.split('-').map(Number);
        if (!y || !m) return '';
        return `${this.monthNames[m - 1]} ${y}`;
    }

    private get selectedYear(): number { return parseInt(this.value?.split('-')[0]) || 0; }
    private get selectedMonth(): number { return parseInt(this.value?.split('-')[1]) || 0; }

    ngOnChanges() {
        if (!this.showPicker) this.pickerYear = this.selectedYear || new Date().getFullYear();
    }

    @HostListener('document:click')
    onDocumentClick() {
        this.showPicker = false;
    }

    toggle(event: Event) {
        event.stopPropagation();
        if (!this.showPicker) this.pickerYear = this.selectedYear || new Date().getFullYear();
        this.showPicker = !this.showPicker;
    }

    select(monthIndex: number) {
        const value = `${this.pickerYear}-${String(monthIndex + 1).padStart(2, '0')}`;
        this.valueChange.emit(value);
        this.showPicker = false;
    }

    isSelected(monthIndex: number): boolean {
        return this.selectedYear === this.pickerYear && this.selectedMonth === monthIndex + 1;
    }
}
