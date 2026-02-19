import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, of, map } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

export interface User {
    idUsuario: number;
    usuario: string;
    idEmpresa?: number;
    role?: number;
    [key: string]: any;
}

export interface AuthResponse {
    exito: number;
    data: {
        token: string;
        refreshToken?: string;
        [key: string]: any;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = `${environment.apiUrl}/api`;

    private _currentUser = signal<User | null>(null);
    private _accessToken = signal<string | null>(localStorage.getItem('access_token'));

    public isLoggedIn = computed(() => !!this._accessToken());
    public currentUser = this._currentUser.asReadonly();

    constructor() {
        const savedUser = localStorage.getItem('user_data');
        if (savedUser) {
            try {
                this._currentUser.set(JSON.parse(savedUser));
            } catch (e) {
                console.error('Error parsing saved user', e);
                this.logout();
            }
        }
    }

    get accessToken() {
        return this._accessToken();
    }

    login(credentials: { usuario: string; password: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
            tap(response => {
                if (response.exito && response.data) {
                    this.setSession(response.data);
                }
            })
        );
    }

    refreshToken(): Observable<any> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            return throwError(() => new Error('No refresh token'));
        }

        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
            tap(response => {
                if (response.exito && response.data.token) {
                    this._accessToken.set(response.data.token);
                    localStorage.setItem('access_token', response.data.token);
                }
            }),
            catchError(err => {
                this.logout();
                return throwError(() => err);
            })
        );
    }

    logout() {
        this._accessToken.set(null);
        this._currentUser.set(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        this.router.navigate(['/login']);
    }

    private setSession(data: any) {
        this._accessToken.set(data.token);
        localStorage.setItem('access_token', data.token);

        if (data.refreshToken) {
            localStorage.setItem('refresh_token', data.refreshToken);
        }

        const { token, refreshToken, ...user } = data;

        this._currentUser.set(user);

        localStorage.setItem('user_data', JSON.stringify(user));
    }
}