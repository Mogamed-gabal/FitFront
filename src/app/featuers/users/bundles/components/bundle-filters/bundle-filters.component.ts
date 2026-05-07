import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import type { BundleStatus, SortField, SortOrder } from '../../../../../core/models/bundle.interface';

@Component({
  selector: 'app-bundle-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './bundle-filters.component.html',
  styleUrl: './bundle-filters.component.scss'
})
export class BundleFiltersComponent {
  // Inputs
  @Input() searchTerm = signal<string>('');
  @Input() selectedStatus = signal<BundleStatus>('active');
  @Input() selectedSortField = signal<SortField>('createdAt');
  @Input() selectedSortOrder = signal<SortOrder>('desc');

  // Outputs
  @Output() searchChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<BundleStatus>();
  @Output() sortChange = new EventEmitter<{field: SortField, order: SortOrder}>();
  @Output() itemsPerPageChange = new EventEmitter<number>();
  @Output() clearFilters = new EventEmitter<void>();

  // Local state
  itemsPerPage = signal<number>(12);

  // Constants
  readonly statusOptions: { value: BundleStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'all', label: 'All' }
  ];

  readonly sortFieldOptions: { value: SortField; label: string }[] = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'name', label: 'Name' },
    { value: 'pricing.oneMonth', label: 'Price' },
    { value: 'updatedAt', label: 'Updated Date' }
  ];

  readonly sortOrderOptions: { value: SortOrder; label: string }[] = [
    { value: 'desc', label: 'Descending' },
    { value: 'asc', label: 'Ascending' }
  ];

  readonly itemsPerPageOptions = [6, 12, 24, 48];

  // Event handlers
  onSearchInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchChange.emit(target.value);
  }

  onStatusSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.statusChange.emit(target.value as BundleStatus);
  }

  onSortFieldChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.emitSortChange(target.value as SortField, this.selectedSortOrder());
  }

  onSortOrderChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.emitSortChange(this.selectedSortField(), target.value as SortOrder);
  }

  private emitSortChange(field: SortField, order: SortOrder): void {
    this.sortChange.emit({ field, order });
  }

  onItemsPerPageSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage.set(Number(target.value));
    this.itemsPerPageChange.emit(Number(target.value));
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }
}
