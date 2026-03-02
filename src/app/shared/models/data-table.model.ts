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

export interface TableCustomAction {
    /** Cadena única que identifica la acción, se emitirá en el evento onAction */
    action: string;
    /** Icono de Material Icons */
    icon: string;
    /** Texto del tooltip */
    tooltip?: string;
    /** Color del botón: 'primary' | 'accent' | 'warn' */
    color?: 'primary' | 'accent' | 'warn';
}
