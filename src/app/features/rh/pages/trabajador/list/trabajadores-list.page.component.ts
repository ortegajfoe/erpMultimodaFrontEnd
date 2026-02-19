import { Component, inject, TemplateRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { createCatalogStore } from '../../../../../shared/stores/catalog-store';
import { map } from 'rxjs/operators';
import { TrabajadorService } from '../../../services/trabajador.service';
import { Trabajador } from '../../../models/trabajador.model';
import { SmartTableComponent, TableAction } from '../../../../../shared/components/table';
import { DataTableColumn } from '../../../../../shared/models/data-table.model';

@Component({
    selector: 'app-trabajadores-list',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatButtonModule,
        SmartTableComponent
    ],
    templateUrl: './trabajadores-list.page.component.html',
    styleUrls: ['./trabajadores-list.page.component.scss']
})
export class TrabajadoresListPageComponent {
    private trabajadorService = inject(TrabajadorService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);

    readonly store = createCatalogStore<Trabajador>({
        source$: this.trabajadorService.getAll().pipe(map(r => r ?? [])),
        idKey: 'idTrabajador',
        filterFn: (row, query) => {
            return Object.entries(query).every(([key, value]) => {
                if (!value || value.trim() === '') return true;
                const filterVal = value.toLowerCase();

                if (key === 'global') {
                    const nombre = (row.nombre || '').toLowerCase();
                    const apPaterno = (row.apPaterno || '').toLowerCase();
                    const apMaterno = (row.apMaterno || '').toLowerCase();
                    const fullName = `${nombre} ${apPaterno} ${apMaterno}`.trim();
                    const rfc = (row.rfc || '').toLowerCase();
                    const curp = (row.curp || '').toLowerCase();
                    return fullName.includes(filterVal) || rfc.includes(filterVal) || curp.includes(filterVal);
                }

                if (key === 'nombreCompleto') {
                    const fullName = `${row.nombre} ${row.apPaterno} ${row.apMaterno}`.toLowerCase();
                    return fullName.includes(filterVal);
                }

                const val = String((row as any)[key] ?? '').toLowerCase();
                return val.includes(filterVal);
            });
        }
    });

    columns: DataTableColumn<Trabajador>[] = [
        {
            key: 'nombreCompleto',
            label: 'Nombre',
            filter: 'text',
            mobilePrimary: true,
            valueFn: (row) => `${row.nombre} ${row.apPaterno} ${row.apMaterno}`
        },
        { key: 'rfc', label: 'RFC', filter: 'text' },
        { key: 'curp', label: 'CURP', filter: 'text' },
        { key: 'idDepartamento', label: 'Dept', filter: 'number', chip: true },
        { key: 'idPuesto', label: 'Puesto', filter: 'number' },
        { key: 'tipoTrabajador', label: 'Tipo', filter: 'text', chip: true }
    ];

    @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;

    onAction(event: TableAction<Trabajador>) {
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
        this.router.navigate(['/app/rh/trabajadores/nuevo']);
    }

    onEdit(trabajador: Trabajador) {
        this.router.navigate(['/app/rh/trabajadores', trabajador.idTrabajador, 'editar']);
    }

    confirmDelete(templateRef: TemplateRef<any>, trabajador: Trabajador) {
        const dialogRef = this.dialog.open(templateRef, {
            data: trabajador
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteTrabajador(trabajador.idTrabajador!);
            }
        });
    }

    deleteTrabajador(id: number) {
        this.trabajadorService.delete(id).subscribe({
            next: () => {
                this.snackBar.open('Trabajador eliminado correctamente', 'Cerrar', { duration: 3000 });
                window.location.reload();
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Error al eliminar trabajador', 'Cerrar', { duration: 3000 });
            }
        });
    }
}
