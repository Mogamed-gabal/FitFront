import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme/theme.service';
import { BackButtonComponent } from './shared/components/back-button/back-button.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BackButtonComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'fit';

  constructor() {
    // Ensures body.dark-mode is applied if APP_INITIALIZER ran before <body> existed.
    inject(ThemeService).init();
  }
}
