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

    // State Signal
    readonly state = signal<ConfigState>({
        data: null,
        loading: false,
        error: null
    });

    // Selectors
    readonly settings = computed(() => {
        const data = this.state().data;
        const json = data?.componentConfig || {};
        return {
            primaryColor: data?.primaryColor ?? '#0f172a',
            secondaryColor: data?.secondaryColor ?? '#ffffff',
            fontFamily: data?.fontFamily ?? 'Inter, sans-serif',
            baseFontSize: data?.baseFontSize ?? 14,
            density: json.density ?? 'normal',
            borderRadius: data?.borderRadius ?? 12,

            // JSON properties flat
            tableLayout: json.tableLayout ?? 'toolbar',
            tableStyle: json.tableStyle ?? 'glass',
            tableZebra: json.tableZebra ?? true,
            tableDensity: json.tableDensity ?? 'normal',
            inputAppearance: json.inputAppearance ?? 'outline',
            buttonShape: json.buttonShape ?? 'rounded',
            mode: json.mode ?? 'light',
            fontScale: json.fontScale ?? 'normal',
            inputRadius: json.inputRadius ?? 4
        };
    });

    readonly loading = computed(() => this.state().loading);

    constructor() { }

    // Actions
    loadConfig(idEmpresa: number) {
        this.state.update(s => ({ ...s, loading: true, error: null }));
        this.configService.get(idEmpresa).pipe(
            tap(response => {
                if (response.exito) {
                    this.state.update(s => ({ ...s, data: response.data }));
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
        const currentJson = currentData.componentConfig || {};

        // Define which keys map to root vs json
        const rootKeys = ['primaryColor', 'secondaryColor', 'fontFamily', 'baseFontSize', 'borderRadius'];

        let newData: CompanyConfig;

        if (rootKeys.includes(key)) {
            newData = { ...currentData, [key]: value };
        } else {
            // It's a component config
            newData = {
                ...currentData,
                componentConfig: {
                    ...currentJson,
                    [key]: value
                }
            };
        }

        // Optimistic update
        this.state.update(s => ({ ...s, data: newData }));

        // Save to backend
        this.configService.save(newData).subscribe({
            error: (err) => console.error('Failed to save setting', err)
        });
    }
}
