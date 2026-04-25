import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService, Subscription, GetSubscriptionsResponse } from '../../core/services/subscription.service';
import { SubscriptionTableComponent } from './components/subscription-table/subscription-table.component';
import { SubscriptionFilterComponent } from './components/subscription-filter/subscription-filter.component';

@Component({
  selector: 'app-subscription',
  imports: [CommonModule, SubscriptionTableComponent, SubscriptionFilterComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent implements OnInit {
  subscriptions: Subscription[] = [];
  pagination: {
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

  statistics: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    paidSubscriptions: number;
    pendingSubscriptions: number;
    failedSubscriptions: number;
    totalRevenue: number;
    avgDuration: number;
  } = {
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    paidSubscriptions: 0,
    pendingSubscriptions: 0,
    failedSubscriptions: 0,
    totalRevenue: 0,
    avgDuration: 0
  };
  isLoading = false;
  selectedSubscription: Subscription | null = null;
  showDetailsModal = false;

  filters = {
    page: 1,
    limit: 10,
    status: '',
    planType: ''
  };

  constructor(private subscriptionService: SubscriptionService) {}

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.isLoading = true;
    
    this.subscriptionService.getMySubscriptions(this.filters).subscribe({
      next: (response: GetSubscriptionsResponse) => {
        this.subscriptions = response.data.subscriptions;
        this.pagination = response.data.pagination;
        this.statistics = response.data.statistics;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onFiltersChange(filters: any): void {
    this.filters = { ...this.filters, ...filters, page: 1 };
    this.loadSubscriptions();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadSubscriptions();
  }

  onViewSubscription(subscription: Subscription): void {
    this.selectedSubscription = subscription;
    this.showDetailsModal = true;
  }

  onCancelSubscription(subscription: Subscription): void {
    if (confirm('Are you sure you want to cancel this subscription?')) {
      this.subscriptionService.cancelSubscription(subscription._id, {
        reason: 'User requested cancellation',
        immediate: false
      }).subscribe({
        next: () => {
          this.loadSubscriptions();
        }
      });
    }
  }

  onRenewSubscription(subscription: Subscription): void {
    this.subscriptionService.renewSubscription(subscription._id).subscribe({
      next: () => {
        this.loadSubscriptions();
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedSubscription = null;
  }
}
