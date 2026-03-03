import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SeguridadService } from '@features/sistema/services/seguridad.service';
import { FormLayoutComponent } from '@shared/components/layout/form-layout/form-layout.component';
import { AuthService } from '@features/auth/pages/login/services/auth.service';


@Component({
  selector: 'app-permisos-usuario',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormLayoutComponent,
  ],
  templateUrl: './permisos-usuario.component.html',
  styleUrl: './permisos-usuario.component.scss',
})
export class PermisosUsuarioComponent {
  private seguridadService = inject(SeguridadService);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  get puedeGuardar(): boolean {
    return true;
    // return !!this.idUsuarioSeleccionado() && this.authService.tienePermiso('PERMISOS_GUARDAR');
  }

  usuarios = signal<any[]>([]);
  arbolPermisos = signal<any[]>([]);
  permisos = signal<any[]>([]);
  permisosSeleccionados = signal<Set<number>>(new Set());

  idUsuarioSeleccionado = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  filtro = signal<string>('');

  arbolPermisosFiltrado = computed(() => {
    const texto = this.filtro().toLowerCase().trim();
    if (!texto) return this.arbolPermisos();

    return this.arbolPermisos()
      .map(padre => ({
        ...padre,
        hijos: padre.hijos
          .map((hijo: any) => ({
            ...hijo,
            permisos: hijo.permisos.filter((p: any) =>
              p.nombre?.toLowerCase().includes(texto) ||
              p.notas?.toLowerCase().includes(texto)
            )
          }))
          .filter((hijo: any) =>
            hijo.menu?.toLowerCase().includes(texto) || hijo.permisos.length > 0
          )
      }))
      .filter(padre =>
        padre.menu?.toLowerCase().includes(texto) || padre.hijos.some((h: any) => h.permisos.length > 0 || h.menu?.toLowerCase().includes(texto))
      );
  });

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this.isLoading.set(true);

    this.seguridadService.obtenerUsuarios().subscribe({
      next: (res: any) => {
        if (res.exito) this.usuarios.set(res.data);
        this.seguridadService.obtenerMenus().subscribe({
          next: (resMenus) => {
            const menusPlanos = resMenus.exito ? resMenus.data : [];

            this.seguridadService.obtenerPermisosEspeciales().subscribe({
              next: (resPermisos: any) => {
                const permisosPlanos = resPermisos.exito ? resPermisos.data : [];
                this.construirArbol(menusPlanos, permisosPlanos);
                this.isLoading.set(false);
              },
              error: () => this.isLoading.set(false)
            });
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  construirArbol(menus: any[], permisos: any[]) {
    const padres = menus.filter(m => m.idMenuPadre === null || m.idMenuPadre === undefined);

    const arbol = padres.map(padre => {
      const hijos = menus.filter(m => m.idMenuPadre === padre.idMenu).map(hijo => {
        const permisosDelHijo = permisos.filter(p => p.idMenu === hijo.idMenu);
        return {
          ...hijo,
          permisos: permisosDelHijo
        };
      });

      return {
        ...padre,
        hijos: hijos
      };
    });

    this.arbolPermisos.set(arbol);
  }

  onUsuarioChange(idUsuario: number) {
    this.idUsuarioSeleccionado.set(idUsuario);
    this.isLoading.set(true);

    this.seguridadService.obtenerPermisosPorUsuario(idUsuario).subscribe({
      next: (res) => {
        if (res.exito) {
          const asignados = res.data.map((p: any) => p.idPermisoEspecial);
          this.permisosSeleccionados.set(new Set(asignados));
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  togglePermiso(idPermiso: number, event: MatCheckboxChange) {
    const seleccionados = new Set(this.permisosSeleccionados());
    if (event.checked) seleccionados.add(idPermiso);
    else seleccionados.delete(idPermiso);
    this.permisosSeleccionados.set(seleccionados);
  }

  estaSeleccionado(idPermiso: number): boolean {
    return this.permisosSeleccionados().has(idPermiso);
  }

  guardarCambios() {
    const idUser = this.idUsuarioSeleccionado();
    if (!idUser) return;

    this.isSaving.set(true);
    const arregloIds = Array.from(this.permisosSeleccionados());

    this.seguridadService.guardarPermisosUsuario(idUser, arregloIds).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.snackBar.open('Permisos guardados correctamente', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.isSaving.set(false);
        this.snackBar.open('Error al guardar los permisos', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
