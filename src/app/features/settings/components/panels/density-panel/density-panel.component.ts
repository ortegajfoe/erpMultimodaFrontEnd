import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ConfigStore } from '../../../../../core/stores/config.store';
import { ThemeService } from '../../../../../core/services/theme.service';

@Component({
    selector: 'app-density-panel',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatRadioModule,
        MatIconModule,
        FormsModule
    ],
    templateUrl: './density-panel.component.html'
})
export class DensityPanelComponent {
    private configStore = inject(ConfigStore);
    themeService = inject(ThemeService);

    updateDensity(density: any) { this.configStore.updateSetting('density', density); }
}
