import { Component, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { DepartamentoService } from '../../../services/departamento.service';
import { Departamento } from '../../../models/departamento.model';
import { DataTableComponent } from '../../../../../shared/components/table/data-table/data-table.component';
import { DataTableColumn } from '../../../../../shared/models/data-table.model';
import { createCatalogStore } from '../../../../../shared/stores/catalog-store';
import { BehaviorSubject } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
    selector: 'app-departamentos-list',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatButtonModule,
        DataTableComponent
    ],
    templateUrl: './departamentos-list.page.component.html',
    styleUrls: ['./departamentos-list.page.component.scss']
})
export class DepartamentosListPageComponent {
    private departamentoService = inject(DepartamentoService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);

    private refreshTrigger$ = new BehaviorSubject<void>(void 0);

    // Initialize Store
    readonly store = createCatalogStore<Departamento>({
        source$: this.refreshTrigger$.pipe(
            switchMap(() => this.departamentoService.getAll().pipe(map(r => r ?? [])))
        ),
        idKey: 'idDepartamento'
    });

    columns: DataTableColumn<Departamento>[] = [
        { key: 'departamento', label: 'Departamento', filter: 'text', mobilePrimary: true, sortable: true },
        { key: 'notas', label: 'Notas', filter: 'text', mobileHidden: false }
    ];

    onCreate() {
        this.router.navigate(['/app/rh/departamentos/nuevo']);
    }

    onEdit(dept: Departamento) {
        this.router.navigate(['/app/rh/departamentos', dept.idDepartamento, 'editar']);
    }

    onRemove(dept: Departamento) {
        // Handled via dialog
    }

    confirmDelete(templateRef: TemplateRef<any>, dept: Departamento) {
        const dialogRef = this.dialog.open(templateRef, {
            data: dept
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteDepartamento(dept.idDepartamento!);
            }
        });
    }

    deleteDepartamento(id: number) {
        this.departamentoService.delete(id).subscribe({
            next: () => {
                this.snackBar.open('Departamento eliminado correctamente', 'Cerrar', { duration: 3000 });
                this.refreshTrigger$.next();
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Error al eliminar departamento', 'Cerrar', { duration: 3000 });
            }
        });
    }
}
