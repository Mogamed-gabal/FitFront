import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from '../../../../core/services/subscription.service';

@Component({
  selector: 'app-subscription-table',
  imports: [CommonModule],
  templateUrl: './subscription-table.component.html',
  styleUrl: './subscription-table.component.scss'
})
export class SubscriptionTableComponent {
  @Input() subscriptions: Subscription[] = [];
  @Input() isLoading = false;
  @Input() pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } = {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false
  };

  @Output() viewSubscription = new EventEmitter<Subscription>();
  @Output() cancelSubscription = new EventEmitter<Subscription>();
  @Output() renewSubscription = new EventEmitter<Subscription>();
  @Output() pageChange = new EventEmitter<number>();

  onView(subscription: Subscription): void {
    this.viewSubscription.emit(subscription);
  }

  onCancel(subscription: Subscription): void {
    this.cancelSubscription.emit(subscription);
  }

  onRenew(subscription: Subscription): void {
    this.renewSubscription.emit(subscription);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
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
