import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { DatosBancarios } from '../models/rh-auxiliares.model';

@Injectable({
    providedIn: 'root'
})
export class DatosBancariosService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/rh/datosBancarios`;

    getByTrabajador(idTrabajador: number, idEmpresa: number = 1): Observable<DatosBancarios[]> {
        const params = new HttpParams()
            .set('idEmpresa', idEmpresa.toString())
            .set('idTrabajador', idTrabajador.toString());
        return this.http.get<any>(`${this.apiUrl}/${idTrabajador}`, { params }).pipe(
            map(response => {
                const data = response?.data;
                if (Array.isArray(data)) {
                    return data;
                }
                return data?.recordset ?? [];
            })
        );
    }

    create(data: DatosBancarios): Observable<any> {
        const payload = {
            ...data,
            idEmpresa: data.idEmpresa || 1,
            userAlta: 1 // TODO: get from auth service
        };
        return this.http.post<any>(this.apiUrl, payload);
    }

    update(id: number, data: DatosBancarios): Observable<any> {
        const payload = {
            ...data,
            idEmpresa: data.idEmpresa || 1,
            userMod: 1 // TODO: get from auth service
        };
        return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
    }

    delete(id: number): Observable<any> {
        const body = {
            idEmpresa: 1,
            userMod: 1
        };
        return this.http.delete<any>(`${this.apiUrl}/${id}`, { body });
    }
}
