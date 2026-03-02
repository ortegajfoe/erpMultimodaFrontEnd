import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataTableColumn, TableCustomAction } from '../../../models/data-table.model';

@Component({
    selector: 'app-toolbar-table',
    standalone: true,
    imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, MatInputModule, MatTooltipModule],
    templateUrl: './toolbar-table.component.html',
    styleUrls: ['./toolbar-table.component.scss']
})
export class ToolbarTableComponent<T> implements OnChanges, AfterViewInit {
    @Input() data: T[] = [];
    @Input() columns: DataTableColumn<T>[] = [];
    @Input() total: number = 0;
    @Input() pageSize: number = 10;
    @Input() loading: boolean = false;
    @Input() zebra = false;
    @Output() pageChange = new EventEmitter<PageEvent>();
    @Output() sortChange = new EventEmitter<Sort>();
    @Output() filterChange = new EventEmitter<string>();
    @Output() edit = new EventEmitter<T>();
    @Output() remove = new EventEmitter<T>();
    @Output() create = new EventEmitter<void>();
    @Output() customAction = new EventEmitter<{ action: string; row: T }>();

    @Input() customActions: TableCustomAction[] = [];

    dataSource = new MatTableDataSource<T>([]);
    displayedColumns: string[] = [];
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data']) this.dataSource.data = this.data || [];
        if (changes['columns']) {
            this.displayedColumns = this.columns.map(c => String(c.key));
            if (this.edit.observed || this.remove.observed || this.customActions.length > 0)
                this.displayedColumns.push('acciones');

            this.dataSource.filterPredicate = (row: T, filter: string) => {
                const searchStr = filter.toLowerCase();
                return this.columns.some(col => {
                    const cellValue = this.getValue(row, col);
                    if (cellValue == null) return false;
                    return String(cellValue).toLowerCase().includes(searchStr);
                });
            };
        }
    }
    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }
    applyGlobalFilter(event: Event) {
        const val = (event.target as HTMLInputElement).value;
        this.filterChange.emit(val.trim().toLowerCase());
        this.dataSource.filter = val.trim().toLowerCase();
    }
    getValue(row: T, col: DataTableColumn<T>): any {
        return col.valueFn ? col.valueFn(row) : (row as any)[col.key];
    }
}
