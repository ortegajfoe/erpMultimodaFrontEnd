import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { ConfigStore } from '../../../../../core/stores/config.store';
import { ThemeService } from '../../../../../core/services/theme.service';

@Component({
    selector: 'app-forms-panel',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatDividerModule,
        MatRadioModule,
        MatSliderModule,
        FormsModule
    ],
    templateUrl: './forms-panel.component.html'
})
export class FormsPanelComponent {
    private configStore = inject(ConfigStore);
    themeService = inject(ThemeService);

    updateInputAppearance(appearance: any) { this.configStore.updateSetting('inputAppearance', appearance); }
    updateInputRadius(radius: number) { this.configStore.updateSetting('inputRadius', radius); }
}
