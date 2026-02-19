import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appOnlyNumbers]',
    standalone: true
})
export class OnlyNumbersDirective {
    @Input() maxLen: number | null = null;

    constructor(private el: ElementRef) { }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'].indexOf(event.key) !== -1) {
            return;
        }

        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].indexOf(event.key.toLowerCase()) !== -1) {
            return;
        }

        // Check if the key is a number
        if (!/^[0-9]$/.test(event.key)) {
            event.preventDefault();
            return;
        }

        // Check max length if defined (and text is not selected)
        if (this.maxLen !== null) {
            const current: string = this.el.nativeElement.value;
            // If we are at max length and not selecting text to replace, prevent input
            // Selection check is basic here, more robust would check selectionStart/End
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

        // Remove non-numeric characters
        let numericText = pastedText.replace(/[^0-9]/g, '');

        if (!numericText) return;

        const current: string = this.el.nativeElement.value;
        const selectionStart = this.el.nativeElement.selectionStart || 0;
        const selectionEnd = this.el.nativeElement.selectionEnd || 0;

        // Calculate available space
        // If text is selected, it will be replaced, so we count current length minus selected length
        const currentLength = current.length - (selectionEnd - selectionStart);

        if (this.maxLen !== null) {
            const availableSpace = this.maxLen - currentLength;
            if (availableSpace <= 0) return;

            // Truncate if needed
            numericText = numericText.substring(0, availableSpace);
        }

        // Insert text at cursor position
        const newValue = current.substring(0, selectionStart) + numericText + current.substring(selectionEnd);

        this.el.nativeElement.value = newValue;

        // Dispatch input event for Angular forms to pick up change
        this.el.nativeElement.dispatchEvent(new Event('input'));
    }
}
