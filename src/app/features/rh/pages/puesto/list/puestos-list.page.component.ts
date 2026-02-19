import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { PuestoService } from '../../../services/puesto.service';
import { Puesto } from '../../../models/puesto.model';
import { SmartTableComponent, TableAction } from '../../../../../shared/components/table';
import { DataTableColumn } from '../../../../../shared/components/table/data-table/data-table.component';
import { createCatalogStore } from '../../../../../shared/stores/catalog-store';
import { BehaviorSubject } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
    selector: 'app-puestos-list',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatButtonModule,
        SmartTableComponent
    ],
    templateUrl: './puestos-list.page.component.html',
    styleUrls: ['./puestos-list.page.component.scss']
})
export class PuestosListPageComponent {
    private puestoService = inject(PuestoService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);

    private refreshTrigger$ = new BehaviorSubject<void>(void 0);

    readonly store = createCatalogStore<Puesto>({
        source$: this.refreshTrigger$.pipe(
            switchMap(() => this.puestoService.getAll().pipe(map(r => r ?? [])))
        ),
        idKey: 'idPuesto',
        filterFn: (row, query) => {
            return Object.entries(query).every(([key, value]) => {
                if (!value || value.trim() === '') return true;
                const filterVal = value.toLowerCase();

                if (key === 'global') {
                    const puesto = (row.puesto || '').toLowerCase();
                    return puesto.includes(filterVal);
                }

                const val = String((row as any)[key] ?? '').toLowerCase();
                return val.includes(filterVal);
            });
        }
    });

    columns: DataTableColumn<Puesto>[] = [
        { key: 'puesto', label: 'Puesto', filter: 'text', mobilePrimary: true, sortable: true },
        { key: 'idDepartamento', label: 'Departamento', filter: 'number', chip: true },
        { key: 'notas', label: 'Notas', filter: 'text', mobileHidden: false }
    ];

    @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;

    onAction(event: TableAction<Puesto>) {
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
        this.router.navigate(['/app/rh/puestos/nuevo']);
    }

    onEdit(puesto: Puesto) {
        this.router.navigate(['/app/rh/puestos', puesto.idPuesto, 'editar']);
    }

    confirmDelete(templateRef: TemplateRef<any>, puesto: Puesto) {
        const dialogRef = this.dialog.open(templateRef, {
            data: puesto
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deletePuesto(puesto.idPuesto!);
            }
        });
    }

    deletePuesto(id: number) {
        this.puestoService.delete(id).subscribe({
            next: () => {
                this.snackBar.open('Puesto eliminado correctamente', 'Cerrar', { duration: 3000 });
                this.refreshTrigger$.next();
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Error al eliminar puesto', 'Cerrar', { duration: 3000 });
            }
        });
    }
}
