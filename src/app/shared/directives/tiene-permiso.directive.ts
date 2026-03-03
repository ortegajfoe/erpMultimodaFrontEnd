import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '@features/auth/pages/login/services/auth.service';

@Directive({
  selector: '[appTienePermiso]',
  standalone: true
})
export class TienePermisoDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  private permisoRequerido = '';
  private show = false;

  constructor() {

    effect(() => {
      const permisosActuales = this.authService.permisos();
      this.evaluarAcceso();
    });
  }

  @Input() set appTienePermiso(permiso: string) {
    this.permisoRequerido = permiso;
    this.evaluarAcceso();
  }

  private evaluarAcceso() {
    if (!this.permisoRequerido) return;

    const tieneAcceso = this.authService.tienePermiso(this.permisoRequerido);

    if (tieneAcceso && !this.show) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.show = true;
    } else if (!tieneAcceso && this.show) {
      this.viewContainer.clear();
      this.show = false;
    }
  }
}