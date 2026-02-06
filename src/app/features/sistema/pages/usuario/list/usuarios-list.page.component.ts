import { Component, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { map } from 'rxjs/operators';
import { createCatalogStore } from '../../../../../shared/stores/catalog-store';
import { DataTableComponent, DataTableColumn } from '../../../../../shared/components/table/data-table/data-table.component';
import { UsuarioService, Usuario } from '../../../services/usuario.service';

@Component({
    selector: 'app-usuarios-list',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatButtonModule,
        DataTableComponent
    ],
    templateUrl: './usuarios-list.page.component.html',
    styleUrls: ['./usuarios-list.page.component.scss']
})
export class UsuariosListPageComponent {
    private usuarioService = inject(UsuarioService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);

    // Initialize Store
    // Note: Assuming API returns data in response.data. Based on trabajador.service it returns {exito:1, data: []}
    // So we map r.data ?? []
    readonly store = createCatalogStore<Usuario>({
        source$: this.usuarioService.getAll().pipe(map(r => r.data ?? [])),
        idKey: 'idUsuario',
        filterFn: (row, query) => {
            return Object.entries(query).every(([key, value]) => {
                if (!value || value.trim() === '') return true;
                const filterVal = value.toLowerCase();

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

    onCreate() {
        this.router.navigate(['/app/sistema/usuarios/nuevo']);
    }

    onEdit(usuario: Usuario) {
        this.router.navigate(['/app/sistema/usuarios', usuario.idUsuario, 'editar']);
    }

    onRemove(usuario: Usuario) {
        // Trigger confirmation
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
                window.location.reload(); // Simple reload for now
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Error al eliminar usuario', 'Cerrar', { duration: 3000 });
            }
        });
    }
}
