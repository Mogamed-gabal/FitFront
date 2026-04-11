import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-requests',
  imports: [CommonModule],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.scss'
})
export class RequestsComponent {
  constructor(private router: Router) {}

  navigateToJoiningRequests(): void {
    this.router.navigate(['/requests/joining']);
  }

  navigateToWithdrawlRequests(): void {
    this.router.navigate(['/requests/withdrawl']);
  }
}
