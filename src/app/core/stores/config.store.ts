import { Injectable, computed, inject, signal } from '@angular/core';
import { ConfigService, CompanyConfig } from '../services/config.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface ConfigState {
    data: CompanyConfig | null;
    loading: boolean;
    error: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class ConfigStore {
    private configService = inject(ConfigService);

    readonly state = signal<ConfigState>({
        data: null,
        loading: false,
        error: null
    });

    readonly settings = computed(() => {
        const data = this.state().data;
        let json: any = {};

        if (data?.componentConfig) {
            if (typeof data.componentConfig === 'string') {
                try { json = JSON.parse(data.componentConfig); } catch { json = {}; }
            } else {
                json = data.componentConfig;
            }
        }


        const mode = (data?.themeMode as any) ?? json.mode ?? 'light';
        const isDark = mode === 'dark';

        const defaultBg = isDark ? '#0f172a' : '#f9fafb';
        const defaultSurface = isDark ? '#1e293b' : '#ffffff';
        const defaultSecondary = isDark ? '#334155' : '#ffffff';
        const defaultPrimary = '#0f172a';

        return {
            mode,
            primaryColor: data?.primaryColor ?? defaultPrimary,
            secondaryColor: data?.secondaryColor ?? defaultSecondary,
            surfaceColor: data?.surfaceColor ?? defaultSurface,
            backgroundColor: data?.backgroundColor ?? defaultBg,
            fontFamily: data?.fontFamily ?? 'Inter, sans-serif',
            baseFontSize: data?.baseFontSize ?? 14,
            density: json.density ?? 'normal',
            borderRadius: data?.borderRadius ?? 4,

            tableLayout: json.tableLayout ?? 'toolbar',
            tableStyle: json.tableStyle ?? 'glass',
            tableZebra: json.tableZebra ?? true,
            tableDensity: json.tableDensity ?? 'normal',
            tableStickyHeader: json.tableStickyHeader ?? true,
            inputAppearance: json.inputAppearance ?? 'outline',
            buttonShape: json.buttonShape ?? 'rounded',
            buttonStyle: json.buttonStyle ?? 'flat',
            fontScale: json.fontScale ?? 'normal',
            inputRadius: json.inputRadius ?? 4,

            componentConfig: json
        };
    });

    readonly loading = computed(() => this.state().loading);

    constructor() { }

    loadConfig(idEmpresa: number) {
        this.state.update(s => ({ ...s, loading: true, error: null }));
        this.configService.get(idEmpresa).pipe(
            tap(response => {
                console.log(response);
                if (response.exito && response.data) {

                    let cleanData = { ...response.data };
                    if (typeof cleanData.componentConfig === 'string') {
                        try {
                            cleanData.componentConfig = JSON.parse(cleanData.componentConfig);
                        } catch {
                            cleanData.componentConfig = {};
                        }
                    }
                    this.state.update(s => ({ ...s, data: cleanData }));
                }
            }),
            catchError(err => {
                this.state.update(s => ({ ...s, error: err.message }));
                return of(null);
            }),
            finalize(() => this.state.update(s => ({ ...s, loading: false })))
        ).subscribe();
    }

    updateSetting(key: string, value: any) {
        const currentData = this.state().data || {};
        let currentJson = currentData.componentConfig || {};

        if (typeof currentJson === 'string') {
            try { currentJson = JSON.parse(currentJson); } catch { currentJson = {}; }
        }

        if (currentJson['0'] && currentJson['1']) {
            currentJson = {};
        }

        const rootKeys = ['primaryColor', 'secondaryColor', 'fontFamily', 'baseFontSize', 'borderRadius', 'themeMode'];
        let newData: CompanyConfig;

        if (rootKeys.includes(key)) {
            newData = { ...currentData, [key]: value };
        } else {
            newData = {
                ...currentData,
                componentConfig: {
                    ...currentJson,
                    [key]: value
                }
            };
        }

        this.state.update(s => ({ ...s, data: newData }));
    }

    saveConfig(): Promise<void> {
        let currentData = this.state().data;
        if (!currentData) return Promise.resolve();

        let safeJson = currentData.componentConfig || {};

        if (typeof safeJson === 'string' || (safeJson['0'] && safeJson['1'])) {
            safeJson = {};
            const currentSettings = this.settings();
            safeJson = {
                density: currentSettings.density,
                tableLayout: currentSettings.tableLayout,
            };
        }
        const payload: CompanyConfig = {
            ...currentData,
            componentConfig: safeJson
        };

        this.state.update(s => ({ ...s, loading: true }));

        return new Promise((resolve, reject) => {
            this.configService.save(payload).pipe(
                finalize(() => this.state.update(s => ({ ...s, loading: false })))
            ).subscribe({
                next: (response) => {
                    if (response.exito) {
                        this.state.update(s => ({ ...s, data: response.data }));
                        resolve();
                    } else {
                        reject(new Error(response.mensaje || 'Error al guardar'));
                    }
                },
                error: (err) => reject(err)
            });
        });
    }

    resetToDefaults(): Promise<void> {
        const currentData = this.state().data;
        if (!currentData || !currentData.idEmpresa) return Promise.resolve();

        this.state.update(s => ({ ...s, loading: true }));
        return new Promise((resolve, reject) => {
            this.configService.reset(currentData.idEmpresa!).pipe(
                finalize(() => this.state.update(s => ({ ...s, loading: false })))
            ).subscribe({
                next: (response) => {
                    if (response.exito) {
                        this.state.update(s => ({ ...s, data: response.data }));
                        resolve();
                    } else {
                        reject(new Error(response.mensaje || 'Error al restaurar'));
                    }
                },
                error: (err) => reject(err)
            });
        });
    }
}