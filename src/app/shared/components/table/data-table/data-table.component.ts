import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    AfterViewInit,
    OnDestroy,
    OnChanges,
    SimpleChanges,
    ViewChild,
    inject,
    TemplateRef,
    ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorStateComponent } from '../../feedback/error-state/error-state.component';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

export interface DataTableColumn<T> {
    key: keyof T | string;
    label: string;
    filter?: 'text' | 'number' | 'none';
    sortable?: boolean;
    mobilePrimary?: boolean;
    mobileHidden?: boolean;
    chip?: boolean;
    valueFn?: (row: T) => string;
    filterPlaceholder?: string;
}

export interface TableCustomAction {
    action: string;
    icon: string;
    tooltip?: string;
    color?: 'primary' | 'accent' | 'warn';
}

@Component({
    selector: 'app-data-table',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        LayoutModule,
        ErrorStateComponent
    ],
    templateUrl: './data-table.component.html',
    styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent<T> implements OnChanges, OnDestroy {
    @Input() title?: string;
    @Input() subtitle?: string;
    @Input() columns: DataTableColumn<T>[] = [];
    @Input() showCreate = false;
    @Input() createText = 'Nuevo';

    @Input() rows: T[] = [];
    @Input() total = 0;
    @Input() loading = false;
    @Input() pageIndex = 0;
    @Input() pageSize = 10;
    @Input() sortActive = '';
    @Input() sortDirection: 'asc' | 'desc' | '' = '';
    @Input() error: string | null = null;
    @Input() zebra = false;

    skeletonRows = Array(5).fill(0);

    @Output() create = new EventEmitter<void>();
    @Output() edit = new EventEmitter<T>();
    @Output() remove = new EventEmitter<T>();
    @Output() customAction = new EventEmitter<{ action: string; row: T }>();
    @Output() pageChange = new EventEmitter<PageEvent>();
    @Output() filterChange = new EventEmitter<{ key: string, value: string }>();
    @Output() clearFilters = new EventEmitter<void>();
    @Output() sortChange = new EventEmitter<Sort>();
    @Output() retry = new EventEmitter<void>();

    @Input() customActions: TableCustomAction[] = [];

    private breakpointObserver = inject(BreakpointObserver);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    filterForm = new FormGroup({});
    displayedColumns: string[] = [];
    filterColumns: string[] = [];
    isMobile = false;
    showFilters = false;
    showMobileFilters = false;

    constructor() {
        this.breakpointObserver
            .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => {
                this.isMobile = result.matches;
            });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['columns']) {
            this.initializeFilters();
            this.updateDisplayedColumns();
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    initializeFilters() {
        const group: any = {};
        this.columns.forEach((col) => {
            if (col.filter && col.filter !== 'none') {
                group[col.key] = new FormControl('');
            }
        });
        this.filterForm = new FormGroup(group);

        this.filterForm.valueChanges
            .pipe(debounceTime(300), takeUntil(this.destroy$))
            .subscribe((values: any) => {
                Object.keys(values).forEach(key => {
                    this.filterChange.emit({ key, value: values[key] });
                });
            });

        this.updateDisplayedColumns();
    }

    updateDisplayedColumns() {
        this.displayedColumns = this.columns.map(c => String(c.key));
        this.filterColumns = this.columns.map(c => String(c.key) + '-filter');

        if (this.edit.observed || this.remove.observed) {
            this.displayedColumns.push('acciones');
            this.filterColumns.push('acciones-filter');
        }
    }

    onPage(event: PageEvent) {
        this.pageChange.emit(event);
    }

    onSort(event: Sort) {
        this.sortChange.emit(event);
    }

    getControlName(col: DataTableColumn<T>): string {
        return String(col.key);
    }

    getValue(row: T, col: DataTableColumn<T>): any {
        if (col.valueFn) {
            return col.valueFn(row);
        }
        return (row as any)[col.key];
    }

    getMobilePrimaryValue(row: T): string {
        const primaryCol = this.columns.find(c => c.mobilePrimary) || this.columns[0];
        return this.getValue(row, primaryCol);
    }

    getMobileSecondaryColumns(): DataTableColumn<T>[] {
        return this.columns.filter(c => !c.mobilePrimary && !c.mobileHidden);
    }

    trackById(index: number, item: any): any {
        return item.id || item.idTrabajador || item.idDepartamento || item.idPuesto || index;
    }

    toggleFilters() {
        this.showFilters = !this.showFilters;
        console.log('Toggle Filters:', this.showFilters, 'Filter Columns:', this.filterColumns.length);
        this.cdr.detectChanges();
    }
}
