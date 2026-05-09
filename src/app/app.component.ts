import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackButtonComponent } from './shared/components/back-button/back-button.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BackButtonComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'fit';
}
