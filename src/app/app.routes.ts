import { Routes } from '@angular/router';
import { LoginPageComponent } from './features/auth/pages/login/login.page.component';
import { ShellLayoutComponent } from './features/shell/pages/shell-layout/shell-layout.component';
import { HomePageComponent } from './features/home/pages/home/home.page.component';
import { rhRoutes } from './features/rh/rh.routes';
import { authGuard } from '@features/auth/guards/auth.guard';


export const routes: Routes = [
    {
        path: 'login',
        component: LoginPageComponent
    },
    {
        path: 'app',
        component: ShellLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'home',
                component: HomePageComponent
            },
            ...rhRoutes,
            {
                path: '',
                loadChildren: () => import('./features/sistema/sistema.routes').then(m => m.sistemaRoutes)
            },
            {
                path: 'settings',
                loadComponent: () => import('./features/settings/pages/settings/settings.page.component').then(m => m.SettingsPageComponent)
            },
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
