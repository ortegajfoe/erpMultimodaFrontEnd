import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Banco } from '../models/banco.model';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BancoService {
    private apiUrl = `${environment.apiUrl}/api/finanzas/banco`;

    constructor(private http: HttpClient) { }

    getBancos(): Observable<Banco[]> {
        return this.http.get<{ exito: number, data: Banco[] }>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }

    getById(id: number): Observable<Banco> {
        return this.http.get<{ exito: number, data: Banco[] }>(`${this.apiUrl}/${id}`).pipe(
            map(response => { return response.data[0] })
        );
    }

    create(banco: Partial<Banco>): Observable<any> {
        return this.http.post<any>(this.apiUrl, banco);
    }

    update(id: number, banco: Partial<Banco>): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, banco);
    }

    delete(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}