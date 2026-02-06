import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-error-state',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    templateUrl: './error-state.component.html',
})
export class ErrorStateComponent {
    @Input() title: string = 'Algo salió mal';
    @Input() message: string = 'No pudimos cargar la información.';
    @Input() icon: string = 'cloud_off';

    @Output() retry = new EventEmitter<void>();
}
