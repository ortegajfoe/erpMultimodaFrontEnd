import { Component, computed, effect, inject, signal, ViewChild, AfterViewInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { MatSidenav, MatSidenavContainer, MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [MatSidenavModule, SidebarComponent, TopbarComponent, RouterOutlet],
  templateUrl: './shell-layout.component.html',
  styleUrls: ['./shell-layout.component.scss']
})
export class ShellLayoutComponent implements AfterViewInit {

  private breakpointObserver = inject(BreakpointObserver);
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('drawerContainer') drawerContainer!: MatSidenavContainer;

  private isMobileSignal = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map(result => result.matches)),
    { initialValue: false }
  );

  isCollapsed = signal(false);
  mobileIsOpen = signal(false);
  openGroupId = signal<string | null>(null);

  isMobile = computed(() => this.isMobileSignal());

  sidenavMode = computed(() => this.isMobile() ? 'over' : 'side');

  sidenavWidth = computed(() => {
    if (this.isMobile()) {
      return 256;
    }
    return this.isCollapsed() ? 72 : 256;
  });

  isSidenavOpen = computed(() => {
    if (this.isMobile()) {
      return this.mobileIsOpen();
    }
    return true;
  });

  constructor() {
    effect(() => {
      const width = this.sidenavWidth();
      const mode = this.sidenavMode();

      if (!this.isMobile()) {
        this.scheduleMarginUpdate();
      }
    });
  }

  ngAfterViewInit() {
    this.scheduleMarginUpdate();
  }

  private scheduleMarginUpdate() {
    if (this.drawerContainer) {
      requestAnimationFrame(() => this.drawerContainer.updateContentMargins());
      setTimeout(() => this.drawerContainer.updateContentMargins(), 330);
    }
  }

  toggleSidenav() {
    if (this.isMobile()) {
      this.mobileIsOpen.update(v => !v);
    } else {
      this.isCollapsed.update(v => !v);
      this.scheduleMarginUpdate();
    }
  }

  onExpandGroup(groupId: string) {
    if (!this.isMobile() && this.isCollapsed()) {
      this.isCollapsed.set(false);
      this.scheduleMarginUpdate();
    }
    this.openGroupId.set(groupId);
  }

  onGroupStateChange(event: { groupId: string, expanded: boolean }) {
    if (event.expanded) {
      this.openGroupId.set(event.groupId);
    } else if (this.openGroupId() === event.groupId) {
      this.openGroupId.set(null);
    }
  }

  onNavigate() {
    if (this.isMobile()) {
      this.mobileIsOpen.set(false);
    }
  }
}
