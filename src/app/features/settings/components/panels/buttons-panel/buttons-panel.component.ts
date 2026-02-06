import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { ConfigStore } from '../../../../../core/stores/config.store';
import { ThemeService } from '../../../../../core/services/theme.service';

@Component({
    selector: 'app-buttons-panel',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        FormsModule
    ],
    templateUrl: './buttons-panel.component.html'
})
export class ButtonsPanelComponent {
    private configStore = inject(ConfigStore);
    themeService = inject(ThemeService);

    updateButtonShape(shape: any) { this.configStore.updateSetting('buttonShape', shape); }
}
