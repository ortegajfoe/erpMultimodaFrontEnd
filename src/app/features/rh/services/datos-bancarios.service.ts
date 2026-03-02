import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { DatosBancarios } from '../models/rh-auxiliares.model';
interface DatosBancariosRequest {
    idTrabajador: number;
    tipoVinculo: string;
    idDatoBancario: number;
}

@Injectable({
    providedIn: 'root'
})
export class DatosBancariosService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/rh/datosBancarios`;

    getByTrabajador(data: DatosBancariosRequest): Observable<DatosBancarios[]> {
        const params = new HttpParams()
            .set('tipoVinculo', data.tipoVinculo.toString())
            .set('idDatoBancario', data.idDatoBancario.toString());

        return this.http.get<any>(`${this.apiUrl}/${data.idTrabajador}`, { params }).pipe(
            map(response => {
                console.log(response);
                return response?.data;
            })
        );
    }

    create(data: DatosBancarios): Observable<any> {
        debugger
        const payload = {
            ...data,
        };
        return this.http.post<any>(this.apiUrl, payload);
    }

    update(id: number, data: DatosBancarios): Observable<any> {
        const payload = {
            ...data,
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
