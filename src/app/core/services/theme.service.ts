import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { ConfigStore } from '../stores/config.store';

export interface ThemeSettings {
    // Appearance
    primaryColor: string;
    secondaryColor: string; // New
    mode: 'light' | 'dark';

    // Typography
    fontScale: 'small' | 'normal' | 'large';
    fontFamily: string; // Changed to string for dynamic font
    baseFontSize: number; // New

    // Density
    density: 'compact' | 'normal' | 'comfortable';

    // Buttons
    buttonShape: 'square' | 'rounded' | 'pill';
    buttonStyle: 'flat' | 'stroked';
    borderRadius: number; // New Global radius

    // Inputs
    inputAppearance: 'outline' | 'fill';
    inputRadius: number;

    // Tables
    tableDensity: 'compact' | 'normal' | 'relaxed';
    tableStickyHeader: boolean;
    tableZebra: boolean;
    tableStyle: 'default' | 'glass' | 'toolbar'; // New table style

    // Config JSON bucket
    componentConfig: any;
}

const DEFAULT_SETTINGS: ThemeSettings = {
    primaryColor: '#0d47a1', // Corporate Blue Default
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

    // Alias for compatibility with components using this service directly
    // Use the store's computed signal
    readonly settings = this.configStore.settings;

    constructor() {
        // Effect for Global Token Application
        effect(() => {
            this.applyTheme(this.settings());
        });

        // Effect for Table Styles (Classes)
        effect(() => {
            const style = this.settings().tableStyle; // Access computed signal value
            const body = document.body;

            // Cleanup
            body.classList.remove('theme-table-glass', 'theme-table-toolbar');

            // Apply new
            if (style === 'glass') body.classList.add('theme-table-glass');
            if (style === 'toolbar') body.classList.add('theme-table-toolbar');
        });
    }

    init() {
        // Init Store (fetching ID 1 for now)
        this.configStore.loadConfig(1);
    }

    // Proxy methods to Store
    updateSettings(newSettings: any) {
        // Map individual updates to store actions
        // This is a comprehensive mapper to support the legacy component calls
        Object.keys(newSettings).forEach(key => {
            this.configStore.updateSetting(key, newSettings[key]);
        });
    }

    saveBackendConfig() {
        // Store saves automatically on updateSetting (optimistic), 
        // but if we want a manual "Save" button event that does something else, we can keep this.
        // For now, let's just log as the store handles saving.
        console.log('Auto-save managed by ConfigStore');
    }

    resetDefaults() {
        // Implement reset logic in store if needed
        console.warn('Reset defaults not fully implemented in Store yet');
    }

    private applyTheme(settings: any) {
        const root = document.documentElement;

        // --- GLOBAL Dynamic Variables ---
        root.style.setProperty('--primary-color', settings.primaryColor);
        root.style.setProperty('--primary-muted', `${settings.primaryColor}14`); // 8% opacity roughly for pills
        root.style.setProperty('--secondary-color', settings.secondaryColor);
        root.style.setProperty('--font-family', settings.fontFamily);
        root.style.setProperty('--base-font-size', `${settings.baseFontSize}px`);
        root.style.setProperty('--border-radius', `${settings.borderRadius}px`);

        // Legacy/Compatibility mapping
        root.style.setProperty('--erp-primary', settings.primaryColor);
        root.style.setProperty('--brand-primary', settings.primaryColor);
        root.style.setProperty('--erp-font-family', settings.fontFamily);

        // --- TYPOGRAPHY SCALING relative to base ---
        let scale = 1;
        if (settings.fontScale === 'small') scale = 0.85;
        if (settings.fontScale === 'large') scale = 1.15;
        root.style.setProperty('--font-scale', scale.toString());

        // --- DENSITY ---
        const densityClass = `density-${settings.density}`;
        document.body.classList.remove('density-compact', 'density-normal', 'density-comfortable');
        document.body.classList.add(densityClass);

        // --- TABLES ---
        if (settings.tableZebra) document.body.classList.add('theme-table-zebra');
        else document.body.classList.remove('theme-table-zebra');

        // --- MODE ---
        if (settings.mode === 'dark') {
            document.body.classList.add('dark-theme');
            root.style.setProperty('color-scheme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            root.style.setProperty('color-scheme', 'light');
        }
    }
}
