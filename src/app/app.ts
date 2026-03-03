import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from '@features/auth/pages/login/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class App {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  constructor() {
    this.themeService.init();
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    const token = localStorage.getItem('access_token');

    if (token) {
      this.authService.obtenerMenuYPermisos().subscribe({
        next: (resMenu) => {
          this.authService.establecerMenusYPermisos(resMenu);
        },
        error: () => {
          this.authService.logout();
        }
      });
    }
  }
}
