import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subscription-filter',
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription-filter.component.html',
  styleUrl: './subscription-filter.component.scss'
})
export class SubscriptionFilterComponent {
  @Output() filtersChange = new EventEmitter<any>();

  filters = {
    search: '',
    status: '',
    planType: ''
  };

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'EXPIRED', label: 'Expired' }
  ];

  planTypeOptions = [
    { value: '', label: 'All Plans' },
    { value: 'BASIC', label: 'Basic' },
    { value: 'PREMIUM', label: 'Premium' },
    { value: 'PROFESSIONAL', label: 'Professional' }
  ];

  onFiltersChange(): void {
    this.filtersChange.emit(this.filters);
  }

  onSearchChange(): void {
    // Debounce search if needed
    this.onFiltersChange();
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      status: '',
      planType: ''
    };
    this.onFiltersChange();
  }
}
