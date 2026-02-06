import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-form-layout',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './form-layout.component.html',
    styleUrls: ['./form-layout.component.scss']
})
export class FormLayoutComponent {
    @Input() title: string = '';
    @Input() subtitle: string = '';
    @Input() moduleName: string = '';
    @Input() loading: boolean = false;
    @Input() isValid: boolean = false;

    @Output() onSave = new EventEmitter<void>();
    @Output() onCancel = new EventEmitter<void>();
}
