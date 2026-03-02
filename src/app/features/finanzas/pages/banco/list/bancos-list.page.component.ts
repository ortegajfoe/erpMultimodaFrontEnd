import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { createCatalogStore } from '../../../../../shared/stores/catalog-store';
import { map } from 'rxjs/operators';
import { BancoService } from '../../../services/banco.services';
import { Banco } from '../../../models/banco.model';
import { SmartTableComponent, TableAction } from '../../../../../shared/components/table';
import { DataTableColumn } from '../../../../../shared/models/data-table.model';

@Component({
    selector: 'app-bancos-list',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatButtonModule,
        SmartTableComponent
    ],
    templateUrl: './bancos-list.page.component.html'
})
export class BancosListPageComponent {
    private bancoService = inject(BancoService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);

    readonly store = createCatalogStore<Banco>({
        source$: this.bancoService.getBancos().pipe(map(r => r ?? [])),
        idKey: 'idBanco',
        filterFn: (row, query) => {
            return Object.entries(query).every(([key, value]) => {
                if (!value || value.trim() === '') return true;
                const filterVal = value.toLowerCase();

                if (key === 'global') {
                    const bancoDesc = (row.banco || '').toLowerCase();
                    return bancoDesc.includes(filterVal);
                }

                const val = String((row as any)[key] ?? '').toLowerCase();
                return val.includes(filterVal);
            });
        }
    });

    columns: DataTableColumn<Banco>[] = [
        { key: 'idBanco', label: 'ID', filter: 'number', chip: true },
        {
            key: 'banco',
            label: 'Nombre del Banco',
            filter: 'text',
            mobilePrimary: true
        },
        { key: 'notas', label: 'Notas', filter: 'text' }
    ];

    @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;

    onAction(event: TableAction<Banco>) {
        switch (event.action) {
            case 'create':
                this.onCreate();
                break;
            case 'edit':
                if (event.row) this.onEdit(event.row);
                break;
            case 'delete':
                if (event.row) this.confirmDelete(this.deleteDialog, event.row);
                break;
        }
    }

    onCreate() {
        this.router.navigate(['/app/finanzas/bancos/nuevo']);
    }

    onEdit(banco: Banco) {
        this.router.navigate(['/app/finanzas/bancos', banco.idBanco, 'editar']);
    }

    confirmDelete(templateRef: TemplateRef<any>, banco: Banco) {
        const dialogRef = this.dialog.open(templateRef, {
            data: banco
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteBanco(banco.idBanco!);
            }
        });
    }

    deleteBanco(id: number) {
        this.bancoService.delete(id).subscribe({
            next: () => {
                this.snackBar.open('Banco eliminado correctamente', 'Cerrar', { duration: 3000 });
                window.location.reload();
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Error al eliminar banco', 'Cerrar', { duration: 3000 });
            }
        });
    }
}
