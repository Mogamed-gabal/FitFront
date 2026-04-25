import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from '../../../../core/services/subscription.service';

@Component({
  selector: 'app-subscription-details-modal',
  imports: [CommonModule],
  templateUrl: './subscription-details-modal.component.html',
  styleUrl: './subscription-details-modal.component.scss'
})
export class SubscriptionDetailsModalComponent {
  @Input() subscription: Subscription | null = null;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'active';
      case 'PENDING':
        return 'pending';
      case 'CANCELLED':
        return 'cancelled';
      case 'EXPIRED':
        return 'expired';
      default:
        return '';
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'PAID':
        return 'paid';
      case 'PENDING':
        return 'pending';
      case 'FAILED':
        return 'failed';
      default:
        return '';
    }
  }
}
