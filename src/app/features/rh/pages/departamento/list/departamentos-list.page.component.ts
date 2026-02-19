import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { DepartamentoService } from '../../../services/departamento.service';
import { Departamento } from '../../../models/departamento.model';
import { SmartTableComponent, TableAction } from '../../../../../shared/components/table';
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
        SmartTableComponent
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

    readonly store = createCatalogStore<Departamento>({
        source$: this.refreshTrigger$.pipe(
            switchMap(() => this.departamentoService.getAll().pipe(map(r => r ?? [])))
        ),
        idKey: 'idDepartamento',
        filterFn: (row, query) => {
            return Object.entries(query).every(([key, value]) => {
                if (!value || value.trim() === '') return true;
                const filterVal = value.toLowerCase();

                if (key === 'global') {
                    const departamento = (row.departamento || '').toLowerCase();
                    return departamento.includes(filterVal);
                }

                const val = String((row as any)[key] ?? '').toLowerCase();
                return val.includes(filterVal);
            });
        }
    });

    columns: DataTableColumn<Departamento>[] = [
        { key: 'departamento', label: 'Departamento', filter: 'text', mobilePrimary: true, sortable: true },
        { key: 'notas', label: 'Notas', filter: 'text', mobileHidden: false }
    ];

    @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;

    onAction(event: TableAction<Departamento>) {
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
        this.router.navigate(['/app/rh/departamentos/nuevo']);
    }

    onEdit(dept: Departamento) {
        this.router.navigate(['/app/rh/departamentos', dept.idDepartamento, 'editar']);
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
