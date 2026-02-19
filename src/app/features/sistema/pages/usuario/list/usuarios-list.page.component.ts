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
import { UsuarioService, Usuario } from '../../../services/usuario.service';

@Component({
    selector: 'app-usuarios-list',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatButtonModule,
        SmartTableComponent
    ],
    templateUrl: './usuarios-list.page.component.html',
    styleUrls: ['./usuarios-list.page.component.scss']
})
export class UsuariosListPageComponent {
    private usuarioService = inject(UsuarioService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);

    readonly store = createCatalogStore<Usuario>({
        source$: this.usuarioService.getAll().pipe(map(r => r.data ?? [])),
        idKey: 'idUsuario',
        filterFn: (row, query) => {
            return Object.entries(query).every(([key, value]) => {
                if (!value || value.trim() === '') return true;
                const filterVal = value.toLowerCase();

                if (key === 'global') {
                    const usuario = (row.usuario || '').toLowerCase();
                    return usuario.includes(filterVal);
                }

                const val = String((row as any)[key] ?? '').toLowerCase();
                return val.includes(filterVal);
            });
        }
    });

    columns: DataTableColumn<Usuario>[] = [
        { key: 'idUsuario', label: 'ID', filter: 'number' },
        { key: 'usuario', label: 'Usuario', filter: 'text', mobilePrimary: true },
        { key: 'idRol', label: 'Rol', filter: 'number', chip: true },
        { key: 'idTrabajador', label: 'Trabajador', filter: 'number' },
        { key: 'idEmpresa', label: 'Empresa', filter: 'number', mobileHidden: true }
    ];

    @ViewChild('deleteConfirmDialog') deleteConfirmDialog!: TemplateRef<any>;

    onAction(event: TableAction<Usuario>) {
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
        this.router.navigate(['/app/sistema/usuarios/nuevo']);
    }

    onEdit(usuario: Usuario) {
        this.router.navigate(['/app/sistema/usuarios', usuario.idUsuario, 'editar']);
    }

    confirmDelete(templateRef: TemplateRef<any>, usuario: Usuario) {
        const dialogRef = this.dialog.open(templateRef, {
            data: usuario
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteUsuario(usuario.idUsuario!);
            }
        });
    }

    deleteUsuario(id: number) {
        this.usuarioService.delete(id).subscribe({
            next: () => {
                this.snackBar.open('Usuario eliminado correctamente', 'Cerrar', { duration: 3000 });
                window.location.reload();
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Error al eliminar usuario', 'Cerrar', { duration: 3000 });
            }
        });
    }
}
