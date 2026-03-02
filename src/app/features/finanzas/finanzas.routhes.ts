import { Routes } from '@angular/router';

export const finanzasRoutes: Routes = [
    {
        path: 'bancos',
        loadComponent: () => import('./pages/banco/list/bancos-list.page.component').then(m => m.BancosListPageComponent)
    },
    {
        path: 'bancos/nuevo',
        loadComponent: () => import('./pages/banco/form/banco.page.component').then(m => m.BancoPageComponent)
    },
    {
        path: 'bancos/:id/editar',
        loadComponent: () => import('./pages/banco/form/banco.page.component').then(m => m.BancoPageComponent)
    }
];