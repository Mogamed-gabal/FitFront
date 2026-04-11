import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  protected readonly sidebarCollapsed = signal(false);
  protected readonly mobileSidebarOpen = signal(false);

  protected onToggleSidebar(): void {
    this.sidebarCollapsed.update((value) => !value);
  }

  protected onToggleMobileSidebar(): void {
    this.mobileSidebarOpen.update((value) => !value);
  }

  protected onCloseMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }
}
