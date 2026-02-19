import { Directive, ElementRef, HostListener, forwardRef, Renderer2 } from '@angular/core';
import { DefaultValueAccessor, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
    selector: '[appUpperCase]',
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UpperCaseInputDirective),
            multi: true
        }
    ]
})
export class UpperCaseInputDirective extends DefaultValueAccessor {

    constructor(renderer: Renderer2, elementRef: ElementRef) {
        super(renderer, elementRef, false);
    }

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const start = input.selectionStart;
        const end = input.selectionEnd;

        input.value = input.value.toUpperCase();

        input.setSelectionRange(start, end);

        this.onChange(input.value);
    }
}
