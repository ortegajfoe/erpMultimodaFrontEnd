import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatTooltipModule, MatExpansionModule, MatMenuModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() openGroupId: string | null = null;
  @Output() navigate = new EventEmitter<void>();
  @Output() toggle = new EventEmitter<void>();
  @Output() requestExpandGroup = new EventEmitter<string>();
  @Output() groupStateChange = new EventEmitter<{ groupId: string, expanded: boolean }>();
}
