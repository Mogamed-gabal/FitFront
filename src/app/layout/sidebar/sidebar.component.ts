import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { ThemeService } from '../../core/services/theme/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  readonly theme = inject(ThemeService);

  @Input() collapsed = false;
  @Input() mobileOpen = false;
  @Output() closeMobile = new EventEmitter<void>();

  protected readonly isDarkMode = this.theme.isDarkMode;

  protected readonly menuItems = [
    { label: 'Dashboard', icon: 'fa-solid fa-chart-line', route: '/dashboard' },
    { label: 'Users', icon: 'fa-solid fa-users', route: '/users' },
    { label: 'Requests', icon: 'fa-solid fa-file-contract', route: '/requests' },
    { label: 'Supervisors', icon: 'fa-solid fa-user-tie', route: '/supervisor' },
    { label: 'Plans Monitoring', icon: 'fa-solid fa-clipboard-list', route: '/plans-monitoring' },
    { label: 'Chat Monitoring', icon: 'fa-solid fa-comments', route: '/admin-chat' },
    { label: 'Audit Logs', icon: 'fa-solid fa-history', route: '/audit' },
    { label: 'Subscription', icon: 'fa-solid fa-credit-card', route: '/subscription' },
  ];

  protected closeSidebarOnMobile(): void {
    this.closeMobile.emit();
  }

  protected toggleDarkMode(): void {
    this.theme.toggle();
  }

  protected onNavigateToSettings(): void {
    this.router.navigateByUrl('/admin-settings');
    this.closeSidebarOnMobile();
  }

  protected onLogout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
