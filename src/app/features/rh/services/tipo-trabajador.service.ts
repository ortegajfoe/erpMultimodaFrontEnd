import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { TipoTrabajador } from '../models/rh-catalogos.model';

@Injectable({
    providedIn: 'root'
})
export class TipoTrabajadorService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/rh/tipoTrabajador`;

    getAll(idEmpresa: number): Observable<TipoTrabajador[]> {
        const params = new HttpParams().set('idEmpresa', idEmpresa.toString());
        return this.http.get<any>(this.apiUrl, { params }).pipe(
            map(response => {
                const data = response?.data;
                if (Array.isArray(data)) {
                    return data;
                }
                return data?.recordset ?? [];
            })
        );
    }
}
