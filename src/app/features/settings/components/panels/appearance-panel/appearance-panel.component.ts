import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { ConfigStore } from '@core/stores/config.store';
import { ThemeService } from '@core/services/theme.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-appearance-panel',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatDividerModule,
        MatSlideToggleModule,
        FormsModule,
        MatSnackBarModule,
    ],
    templateUrl: './appearance-panel.component.html'
})
export class AppearancePanelComponent {
    configStore = inject(ConfigStore);
    themeService = inject(ThemeService);
    private snackBar = inject(MatSnackBar);

    updatePrimaryColor(color: string) { this.configStore.updateSetting('primaryColor', color); }
    updateMode(isDark: boolean) { this.configStore.updateSetting('themeMode', isDark ? 'dark' : 'light'); }

    async saveChanges() {
        try {
            await this.configStore.saveConfig();
            this.snackBar.open('Configuración guardada correctamente', 'Cerrar', {
                duration: 3000,
                panelClass: ['success-snackbar']
            });
        } catch (error) {
            console.error('Error saving config', error);
            this.snackBar.open('Error al guardar configuración', 'Cerrar', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
        }
    }
}
