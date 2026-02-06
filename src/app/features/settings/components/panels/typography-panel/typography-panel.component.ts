import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { ConfigStore } from '../../../../../core/stores/config.store';
import { ThemeService } from '../../../../../core/services/theme.service';

@Component({
    selector: 'app-typography-panel',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatDividerModule,
        MatSliderModule,
        FormsModule
    ],
    templateUrl: './typography-panel.component.html'
})
export class TypographyPanelComponent {
    private configStore = inject(ConfigStore);
    themeService = inject(ThemeService);

    updateFontFamily(family: string) { this.configStore.updateSetting('fontFamily', family); }
    updateFontScale(index: number) {
        const scales = ['small', 'normal', 'large'];
        this.configStore.updateSetting('fontScale', scales[index]);
    }
}
