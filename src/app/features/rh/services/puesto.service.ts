import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Puesto, PuestoResponse } from '../models/puesto.model';

@Injectable({
    providedIn: 'root'
})
export class PuestoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/rh/puesto`;

    getAll(idEmpresa: number = 1): Observable<Puesto[]> {
        const params = new HttpParams().set('idEmpresa', idEmpresa.toString());
        return this.http.get<any>(this.apiUrl, { params }).pipe(
            map(response => {
                return response?.data ?? [];
            })
        );
    }

    getById(id: number, idEmpresa: number = 1): Observable<Puesto> {
        const params = new HttpParams().set('idEmpresa', idEmpresa.toString());
        return this.http.get<any>(`${this.apiUrl}/${id}`, { params }).pipe(
            map(response => {
                const data = response?.data;
                return Array.isArray(data) ? data[0] : data;
            })
        );
    }

    insert(puesto: Puesto): Observable<PuestoResponse> {
        const payload = {
            ...puesto,
            idEmpresa: 1,
            userAlta: 1
        };
        return this.http.post<PuestoResponse>(this.apiUrl, payload);
    }

    update(id: number, puesto: Puesto): Observable<PuestoResponse> {
        const payload = {
            ...puesto,
            idEmpresa: 1,
            userMod: 1
        };
        return this.http.put<PuestoResponse>(`${this.apiUrl}/${id}`, payload);
    }

    delete(id: number): Observable<any> {
        const body = {
            idEmpresa: 1,
            userMod: 1
        };
        return this.http.delete<any>(`${this.apiUrl}/${id}`, { body });
    }
}
