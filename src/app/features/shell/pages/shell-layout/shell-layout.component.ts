import { Component, computed, effect, inject, signal, ViewChild, AfterViewInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common'; // Still needed for other things? No, signals replace async pipe for this.
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

  // 1. Reactive State Sources
  private isMobileSignal = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map(result => result.matches)),
    { initialValue: false }
  );

  // Writable signals for manual state
  // Desktop state: collapsed vs expanded
  isCollapsed = signal(false);
  // Mobile state: open vs closed (drawer)
  mobileIsOpen = signal(false);
  // Active group id
  openGroupId = signal<string | null>(null);

  // 2. Computed State
  isMobile = computed(() => this.isMobileSignal());

  sidenavMode = computed(() => this.isMobile() ? 'over' : 'side');

  sidenavWidth = computed(() => {
    if (this.isMobile()) {
      return 256; // Standard mobile drawer width
    }
    return this.isCollapsed() ? 72 : 256; // Desktop: Rail (72) vs Expanded (256)
  });

  isSidenavOpen = computed(() => {
    if (this.isMobile()) {
      return this.mobileIsOpen();
    }
    return true; // Always open in desktop (side mode)
  });

  constructor() {
    effect(() => {
      // Trigger effect when width or mode changes
      const width = this.sidenavWidth();
      const mode = this.sidenavMode();

      // Update content margins only in desktop mode
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
      // Update immediately (next frame)
      requestAnimationFrame(() => this.drawerContainer.updateContentMargins());
      // Update after transition (300ms + buffer)
      setTimeout(() => this.drawerContainer.updateContentMargins(), 330);
    }
  }

  // 3. Actions
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
