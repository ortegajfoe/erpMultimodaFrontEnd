import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { inject } from '@angular/core';
import { AuthService } from '../../../auth/pages/login/services/auth.service';
import { LogoutDialogComponent } from '../../../../shared/components/feedback/logout-dialog/logout-dialog.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule, MatMenuModule, MatDialogModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  authService = inject(AuthService);
  private dialog = inject(MatDialog);

  user = this.authService.currentUser;

  onLogout() {
    const dialogRef = this.dialog.open(LogoutDialogComponent, {
      width: '400px',
      panelClass: 'glass-dialog-container',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authService.logout();
      }
    });
  }
}
