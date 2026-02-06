import { computed, effect, signal, WritableSignal, Signal, Injector, runInInjectionContext, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';

export interface CatalogStoreOptions<T> {
    source$: Observable<T[]>;
    idKey: keyof T | string;
    initialPageSize?: number;
    filterKeys?: (keyof T | string)[];
    filterFn?: (row: T, query: Record<string, string>) => boolean;
}

export function createCatalogStore<T>(opts: CatalogStoreOptions<T>) {
    const loading = signal(true);
    const pageIndex = signal(0);
    const pageSize = signal(opts.initialPageSize ?? 10);
    const filterQuery = signal<Record<string, string>>({});

    const sourceWithLoading$ = opts.source$.pipe(
        tap(() => loading.set(false)),
        startWith([])
    );

    const rawItems = toSignal(sourceWithLoading$, { initialValue: [] as T[] });

    const filteredItems = computed(() => {
        const items = rawItems();
        const query = filterQuery();

        if (!items || items.length === 0) return [];

        const activeFilters = Object.entries(query).filter(([_, val]) => val && val.trim() !== '');
        if (activeFilters.length === 0) return items;

        return items.filter(row => {
            if (opts.filterFn) {
                return opts.filterFn(row, query);
            }

            return activeFilters.every(([key, value]) => {

                const normalize = (v: any) => String(v ?? '').toLowerCase();
                const filterVal = normalize(value);
                const rowVal = normalize((row as any)[key]);

                return rowVal.includes(filterVal);
            });
        });
    });

    const totalItems = computed(() => filteredItems().length);

    const pagedItems = computed(() => {
        const items = filteredItems();
        const index = pageIndex();
        const size = pageSize();
        const start = index * size;
        return items.slice(start, start + size);
    });

    effect(() => {
        filterQuery(); // dependence
        pageIndex.set(0);
    }, { allowSignalWrites: true });

    const setFilter = (key: string, value: string) => {
        filterQuery.update(current => ({
            ...current,
            [key]: value
        }));
    };

    const clearFilters = () => {
        filterQuery.set({});
    };

    const onPageChange = (event: { pageIndex: number; pageSize: number }) => {
        pageIndex.set(event.pageIndex);
        pageSize.set(event.pageSize);
    };

    return {
        // Signals
        loading,
        pageIndex,
        pageSize,
        filterQuery,
        rawItems,
        filteredItems,
        totalItems,
        pagedItems,

        // Actions
        setFilter,
        clearFilters,
        onPageChange
    };
}
