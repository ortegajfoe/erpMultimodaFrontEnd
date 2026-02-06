import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Usuario {
    idUsuario?: number;
    usuario: string;
    passw?: string;
    notas?: string;
    idRol: number;
    idTrabajador: number;
    idEmpresa: number;
    userAlta?: number;
    userMod?: number;
    fechaAlta?: string;
    fechaMod?: string;
}

export interface ApiResponse<T> {
    exito: number;
    mensaje?: string;
    dato?: number;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/sistema/usuarios`;

    constructor() { }

    getAll(idEmpresa: number = 1): Observable<ApiResponse<Usuario[]>> {
        return this.http.get<ApiResponse<Usuario[]>>(`${this.apiUrl}?idEmpresa=${idEmpresa}`);
    }

    getById(id: number, idEmpresa: number = 1): Observable<ApiResponse<Usuario>> {
        return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/${id}?idEmpresa=${idEmpresa}`);
    }

    create(usuario: Usuario): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}`, usuario);
    }

    update(id: number, usuario: Usuario): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, usuario);
    }

    delete(id: number, userMod: number = 1): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`, { body: { userMod } });
    }
}
