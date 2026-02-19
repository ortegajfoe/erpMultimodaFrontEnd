import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { ConfigStore } from '../stores/config.store';

export interface ThemeSettings {
    primaryColor: string;
    secondaryColor: string;
    mode: 'light' | 'dark';

    fontScale: 'small' | 'normal' | 'large';
    fontFamily: string;
    baseFontSize: number;

    density: 'compact' | 'normal' | 'comfortable';

    buttonShape: 'square' | 'rounded' | 'pill';
    buttonStyle: 'flat' | 'stroked';
    borderRadius: number;

    inputAppearance: 'outline' | 'fill';
    inputRadius: number;

    tableDensity: 'compact' | 'normal' | 'relaxed';
    tableStickyHeader: boolean;
    tableZebra: boolean;
    tableStyle: 'default' | 'glass' | 'toolbar';

    componentConfig: any;
}

const DEFAULT_SETTINGS: ThemeSettings = {
    primaryColor: '#0d47a1',
    secondaryColor: '#ffffff',
    mode: 'light',

    fontScale: 'normal',
    fontFamily: 'Inter, sans-serif',
    baseFontSize: 14,

    density: 'normal',

    buttonShape: 'rounded',
    buttonStyle: 'flat',
    borderRadius: 4,

    inputAppearance: 'outline',
    inputRadius: 4,

    tableDensity: 'normal',
    tableStickyHeader: true,
    tableZebra: false,
    tableStyle: 'default',

    componentConfig: {}
};

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private configStore = inject(ConfigStore);

    readonly settings = this.configStore.settings;

    constructor() {
        effect(() => {
            this.applyTheme(this.settings());
        });

        effect(() => {
            const style = this.settings().tableStyle;
            const body = document.body;

            body.classList.remove('theme-table-glass', 'theme-table-toolbar');

            if (style === 'glass') body.classList.add('theme-table-glass');
            if (style === 'toolbar') body.classList.add('theme-table-toolbar');
        });
    }

    init() {
        this.configStore.loadConfig(1);
    }

    updateSettings(newSettings: any) {
        Object.keys(newSettings).forEach(key => {
            this.configStore.updateSetting(key, newSettings[key]);
        });
    }

    saveBackendConfig() {
        console.log('Auto-save managed by ConfigStore');
    }

    resetDefaults() {
        console.warn('Reset defaults not fully implemented in Store yet');
    }

    private getRadiusValue(shape: 'square' | 'rounded' | 'pill', globalRadius: number): string {
        if (shape === 'square') return '0px';
        if (shape === 'pill') return '9999px';
        return `${globalRadius}px`;
    }

    private applyTheme(settings: any) {
        const root = document.documentElement;

        root.style.setProperty('--primary-color', settings.primaryColor);
        root.style.setProperty('--brand-primary', settings.primaryColor);

        root.style.setProperty('--bg-color', settings.backgroundColor);
        root.style.setProperty('--app-bg', settings.backgroundColor);

        root.style.setProperty('--bg-surface', settings.surfaceColor);
        root.style.setProperty('--card-bg', settings.surfaceColor);

        root.style.setProperty('--font-main', settings.fontFamily);
        root.style.setProperty('--font-family', settings.fontFamily);

        root.style.setProperty('--ui-radius', `${settings.borderRadius}px`);
        root.style.setProperty('--border-radius', `${settings.borderRadius}px`);

        root.style.setProperty('--base-font-size', `${settings.baseFontSize}px`);

        root.style.setProperty('--primary-muted', `${settings.primaryColor}14`);
        root.style.setProperty('--erp-font-family', settings.fontFamily);

        let scale = 1;
        if (settings.fontScale === 'small') scale = 0.85;
        if (settings.fontScale === 'large') scale = 1.15;
        root.style.setProperty('--font-scale', scale.toString());

        root.style.setProperty('--btn-radius', this.getRadiusValue(settings.buttonShape, settings.borderRadius));
        root.style.setProperty('--input-radius', `${settings.inputRadius}px`);


        const densityClass = `density-${settings.density}`;
        document.body.classList.remove('density-compact', 'density-normal', 'density-comfortable');
        document.body.classList.add(densityClass);

        if (settings.tableZebra) document.body.classList.add('theme-table-zebra');
        else document.body.classList.remove('theme-table-zebra');

        if (settings.mode === 'dark') {
            root.classList.add('dark');
            document.body.classList.add('dark-theme');
            root.style.setProperty('color-scheme', 'dark');
        } else {
            root.classList.remove('dark');
            document.body.classList.remove('dark-theme');
            root.style.setProperty('color-scheme', 'light');
        }
    }
}
