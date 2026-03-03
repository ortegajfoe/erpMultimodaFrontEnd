import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class SeguridadService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/sistema`;

  obtenerRoles() {
    return this.http.get<any>(`${this.apiUrl}/rol`);
  }

  obtenerMenus() {
    return this.http.get<any>(`${this.apiUrl}/menu`);
  }

  obtenerMenusPorRol(idRol: number) {
    return this.http.get<any>(`${this.apiUrl}/rolMenu`);
  }

  guardarMenusMasivo(idRol: number, menusSeleccionados: number[]) {
    return this.http.post<any>(`${this.apiUrl}/rolMenu/masivo/${idRol}`, {
      menusSeleccionados
    });
  }
  obtenerUsuarios() {
    return this.http.get<any>(`${this.apiUrl}/usuarios`);
  }
  obtenerPermisosEspeciales() {
    return this.http.get<any>(`${this.apiUrl}/permisoEspecial`);
  }

  obtenerPermisosPorUsuario(idUsuario: number) {
    return this.http.get<any>(`${this.apiUrl}/permisoEspecial/${idUsuario}`);
  }

  guardarPermisosUsuario(idUsuario: number, permisosSeleccionados: number[]) {
    return this.http.post<any>(`${this.apiUrl}/permisoEspecial/masivo-usuario/${idUsuario}`, {
      permisosSeleccionados
    });
  }
}