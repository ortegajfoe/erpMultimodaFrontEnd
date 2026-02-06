import { Component, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { PuestoService } from '../../../services/puesto.service';
import { Puesto } from '../../../models/puesto.model';
import { DataTableComponent, DataTableColumn } from '../../../../../shared/components/table/data-table/data-table.component';
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
        DataTableComponent
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

    // Initialize Store
    readonly store = createCatalogStore<Puesto>({
        source$: this.refreshTrigger$.pipe(
            switchMap(() => this.puestoService.getAll().pipe(map(r => r ?? [])))
        ),
        idKey: 'idPuesto'
    });

    columns: DataTableColumn<Puesto>[] = [
        { key: 'puesto', label: 'Puesto', filter: 'text', mobilePrimary: true, sortable: true },
        { key: 'idDepartamento', label: 'Departamento', filter: 'number', chip: true },
        { key: 'notas', label: 'Notas', filter: 'text', mobileHidden: false }
    ];

    onCreate() {
        this.router.navigate(['/app/rh/puestos/nuevo']);
    }

    onEdit(puesto: Puesto) {
        this.router.navigate(['/app/rh/puestos', puesto.idPuesto, 'editar']);
    }

    onRemove(puesto: Puesto) {
        // Handled via dialog
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
