import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DietPlanFilters } from '../../../../../../core/models/admin/admin-monitoring.model';

@Component({
  selector: 'app-diet-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diet-filter.component.html',
  styleUrl: './diet-filter.component.scss'
})
export class DietFilterComponent {
  @Output() filtersChange = new EventEmitter<DietPlanFilters>();

  protected searchSubject = new Subject<string>();
  protected selectedStatus: string = 'all';
  protected searchQuery: string = '';
  private destroy$ = new Subject<void>();

  constructor() {
    // Debounced search (300ms)
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchValue => {
      this.emitFilters();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery = value;
    this.searchSubject.next(value);
  }

  protected onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.emitFilters();
  }

  protected clearFilters(): void {
    this.selectedStatus = 'all';
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  private emitFilters(): void {
    const filters: DietPlanFilters = {
      search: this.searchQuery || undefined,
      status: this.selectedStatus === 'all' ? undefined : this.selectedStatus as 'active' | 'completed' | 'paused'
    };
    this.filtersChange.emit(filters);
  }

  protected readonly statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'paused', label: 'Paused' }
  ];
}
