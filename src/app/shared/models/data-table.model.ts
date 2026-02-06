export interface DataTableColumn<T> {
    key: keyof T | string;
    label: string;
    filter?: 'text' | 'number' | 'none';
    sortable?: boolean;
    mobilePrimary?: boolean;
    mobileHidden?: boolean;
    valueFn?: (row: T) => any;
    chip?: boolean;
}
