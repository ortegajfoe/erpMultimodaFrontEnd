import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { ConfigStore } from '../../../../core/stores/config.store';
import { ThemeService } from '../../../../core/services/theme.service';
import { DataTableComponent, DataTableColumn } from '../../../../shared/components/table/data-table/data-table.component';
import { ToolbarTableComponent } from '../../../../shared/components/table/toolbar-table/toolbar-table.component';

@Component({
    selector: 'app-settings-preview',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTableModule,
        MatListModule,
        MatDividerModule,
        DataTableComponent,
        ToolbarTableComponent
    ],
    templateUrl: './settings-preview.component.html'
})
export class SettingsPreviewComponent {
    activeSection = input.required<string>();

    private configStore = inject(ConfigStore);
    themeService = inject(ThemeService);

    previewTableData: { id: number; name: string; status: string; budget: string; }[] = [
        { id: 1, name: 'Proyecto Alpha', status: 'Activo', budget: '$12,000' },
        { id: 2, name: 'Campaña Q3', status: 'Pendiente', budget: '$5,500' },
        { id: 3, name: 'Mantenimiento', status: 'Finalizado', budget: '$2,000' },
    ];

    previewColumns: DataTableColumn<{ id: number; name: string; status: string; budget: string; }>[] = [
        { key: 'name', label: 'Proyecto' },
        { key: 'status', label: 'Estado', chip: true },
        { key: 'budget', label: 'Presupuesto' }
    ];
}
