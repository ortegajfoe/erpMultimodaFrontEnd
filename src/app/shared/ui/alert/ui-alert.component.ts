import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UiButtonComponent } from '../button/ui-button.component';

export interface UiAlertData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    icon?: string;
}

@Component({
    selector: 'ui-alert',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIconModule, UiButtonComponent],
    templateUrl: './ui-alert.component.html'
})
export class UiAlertComponent {
    readonly dialogRef = inject(MatDialogRef<UiAlertComponent>);
    readonly data = inject<UiAlertData>(MAT_DIALOG_DATA);

    get iconColorClass(): string {
        switch (this.data.type) {
            case 'danger': return 'text-red-500 bg-red-50';
            case 'warning': return 'text-yellow-500 bg-yellow-50';
            case 'success': return 'text-green-500 bg-green-50';
            default: return 'text-blue-500 bg-blue-50';
        }
    }

    get iconName(): string {
        if (this.data.icon) return this.data.icon;
        switch (this.data.type) {
            case 'danger': return 'error_outline';
            case 'warning': return 'warning_amber';
            case 'success': return 'check_circle_outline';
            default: return 'info_outline';
        }
    }

    confirm() {
        this.dialogRef.close(true);
    }

    cancel() {
        this.dialogRef.close(false);
    }
}
