import { Component, Input, Output, EventEmitter, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ConfigStore } from '../../../../core/stores/config.store';
import { DataTableComponent } from '../data-table/data-table.component';
import { ToolbarTableComponent } from '../toolbar-table/toolbar-table.component';
import { TableAction } from './smart-table.model';
import { DataTableColumn } from '../../table/data-table/data-table.component';
import { TableCustomAction } from '../../../models/data-table.model';

@Component({
    selector: 'app-smart-table',
    standalone: true,
    imports: [CommonModule, DataTableComponent, ToolbarTableComponent],
    templateUrl: './smart-table.component.html',
    styles: [`
        :host {
            display: block;
            width: 100%;
        }
    `]
})
export class SmartTableComponent<T> {
    private configStore = inject(ConfigStore);

    @Input() data: T[] = [];
    @Input() columns: DataTableColumn<T>[] = [];
    @Input() total = 0;
    @Input() pageSize = 10;
    @Input() pageIndex = 0;
    @Input() loading = false;

    @Input() title?: string;
    @Input() subtitle?: string;
    @Input() showCreate = false;
    @Input() createText = 'Nuevo';
    @Input() sortActive = '';
    @Input() sortDirection: 'asc' | 'desc' | '' = '';
    @Input() error: string | null = null;

    @Output() onAction = new EventEmitter<TableAction<T>>();
    @Output() onPageChange = new EventEmitter<PageEvent>();
    @Output() onSortChange = new EventEmitter<Sort>();
    @Output() onFilterChange = new EventEmitter<{ key: string, value: string }>();

    @Input() customActions: TableCustomAction[] = [];

    layout = computed(() => this.configStore.settings().tableLayout);
    zebra = computed(() => this.configStore.settings().tableZebra);

    handleCreate() {
        this.onAction.emit({ action: 'create' });
    }

    handleEdit(row: T) {
        this.onAction.emit({ action: 'edit', row });
    }

    handleRemove(row: T) {
        this.onAction.emit({ action: 'delete', row });
    }

    handleCustomAction(event: { action: string; row: T }) {
        this.onAction.emit({ action: event.action, row: event.row });
    }

    handlePageChange(event: PageEvent) {
        this.onPageChange.emit(event);
    }

    handleSortChange(event: Sort) {
        this.onSortChange.emit(event);
    }

    handleFilterChange(event: any) {
        if (typeof event === 'string') {
            this.onFilterChange.emit({ key: 'global', value: event });
        } else {
            this.onFilterChange.emit(event);
        }
    }

    handleToolbarFilter(filter: string) {
        this.onFilterChange.emit({ key: 'global', value: filter });
    }
}
