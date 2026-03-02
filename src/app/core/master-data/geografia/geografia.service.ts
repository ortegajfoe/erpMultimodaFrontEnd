import { inject, Injectable, signal } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { Ciudad, CodigoPostalResult, Estado, Pais } from "./geografia.model";
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";

@Injectable({ providedIn: 'root' })
export class GeografiaService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/sistema/ubicacion`;

    // Paises
    private paisesSignal = signal<Pais[]>([]);
    private isLoadingPaises = false;

    // Estados
    private estadosSignal = signal<Estado[]>([]);
    private loadedPaisId: number | null = null;
    private isLoadingEstados = false;

    // Ciudades
    private ciudadesSignal = signal<Ciudad[]>([]);
    private loadedEstadoId: number | null = null;
    private isLoadingCiudades = false;

    // Colonias
    private coloniasSignal = signal<CodigoPostalResult[]>([]);
    private loadedCp: string | null = null;
    private isLoadingColonias = false;

    loadPaises() {
        if (this.paisesSignal().length > 0 || this.isLoadingPaises) return;

        this.isLoadingPaises = true;

        this.http.get<any>(`${this.apiUrl}/paises`).pipe(
            map(response => response.data || response),
            catchError(err => {
                console.error('Error al cargar países', err);
                return of([]);
            })
        ).subscribe({
            next: (data: Pais[]) => {
                this.paisesSignal.set(data);
                this.isLoadingPaises = false;
            },
            error: () => {
                this.isLoadingPaises = false;
            }
        });
    }

    get paises() {
        return this.paisesSignal.asReadonly();
    }

    loadEstados(idPais: number) {
        if ((this.loadedPaisId === idPais && this.estadosSignal().length > 0) ||
            (this.isLoadingEstados && this.loadedPaisId === idPais)) {
            return;
        }

        // Limpieza en cascada: si cambia el país, borramos estados y ciudades previas
        if (this.loadedPaisId !== idPais) {
            this.estadosSignal.set([]);
            this.ciudadesSignal.set([]);
            this.loadedEstadoId = null;
        }

        this.isLoadingEstados = true;
        this.loadedPaisId = idPais;

        this.http.get<any>(`${this.apiUrl}/estados/${idPais}`).pipe(
            map(response => response.data || response),
            catchError(err => {
                console.error(`Error al cargar estados del país ${idPais}`, err);
                return of([]);
            })
        ).subscribe({
            next: (data: Estado[]) => {
                this.estadosSignal.set(data);
                this.isLoadingEstados = false;
            },
            error: () => {
                this.isLoadingEstados = false;
            }
        });
    }

    get estados() {
        return this.estadosSignal.asReadonly();
    }

    loadCiudades(idEstado: number) {
        if ((this.loadedEstadoId === idEstado && this.ciudadesSignal().length > 0) ||
            (this.isLoadingCiudades && this.loadedEstadoId === idEstado)) {
            return;
        }

        // Limpiar ciudades previas si cambiamos de estado
        if (this.loadedEstadoId !== idEstado) {
            this.ciudadesSignal.set([]);
        }

        this.isLoadingCiudades = true;
        this.loadedEstadoId = idEstado;

        this.http.get<any>(`${this.apiUrl}/ciudades/${idEstado}`).pipe(
            map(response => response.data || response),
            catchError(err => {
                console.error(`Error al cargar ciudades del estado ${idEstado}`, err);
                return of([]);
            })
        ).subscribe({
            next: (data: Ciudad[]) => {
                this.ciudadesSignal.set(data);
                this.isLoadingCiudades = false;
            },
            error: () => {
                this.isLoadingCiudades = false;
            }
        });
    }

    get ciudades() {
        return this.ciudadesSignal.asReadonly();
    }

    loadColoniasByCp(codigo: string) {
        if ((this.loadedCp === codigo && this.coloniasSignal().length > 0) ||
            (this.isLoadingColonias && this.loadedCp === codigo)) {
            return;
        }

        // Limpiar colonias previas si cambiamos de CP
        if (this.loadedCp !== codigo) {
            this.coloniasSignal.set([]);
        }

        this.isLoadingColonias = true;
        this.loadedCp = codigo;

        this.http.get<any>(`${this.apiUrl}/cp/${codigo}`).pipe(
            map(response => response.data || response),
            catchError(err => {
                console.error(`Error al cargar colonias del CP ${codigo}`, err);
                return of([]);
            })
        ).subscribe({
            next: (data: CodigoPostalResult[]) => {
                this.coloniasSignal.set(data);
                this.isLoadingColonias = false;
            },
            error: () => {
                this.isLoadingColonias = false;
            }
        });
    }

    get colonias() {
        return this.coloniasSignal.asReadonly();
    }

    /**
     * Devuelve las colonias de un CP como Observable.
     * - Cache hit: mismo CP con datos → retorna el signal sin HTTP
     * - Cache miss: hace fetch, popula el signal y retorna los datos
     */
    getColoniasByCp(codigo: string): Observable<CodigoPostalResult[]> {
        // Cache hit
        if (this.loadedCp === codigo && this.coloniasSignal().length > 0) {
            return of(this.coloniasSignal());
        }

        // Cache miss: limpiar si cambió el CP
        if (this.loadedCp !== codigo) {
            this.coloniasSignal.set([]);
        }

        this.isLoadingColonias = true;
        this.loadedCp = codigo;

        return this.http.get<any>(`${this.apiUrl}/cp/${codigo}`).pipe(
            map(r => r.data || r),
            tap((data: CodigoPostalResult[]) => {
                this.coloniasSignal.set(data);
                this.isLoadingColonias = false;
            }),
            catchError(err => {
                console.error(`Error al cargar colonias del CP ${codigo}`, err);
                this.isLoadingColonias = false;
                return of([]);
            })
        );
    }
}
