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

    getByTrabajador(idTrabajador: number, idEmpresa: number = 1): Observable<DocumentoTrabajador[]> {
        const params = new HttpParams()
            .set('idEmpresa', idEmpresa.toString())
            .set('idTrabajador', idTrabajador.toString());

        // As per request: GET ${apiUrl}/rh/documentoTrabajador (filtering ?) or specific route
        // Assuming backend might have a route or we use getAll with params
        // Using convention from previous service request
        return this.http.get<any>(`${this.apiUrl}/trabajador/${idTrabajador}`, { params }).pipe(
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
        // Backend expects 'documentoTrabajador_Insert' parameters. 
        // If using multer, formData should have the file AND the fields.
        // The endpoint likely handles the file upload and then calls the DB insert.
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
        // Mock implementation as endpoint doesn't exist yet
        const mocks: TipoDocumento[] = [
            { idTipoDocumento: 1, nombre: 'Identificación Oficial (INE/IFE)', obligatorio: true },
            { idTipoDocumento: 2, nombre: 'Comprobante de Domicilio', obligatorio: true },
            { idTipoDocumento: 3, nombre: 'CURP', obligatorio: true },
            { idTipoDocumento: 4, nombre: 'RFC', obligatorio: true },
            { idTipoDocumento: 5, nombre: 'Acta de Nacimiento', obligatorio: true },
            { idTipoDocumento: 6, nombre: 'NSS', obligatorio: true },
            { idTipoDocumento: 7, nombre: 'Constancia de Estudios', obligatorio: false },
            { idTipoDocumento: 8, nombre: 'Carta de Recomendación', obligatorio: false },
            { idTipoDocumento: 9, nombre: 'Aviso de Retención Infonavit', obligatorio: false },
            { idTipoDocumento: 10, nombre: 'Otro', obligatorio: false }
        ];
        return of(mocks);
    }
}
