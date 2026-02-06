import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { ConfigStore } from '../../../../../core/stores/config.store';
import { ThemeService } from '../../../../../core/services/theme.service';

@Component({
    selector: 'app-appearance-panel',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatDividerModule,
        MatSlideToggleModule,
        FormsModule
    ],
    templateUrl: './appearance-panel.component.html'
})
export class AppearancePanelComponent {
    private configStore = inject(ConfigStore);
    themeService = inject(ThemeService);

    updatePrimaryColor(color: string) { this.configStore.updateSetting('primaryColor', color); }
    updateMode(isDark: boolean) { this.configStore.updateSetting('mode', isDark ? 'dark' : 'light'); }
}
