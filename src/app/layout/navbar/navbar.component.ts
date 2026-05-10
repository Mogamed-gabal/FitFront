import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth/auth.service';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, BackButtonComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleMobileSidebar = new EventEmitter<void>();

  protected readonly pageTitle = signal('Dashboard');
  protected readonly userName = signal('Admin User');
  protected readonly userRole = signal('admin');
  protected readonly isDarkMode = signal(false);

  constructor() {
    // Initialize dark mode from localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    this.isDarkMode.set(savedDarkMode === 'true');
    this.updateBodyClass();

    this.updateTitle(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.updateTitle(event.urlAfterRedirects));

    this.authService.getMe().subscribe({
      next: (user) => {
        const rawUser = user as Record<string, unknown>;
        const possibleName =
          (rawUser['name'] as string | undefined) ??
          (rawUser['fullName'] as string | undefined) ??
          (rawUser['username'] as string | undefined) ??
          (rawUser['email'] as string | undefined);
        const role = this.authService.getUserRole(user);

        this.userName.set(possibleName || 'Admin User');
        this.userRole.set(role || 'admin');
      },
    });
  }

  protected onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  protected onToggleMobileSidebar(): void {
    this.toggleMobileSidebar.emit();
  }

  protected onLogout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  protected toggleDarkMode(): void {
    const newDarkMode = !this.isDarkMode();
    this.isDarkMode.set(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    this.updateBodyClass();
  }

  private updateBodyClass(): void {
    const body = document.body;
    if (this.isDarkMode()) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }

  private updateTitle(url: string): void {
    const segment = url.split('?')[0].split('#')[0].split('/').filter(Boolean).pop();
    if (!segment) {
      this.pageTitle.set('Dashboard');
      return;
    }

    const normalized = segment.replace(/-/g, ' ');
    const title = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    this.pageTitle.set(title);
  }
}
