import { Component, input, output, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './ui-button.component.html',
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class UiButtonComponent {
  variant = input<'primary' | 'secondary' | 'outline' | 'outline-primary' | 'danger' | 'outline-danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');

  @HostBinding('class.w-full') get isFullWidth() { return this.fullWidth(); }
  @HostBinding('class.block') get isBlock() { return this.fullWidth(); }


  onClick = output<MouseEvent>();

  getClasses(): string {
    const base = '';

    const variants: Record<string, string> = {
      primary: 'bg-primary text-white hover:bg-opacity-90 active:bg-opacity-100 ring-primary shadow-sm dark:ring-offset-slate-900',
      secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 ring-gray-200 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700 dark:ring-slate-700',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 ring-gray-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-800 dark:ring-gray-700',
      'outline-primary': 'border border-primary text-primary hover:bg-blue-50 active:bg-blue-100 ring-primary dark:hover:bg-slate-800/50',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 ring-red-500',
      'outline-danger': 'border border-red-500 text-red-600 hover:bg-red-50 active:bg-red-100 ring-red-500 dark:hover:bg-red-900/20'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    const widthClass = this.fullWidth() ? 'w-full' : '';

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]} ${widthClass}`;
  }
}
