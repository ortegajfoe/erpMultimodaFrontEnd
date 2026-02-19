import { Component, computed, EventEmitter, input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { UiAlertComponent, UiButtonComponent } from '@shared/ui';
import { ConfigStore } from '../../../../core/stores/config.store';

export type SettingsSectionIdLocal = 'appearance' | 'typography' | 'density' | 'tables' | 'buttons' | 'inputs';

interface SettingsNavItem {
    id: SettingsSectionIdLocal;
    label: string;
    group: 'GENERAL' | 'COMPONENTES';
    icon: string;
    keywords: string[];
}

@Component({
    selector: 'app-settings-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatListModule,
        MatButtonModule,
        UiButtonComponent
    ],
    templateUrl: './settings-sidebar.component.html',
})
export class SettingsSidebarComponent {
    configStore = inject(ConfigStore);
    private dialog = inject(MatDialog);
    activeSection = input.required<string>();
    @Output() sectionChange = new EventEmitter<SettingsSectionIdLocal>();

    searchQuery = signal('');

    navItems = signal<SettingsNavItem[]>([
        { id: 'appearance', label: 'Apariencia', group: 'GENERAL', icon: 'palette', keywords: ['color', 'tema', 'oscuro', 'dark', 'light'] },
        { id: 'typography', label: 'Tipografía', group: 'GENERAL', icon: 'text_fields', keywords: ['fuente', 'letra', 'font', 'size', 'escama'] },
        { id: 'density', label: 'Densidad', group: 'COMPONENTES', icon: 'aspect_ratio', keywords: ['compacto', 'espaciado', 'ui', 'padding'] },
        { id: 'tables', label: 'Tablas', group: 'COMPONENTES', icon: 'table_chart', keywords: ['grid', 'lista', 'datatable', 'zebra', 'filas'] },
        { id: 'buttons', label: 'Botones', group: 'COMPONENTES', icon: 'smart_button', keywords: ['primary', 'stroke', 'fab', 'shape', 'borde'] },
        { id: 'inputs', label: 'Formularios', group: 'COMPONENTES', icon: 'input', keywords: ['inputs', 'select', 'textfield', 'campos', 'fill', 'outline'] },
    ]);

    filteredItems = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        const items = this.navItems();

        if (!query) return items;

        return items.filter(item => {
            const matchesLabel = item.label.toLowerCase().includes(query);
            const matchesKeyword = item.keywords.some(k => k.toLowerCase().includes(query));
            return matchesLabel || matchesKeyword;
        });
    });

    groupedNavItems = computed(() => {
        const items = this.filteredItems();
        const groups = new Map<string, SettingsNavItem[]>();

        items.forEach(item => {
            if (!groups.has(item.group)) {
                groups.set(item.group, []);
            }
            groups.get(item.group)!.push(item);
        });

        return Array.from(groups.entries()).map(([name, items]) => ({ name, items }));
    });

    updateSearch(event: Event) {
        const input = event.target as HTMLInputElement;
        this.searchQuery.set(input.value);
    }

    setSection(section: string) {
        this.sectionChange.emit(section as SettingsSectionIdLocal);
    }

    async reset() {
        const dialogRef = this.dialog.open(UiAlertComponent, {
            data: {
                title: 'Restaurar Configuración',
                message: '¿Estás seguro de que deseas restaurar toda la configuración a los valores por defecto? Esta acción no se puede deshacer.',
                confirmText: 'Sí, restaurar',
                cancelText: 'Cancelar',
                type: 'danger'
            }
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                try {
                    await this.configStore.resetToDefaults();
                } catch (error) {
                    console.error('Error resetting config', error);
                    this.dialog.open(UiAlertComponent, {
                        data: {
                            title: 'Error',
                            message: 'Hubo un problema al restaurar la configuración. Por favor intenta de nuevo.',
                            confirmText: 'Aceptar',
                            type: 'danger'
                        }
                    });
                }
            }
        });
    }
}
