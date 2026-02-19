import { Component, input, signal, forwardRef, Injector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, NgControl, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true
    }
  ],
  templateUrl: './ui-input.component.html'
})
export class UiInputComponent implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('');
  type = input<string>('text');
  icon = input<string | null>(null);
  hint = input<string>('');
  appearance = input<'outline' | 'fill'>('outline');

  value = signal<string>('');
  disabled = signal<boolean>(false);

  onChange: any = () => { };
  onTouched: any = () => { };

  control: FormControl | null = null;

  constructor(private injector: Injector) { }

  ngOnInit() {
    try {
      const ngControl = this.injector.get(NgControl, null);
      if (ngControl) {
        this.control = ngControl.control as FormControl;
      }
    } catch (e) {
      console.warn('ui-input used without form control');
    }
  }

  get required(): boolean {
    if (!this.control) return false;
    const validator = this.control.validator ? this.control.validator({} as any) : null;
    return validator && validator['required'];
  }

  hasError(): boolean {
    return !!(this.control && this.control.invalid && (this.control.touched || this.control.dirty));
  }

  getErrorMessage(): string {
    if (!this.control || !this.control.errors) return '';
    if (this.control.errors['required']) return 'Este campo es requerido';
    if (this.control.errors['email']) return 'Correo electrónico inválido';
    if (this.control.errors['minlength']) return `Mínimo ${this.control.errors['minlength'].requiredLength} caracteres`;
    if (this.control.errors['maxlength']) return `Máximo ${this.control.errors['maxlength'].requiredLength} caracteres`;
    if (this.control.errors['pattern']) return 'Formato inválido';
    return 'Valor inválido';
  }

  writeValue(val: string): void {
    this.value.set(val || '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }
}
