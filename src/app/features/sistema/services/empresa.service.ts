import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Empresa {
    idEmpresa?: number;
    nombre: string;
    rfc: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    idRegimenFiscal?: number;
    logoUrl?: string;
    estado?: string;
    idMoneda?: number;
    idPais?: number;
    idCiudad?: number;
    cp?: string;
    notas?: string;
    userAlta?: number;
    userMod?: number;
    active?: boolean;
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
export class EmpresaService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/sistema/empresas`;

    constructor() {
        console.log('EmpresaService apiUrl:', this.apiUrl);
    }

    getAll(): Observable<ApiResponse<Empresa[]>> {
        return this.http.get<ApiResponse<Empresa[]>>(`${this.apiUrl}`);
    }

    getById(id: number): Observable<ApiResponse<Empresa>> {
        return this.http.get<ApiResponse<Empresa>>(`${this.apiUrl}/${id}`);
    }

    create(empresa: Empresa): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}`, empresa);
    }

    update(id: number, empresa: Empresa): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, empresa);
    }

    delete(id: number, userMod: number = 1): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`, { body: { userMod } });
    }
}
