import { Routes } from '@angular/router';

export const sistemaRoutes: Routes = [
    {
        path: 'usuarios',
        loadComponent: () => import('./pages/usuario/list/usuarios-list.page.component').then(m => m.UsuariosListPageComponent)
    },
    {
        path: 'usuarios/nuevo',
        loadComponent: () => import('./pages/usuario/form/usuario-form.page.component').then(m => m.UsuarioFormPageComponent)
    },
    {
        path: 'usuarios/:id/editar',
        loadComponent: () => import('./pages/usuario/form/usuario-form.page.component').then(m => m.UsuarioFormPageComponent)
    },
    {
        path: 'empresas',
        loadComponent: () => import('./pages/empresa/list/empresas-list.page.component').then(m => m.EmpresasListPageComponent)
    },
    {
        path: 'empresas/nuevo',
        loadComponent: () => import('./pages/empresa/form/empresa-form.page.component').then(m => m.EmpresaFormPageComponent)
    },
    {
        path: 'empresas/:id/editar',
        loadComponent: () => import('./pages/empresa/form/empresa-form.page.component').then(m => m.EmpresaFormPageComponent)
    },
    {
        path: 'rol-menu',
        loadComponent: () => import('./pages/rol-menu/rol-menu.component').then(m => m.RolMenuComponent)
    },
    {
        path: 'permisos-usuario',
        loadComponent: () => import('./pages/permisos-usuario/permisos-usuario.component').then(m => m.PermisosUsuarioComponent)
    }
];
