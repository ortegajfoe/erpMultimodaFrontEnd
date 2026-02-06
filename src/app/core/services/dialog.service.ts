import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, DialogData } from '../../shared/components/feedback/confirm-dialog/confirm-dialog.component';
import { Observable, of } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class DialogService {
    private dialog = inject(MatDialog);
    private isDialogOpen = false;

    private open(data: DialogData): Observable<boolean> {
        if (this.isDialogOpen) {
            return of(false);
        }

        this.isDialogOpen = true;

        return this.dialog.open(ConfirmDialogComponent, {
            data: data,
            width: '400px',
            disableClose: data.type === 'delete' || data.type === 'warning',
            panelClass: 'confirm-dialog-clean',
        }).afterClosed().pipe(
            finalize(() => this.isDialogOpen = false)
        );
    }

    confirmDelete(title: string, message: string, confirmText: string = 'Eliminar'): Observable<boolean> {
        return this.open({
            title,
            message,
            type: 'delete',
            confirmText,
            cancelText: 'Cancelar'
        });
    }

    showWarning(title: string, message: string, confirmText: string = 'Entendido'): Observable<boolean> {
        return this.open({
            title,
            message,
            type: 'warning',
            confirmText,
            cancelText: 'Cancelar'
        });
    }

    showSuccess(title: string, message: string, confirmText: string = 'OK'): Observable<boolean> {
        return this.open({
            title,
            message,
            type: 'success',
            confirmText
        });
    }
}
