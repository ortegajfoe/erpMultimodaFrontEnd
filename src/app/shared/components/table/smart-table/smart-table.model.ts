export interface TableAction<T = any> {
    action: string;
    row?: T;
}
