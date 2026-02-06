import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ConfigStore } from '../../../../../core/stores/config.store';
import { ThemeService } from '../../../../../core/services/theme.service';

@Component({
    selector: 'app-tables-panel',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatDividerModule,
        MatSlideToggleModule,

        MatChipsModule,
        FormsModule,
        MatIconModule
    ],
    templateUrl: './tables-panel.component.html'
})
export class TablesPanelComponent {
    private configStore = inject(ConfigStore);
    themeService = inject(ThemeService);

    updateTableDensity(density: any) { this.configStore.updateSetting('tableDensity', density); }
    updateTableZebra(zebra: boolean) { this.configStore.updateSetting('tableZebra', zebra); }
    updateTableLayout(layout: any) { this.configStore.updateSetting('tableLayout', layout); }
}
