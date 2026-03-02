import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Trabajador, TrabajadorResponse } from '../models/trabajador.model';

@Injectable({
    providedIn: 'root'
})
export class TrabajadorService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/rh/trabajador`;

    getAll(): Observable<Trabajador[]> {

        return this.http.request<any>('GET', this.apiUrl,
            //     {
            //     params: { idEmpresa: 1 }
            // }
        ).pipe(
            map(response => {
                if (Array.isArray(response)) return response;
                return response.data;
            })
        );
    }

    getById(id: number): Observable<Trabajador> {
        return this.http.request<any>('GET', `${this.apiUrl}/${id}`,
            //      {
            //     params: { idEmpresa: 1 }
            // }
        ).pipe(
            map(response => {
                return response.data || response.dato || response;
            })
        );
    }

    insert(trabajador: Trabajador | FormData): Observable<TrabajadorResponse> {
        return this.http.post<TrabajadorResponse>(this.apiUrl, trabajador);
    }

    update(id: number, trabajador: Trabajador | FormData): Observable<TrabajadorResponse> {
        return this.http.put<TrabajadorResponse>(`${this.apiUrl}/${id}`, trabajador);
    }

    delete(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
