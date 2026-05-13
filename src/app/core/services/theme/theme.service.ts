import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

const STORAGE_KEY = 'darkMode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);

  /** Reflects persisted dark mode (synced with DOM). */
  readonly isDarkMode = signal(false);

  init(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const dark = localStorage.getItem(STORAGE_KEY) === 'true';
    this.isDarkMode.set(dark);
    this.applyDom(dark);
  }

  toggle(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const next = !this.isDarkMode();
    this.isDarkMode.set(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    this.applyDom(next);
  }

  private applyDom(isDark: boolean): void {
    const root = document.documentElement;
    root.classList.toggle('dark-mode', isDark);
    root.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    root.style.colorScheme = isDark ? 'dark' : 'light';
    document.body?.classList.toggle('dark-mode', isDark);
  }
}
