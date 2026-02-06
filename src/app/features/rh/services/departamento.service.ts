import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Departamento, DepartamentoResponse } from '../models/departamento.model';

@Injectable({
    providedIn: 'root'
})
export class DepartamentoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/rh/departamento`;

    getAll(idEmpresa: number = 1): Observable<Departamento[]> {
        const params = new HttpParams().set('idEmpresa', idEmpresa.toString());
        return this.http.get<any>(this.apiUrl, { params }).pipe(
            map(response => {
                return response?.data ?? [];
            })
        );
    }

    getById(id: number, idEmpresa: number = 1): Observable<Departamento> {
        const params = new HttpParams().set('idEmpresa', idEmpresa.toString());
        return this.http.get<any>(`${this.apiUrl}/${id}`, { params }).pipe(
            map(response => {

                const data = response?.data;
                return Array.isArray(data) ? data[0] : data;
            })
        );
    }

    insert(departamento: Departamento): Observable<DepartamentoResponse> {

        const payload = {
            ...departamento,
            idEmpresa: 1,
            userAlta: 1
        };
        return this.http.post<DepartamentoResponse>(this.apiUrl, payload);
    }

    update(id: number, departamento: Departamento): Observable<DepartamentoResponse> {

        const payload = {
            ...departamento,
            idEmpresa: 1,
            userMod: 1
        };
        return this.http.put<DepartamentoResponse>(`${this.apiUrl}/${id}`, payload);
    }

    delete(id: number): Observable<any> {

        const body = {
            idEmpresa: 1,
            userMod: 1
        };
        return this.http.delete<any>(`${this.apiUrl}/${id}`, { body });
    }
}
