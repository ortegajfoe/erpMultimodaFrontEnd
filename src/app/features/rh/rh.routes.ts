import { Routes } from '@angular/router';

export const rhRoutes: Routes = [
    {
        path: 'rh',
        children: [
            {
                path: 'trabajador',
                loadComponent: () => import('./pages/trabajador/list/trabajadores-list.page.component').then(m => m.TrabajadoresListPageComponent)
            },
            {
                path: 'trabajador/nuevo',
                loadComponent: () => import('./pages/trabajador/form/trabajador.page.component').then(m => m.TrabajadorCreatePageComponent)
            },
            {
                path: 'trabajador/:id/editar',
                loadComponent: () => import('./pages/trabajador/form/trabajador.page.component').then(m => m.TrabajadorCreatePageComponent)
            },
            {
                path: 'departamentos',
                loadComponent: () => import('./pages/departamento/list/departamentos-list.page.component').then(m => m.DepartamentosListPageComponent)
            },
            {
                path: 'departamentos/nuevo',
                loadComponent: () => import('./pages/departamento/form/departamento.page.component').then(m => m.DepartamentoPageComponent)
            },
            {
                path: 'departamentos/:id/editar',
                loadComponent: () => import('./pages/departamento/form/departamento.page.component').then(m => m.DepartamentoPageComponent)
            },
            {
                path: 'puestos',
                loadComponent: () => import('./pages/puesto/list/puestos-list.page.component').then(m => m.PuestosListPageComponent)
            },
            {
                path: 'puestos/nuevo',
                loadComponent: () => import('./pages/puesto/form/puesto.page.component').then(m => m.PuestoPageComponent)
            },
            {
                path: 'puestos/:id/editar',
                loadComponent: () => import('./pages/puesto/form/puesto.page.component').then(m => m.PuestoPageComponent)
            },
            {
                path: '',
                redirectTo: 'trabajadores',
                pathMatch: 'full'
            }
        ]
    }
];
