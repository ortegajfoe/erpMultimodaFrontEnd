import { Routes } from '@angular/router';

export const sistemaRoutes: Routes = [
    {
        path: 'sistema/usuarios',
        loadComponent: () => import('./pages/usuario/list/usuarios-list.page.component').then(m => m.UsuariosListPageComponent)
    },
    {
        path: 'sistema/usuarios/nuevo',
        loadComponent: () => import('./pages/usuario/form/usuario-form.page.component').then(m => m.UsuarioFormPageComponent)
    },
    {
        path: 'sistema/usuarios/:id/editar',
        loadComponent: () => import('./pages/usuario/form/usuario-form.page.component').then(m => m.UsuarioFormPageComponent)
    },
    {
        path: 'sistema/empresas',
        loadComponent: () => import('./pages/empresa/list/empresas-list.page.component').then(m => m.EmpresasListPageComponent)
    },
    {
        path: 'sistema/empresas/nuevo',
        loadComponent: () => import('./pages/empresa/form/empresa-form.page.component').then(m => m.EmpresaFormPageComponent)
    },
    {
        path: 'sistema/empresas/:id/editar',
        loadComponent: () => import('./pages/empresa/form/empresa-form.page.component').then(m => m.EmpresaFormPageComponent)
    }
];
