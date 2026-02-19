import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface CompanyConfig {
    idEmpresa?: number;
    themeMode?: 'light' | 'dark';
    primaryColor?: string;
    secondaryColor?: string;
    surfaceColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
    baseFontSize?: number;
    borderRadius?: number;
    componentConfig?: any;
}

export interface ApiResponse<T> {
    exito: number;
    mensaje?: string;
    data: T;
}

export const DEFAULT_CONFIG: CompanyConfig = {
    themeMode: 'light',
    primaryColor: '#134dd4ff',
    secondaryColor: '#ffffff',
    surfaceColor: '#ffffff',
    backgroundColor: '#f9fafb',
    fontFamily: 'Inter, sans-serif',
    baseFontSize: 14,
    borderRadius: 4,
    componentConfig: {
        density: 'normal',
        tableLayout: 'toolbar',
        tableStyle: 'glass',
        tableZebra: true,
        tableDensity: 'normal',
        inputAppearance: 'outline',
        buttonShape: 'rounded',
        mode: 'light',
        fontScale: 'normal',
        inputRadius: 4
    }
};

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

    reset(idEmpresa: number): Observable<ApiResponse<CompanyConfig>> {
        const config = { ...DEFAULT_CONFIG, idEmpresa };
        return this.save(config);
    }
}
