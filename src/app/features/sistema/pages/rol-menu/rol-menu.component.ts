import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SeguridadService } from '@features/sistema/services/seguridad.service';
import { FormLayoutComponent } from '@shared/components/layout/form-layout/form-layout.component';


@Component({
  selector: 'app-rol-menu',
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
  templateUrl: './rol-menu.component.html',
  styleUrl: './rol-menu.component.scss',
})
export class RolMenuComponent {
  private seguridadService = inject(SeguridadService);
  private snackBar = inject(MatSnackBar);

  roles = signal<any[]>([]);
  menusArbol = signal<any[]>([]);
  menusSeleccionados = signal<Set<number>>(new Set());

  idRolSeleccionado = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  filtro = signal<string>('');

  menusArbolFiltrado = computed(() => {
    const texto = this.filtro().toLowerCase().trim();
    if (!texto) return this.menusArbol();

    return this.menusArbol()
      .map(padre => ({
        ...padre,
        hijos: padre.hijos.filter((h: any) =>
          h.menu?.toLowerCase().includes(texto)
        )
      }))
      .filter(padre =>
        padre.menu?.toLowerCase().includes(texto) || padre.hijos.length > 0
      );
  });

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this.isLoading.set(true);

    this.seguridadService.obtenerRoles().subscribe({
      next: (resRoles) => {
        if (resRoles.exito) this.roles.set(resRoles.data);

        this.seguridadService.obtenerMenus().subscribe({
          next: (resMenus) => {
            debugger
            if (resMenus.exito) {
              this.construirArbolMenus(resMenus.data);
            }
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  construirArbolMenus(menusPlanos: any[]) {
    const padres = menusPlanos.filter(m => !m.idMenuPadre);
    const arbol = padres.map(padre => ({

      ...padre,
      hijos: menusPlanos.filter(m => m.idMenuPadre === padre.idMenu)
    }));
    console.log('arbol', arbol)
    this.menusArbol.set(arbol);
  }

  onRolChange(idRol: number) {
    this.idRolSeleccionado.set(idRol);
    this.isLoading.set(true);

    this.seguridadService.obtenerMenusPorRol(idRol).subscribe({
      next: (res) => {
        if (res.exito) {
          const asignados = res.data
            .filter((rm: any) => rm.idRol === idRol && rm.idStatus === 1)
            .map((rm: any) => rm.idMenu);
          this.menusSeleccionados.set(new Set(asignados));
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  toggleTodosHijos(padre: any, checked: boolean) {
    const seleccionados = new Set(this.menusSeleccionados());
    padre.hijos.forEach((h: any) => {

      checked ? seleccionados.add(h.idMenu) : seleccionados.delete(h.idMenu);
    });
    checked ? seleccionados.add(padre.idMenu) : seleccionados.delete(padre.idMenu);
    this.menusSeleccionados.set(seleccionados);
  }

  toggleMenu(idMenu: number, event: MatCheckboxChange) {
    const seleccionados = new Set(this.menusSeleccionados());
    event.checked ? seleccionados.add(idMenu) : seleccionados.delete(idMenu);
    this.menusSeleccionados.set(seleccionados);
  }

  estaSeleccionado(idMenu: number): boolean {
    return this.menusSeleccionados().has(idMenu);
  }

  guardarCambios() {
    const idRol = this.idRolSeleccionado();
    if (!idRol) return;

    this.isSaving.set(true);
    const arregloIds = Array.from(this.menusSeleccionados());

    this.seguridadService.guardarMenusMasivo(idRol, arregloIds).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.snackBar.open('Menús actualizados correctamente', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.isSaving.set(false);
        this.snackBar.open('Error al guardar los menús', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
