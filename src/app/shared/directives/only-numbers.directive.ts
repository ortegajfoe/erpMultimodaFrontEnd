import { Directive, ElementRef, HostListener, Input, forwardRef } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
    selector: '[appOnlyNumbers]',
    standalone: true,
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => OnlyNumbersDirective),
            multi: true
        }
    ]
})
export class OnlyNumbersDirective implements Validator {
    @Input() maxLen: number | null = null;

    constructor(private el: ElementRef) { }

    validate(control: AbstractControl): ValidationErrors | null {
        const valor = control.value;
        if (!valor) return null;
        const strValor = String(valor);

        if (strValor.length < 4) return null;

        if (/^(.)\1+$/.test(strValor)) {
            return { numerosInvalidos: 'No se permiten números idénticos repetidos' };
        }
        const secuenciaAscendente = '01234567890123456789';
        const secuenciaDescendente = '98765432109876543210';

        if (secuenciaAscendente.includes(strValor) || secuenciaDescendente.includes(strValor)) {
            return { numerosInvalidos: 'No se permiten secuencias consecutivas' };
        }

        return null;
    }
    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'].indexOf(event.key) !== -1) {
            return;
        }

        if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].indexOf(event.key.toLowerCase()) !== -1) {
            return;
        }

        if (!/^[0-9]$/.test(event.key)) {
            event.preventDefault();
            return;
        }

        if (this.maxLen !== null) {
            const current: string = this.el.nativeElement.value;
            const selectionStart = this.el.nativeElement.selectionStart;
            const selectionEnd = this.el.nativeElement.selectionEnd;

            if (current.length >= this.maxLen && selectionStart === selectionEnd) {
                event.preventDefault();
            }
        }
    }

    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent) {
        event.preventDefault();

        const clipboardData = event.clipboardData;
        if (!clipboardData) return;

        const pastedText = clipboardData.getData('text/plain');

        let numericText = pastedText.replace(/[^0-9]/g, '');

        if (!numericText) return;

        const current: string = this.el.nativeElement.value;
        const selectionStart = this.el.nativeElement.selectionStart || 0;
        const selectionEnd = this.el.nativeElement.selectionEnd || 0;

        const currentLength = current.length - (selectionEnd - selectionStart);

        if (this.maxLen !== null) {
            const availableSpace = this.maxLen - currentLength;
            if (availableSpace <= 0) return;

            numericText = numericText.substring(0, availableSpace);
        }

        const newValue = current.substring(0, selectionStart) + numericText + current.substring(selectionEnd);

        this.el.nativeElement.value = newValue;

        this.el.nativeElement.dispatchEvent(new Event('input'));
    }
}