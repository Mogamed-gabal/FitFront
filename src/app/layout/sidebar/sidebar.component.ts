import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() mobileOpen = false;
  @Output() closeMobile = new EventEmitter<void>();

  protected readonly menuItems = [
    { label: 'Dashboard', icon: 'fa-solid fa-chart-line', route: '/dashboard' },
    { label: 'Users', icon: 'fa-solid fa-users', route: '/users' },
  ];

  protected closeSidebarOnMobile(): void {
    this.closeMobile.emit();
  }
}
