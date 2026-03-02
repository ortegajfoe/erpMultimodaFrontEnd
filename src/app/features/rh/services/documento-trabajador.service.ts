import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { DocumentoTrabajador, TipoDocumento } from '../models/rh-auxiliares.model';

@Injectable({
    providedIn: 'root'
})
export class DocumentoTrabajadorService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/rh/documentoTrabajador`;

    getByTrabajador(data: any): Observable<DocumentoTrabajador[]> {
        const params = new HttpParams()
            .set('tipoVinculo', data.tipoVinculo.toString())
            .set('idDocumentoTrabajador', data.idDocumentoTrabajador.toString());
        return this.http.get<any>(`${this.apiUrl}/${data.idTrabajador}`, { params }).pipe(
            map(response => {
                const data = response?.data;
                if (Array.isArray(data)) {
                    return data;
                }
                return data?.recordset ?? [];
            })
        );
    }

    upload(formData: FormData): Observable<any> {
        return this.http.post<any>(this.apiUrl, formData);
    }

    delete(id: number): Observable<any> {
        const body = {
            idEmpresa: 1,
            userMod: 1
        };
        return this.http.delete<any>(`${this.apiUrl}/${id}`, { body });
    }

    getTiposDocumento(): Observable<TipoDocumento[]> {
        return this.http.get<any>(`${this.apiUrl}/tipos`).pipe(
            map(response => response?.data || [])
        );
    }

    verDocumento(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}/ver`, { responseType: 'blob' });
    }
}
