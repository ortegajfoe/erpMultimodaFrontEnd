import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface CompanyConfig {
    idEmpresa?: number;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    baseFontSize?: number;
    borderRadius?: number;
    componentConfig?: any; // JSON Object
}

export interface ApiResponse<T> {
    exito: number;
    mensaje?: string;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/sistema/config`;

    constructor() { }

    get(idEmpresa: number): Observable<ApiResponse<CompanyConfig>> {
        return this.http.get<ApiResponse<CompanyConfig>>(`${this.apiUrl}/${idEmpresa}`);
    }

    save(config: CompanyConfig): Observable<ApiResponse<CompanyConfig>> {
        return this.http.post<ApiResponse<CompanyConfig>>(this.apiUrl, config);
    }
}
