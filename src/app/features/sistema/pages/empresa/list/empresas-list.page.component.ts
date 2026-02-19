import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { map } from 'rxjs/operators';
import { createCatalogStore } from '../../../../../shared/stores/catalog-store';
import { SmartTableComponent, TableAction } from '../../../../../shared/components/table';
import { DataTableColumn } from '../../../../../shared/components/table/data-table/data-table.component';
import { EmpresaService, Empresa } from '../../../services/empresa.service';

@Component({
    selector: 'app-empresas-list',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatButtonModule,
        SmartTableComponent
    ],
    templateUrl: './empresas-list.page.component.html',
    styleUrls: ['./empresas-list.page.component.scss']
})
export class EmpresasListPageComponent {
    private empresaService = inject(EmpresaService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);

    readonly store = createCatalogStore<Empresa>({
        source$: this.empresaService.getAll().pipe(map(r => r.data ?? [])),
        idKey: 'idEmpresa',
        filterFn: (row, query) => {
            return Object.entries(query).every(([key, value]) => {
                if (!value || value.trim() === '') return true;
                const filterVal = value.toLowerCase();

                if (key === 'global') {
                    const nombre = (row.nombre || '').toLowerCase();
                    const rfc = (row.rfc || '').toLowerCase();
                    return nombre.includes(filterVal) || rfc.includes(filterVal);
                }

                const val = String((row as any)[key] ?? '').toLowerCase();
                return val.includes(filterVal);
            });
        }
    });

    columns: DataTableColumn<Empresa>[] = [
        { key: 'nombre', label: 'Nombre', filter: 'text', mobilePrimary: true },
        { key: 'rfc', label: 'RFC', filter: 'text' },
        { key: 'telefono', label: 'Teléfono', filter: 'text' },
        { key: 'email', label: 'Email', filter: 'text', mobileHidden: true }
    ];

    @ViewChild('deleteConfirmDialog') deleteConfirmDialog!: TemplateRef<any>;

    onAction(event: TableAction<Empresa>) {
        switch (event.action) {
            case 'create':
                this.onCreate();
                break;
            case 'edit':
                if (event.row) this.onEdit(event.row);
                break;
            case 'delete':
                if (event.row) this.confirmDelete(this.deleteConfirmDialog, event.row);
                break;
        }
    }

    onCreate() {
        this.router.navigate(['/app/sistema/empresas/nuevo']);
    }

    onEdit(empresa: Empresa) {
        this.router.navigate(['/app/sistema/empresas', empresa.idEmpresa, 'editar']);
    }

    confirmDelete(templateRef: TemplateRef<any>, empresa: Empresa) {
        const dialogRef = this.dialog.open(templateRef, {
            data: empresa
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteEmpresa(empresa.idEmpresa!);
            }
        });
    }

    deleteEmpresa(id: number) {
        this.empresaService.delete(id).subscribe({
            next: () => {
                this.snackBar.open('Empresa eliminada', 'Cerrar', { duration: 3000 });
                window.location.reload();
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Error al eliminar empresa', 'Cerrar', { duration: 3000 });
            }
        });
    }
}
