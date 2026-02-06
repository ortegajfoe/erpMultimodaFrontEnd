import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type DialogType = 'delete' | 'warning' | 'success';

export interface DialogData {
    title: string;
    message: string;
    type: DialogType;
    confirmText?: string;
    cancelText?: string;
    icon?: string;
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) { }

    get iconName(): string {
        if (this.data.icon) return this.data.icon;
        switch (this.data.type) {
            case 'delete': return 'delete_forever';
            case 'warning': return 'warning_amber';
            case 'success': return 'check_circle';
            default: return 'help';
        }
    }

    get colors(): { iconBg: string; iconText: string; buttonColor: string } {
        switch (this.data.type) {
            case 'delete':
                return { iconBg: 'bg-red-100', iconText: 'text-red-600', buttonColor: 'warn' };
            case 'warning':
                return { iconBg: 'bg-orange-100', iconText: 'text-orange-600', buttonColor: 'warn' };
            case 'success':
                return { iconBg: 'bg-green-100', iconText: 'text-green-600', buttonColor: 'primary' };
            default:
                return { iconBg: 'bg-gray-100', iconText: 'text-gray-600', buttonColor: 'primary' };
        }
    }
}
