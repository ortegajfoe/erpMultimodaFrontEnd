import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
// Components
import { SettingsSidebarComponent, SettingsSectionIdLocal } from '../../components/settings-sidebar/settings-sidebar.component';
import { SettingsPreviewComponent } from '../../components/settings-preview/settings-preview.component';
import { AppearancePanelComponent } from '../../components/panels/appearance-panel/appearance-panel.component';
import { TypographyPanelComponent } from '../../components/panels/typography-panel/typography-panel.component';
import { DensityPanelComponent } from '../../components/panels/density-panel/density-panel.component';
import { ButtonsPanelComponent } from '../../components/panels/buttons-panel/buttons-panel.component';
import { FormsPanelComponent } from '../../components/panels/forms-panel/forms-panel.component';
import { TablesPanelComponent } from '../../components/panels/tables-panel/tables-panel.component';

export type SettingsSectionId = SettingsSectionIdLocal;

@Component({
    selector: 'app-settings-page',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        SettingsSidebarComponent,
        SettingsPreviewComponent,
        AppearancePanelComponent,
        TypographyPanelComponent,
        DensityPanelComponent,
        ButtonsPanelComponent,
        FormsPanelComponent,
        TablesPanelComponent
    ],
    templateUrl: './settings.page.component.html',
    styleUrls: ['./settings.page.component.scss']
})
export class SettingsPageComponent {
    activeSection = signal<SettingsSectionId>('appearance');

    getSectionTitle(): string {
        switch (this.activeSection()) {
            case 'appearance': return 'Apariencia';
            case 'typography': return 'Tipografía';
            case 'density': return 'Densidad';
            case 'tables': return 'Tablas';
            case 'buttons': return 'Botones';
            case 'inputs': return 'Formularios';
            default: return 'Configuración';
        }
    }

    getSectionDescription(): string {
        switch (this.activeSection()) {
            case 'appearance': return 'Personaliza el esquema de colores y el modo oscuro.';
            case 'typography': return 'Ajusta la fuente y el tamaño del texto global.';
            case 'density': return 'Controla la densidad de información en pantalla.';
            case 'buttons': return 'Define el estilo visual de los botones.';
            case 'inputs': return 'Configura la variencia de los campos de entrada.';
            case 'tables': return 'Ajustes para las tablas de datos.';
            default: return 'Seleccione una opción.';
        }
    }

    saveConfig() {
        console.log('Settings are saved automatically.');
    }
}
