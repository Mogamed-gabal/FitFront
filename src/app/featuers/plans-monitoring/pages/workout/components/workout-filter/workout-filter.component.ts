import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WorkoutPlanFilters } from '../../../../../../core/models/admin/admin-monitoring.model';

@Component({
  selector: 'app-workout-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workout-filter.component.html',
  styleUrl: './workout-filter.component.scss'
})
export class WorkoutFilterComponent {
  @Output() filtersChange = new EventEmitter<WorkoutPlanFilters>();

  protected searchSubject = new Subject<string>();
  protected selectedStatus: string = 'all';
  protected searchQuery: string = '';
  private destroy$ = new Subject<void>();

  constructor() {
    this.setupSearchDebounce();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.emitFilters();
    });
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.searchSubject.next(this.searchQuery);
  }

  protected onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.emitFilters();
  }

  protected clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'all';
    this.emitFilters();
  }

  protected get hasActiveFilters(): boolean {
    return this.searchQuery.trim() !== '' || this.selectedStatus !== 'all';
  }

  private emitFilters(): void {
    const filters: WorkoutPlanFilters = {};
    
    if (this.searchQuery.trim()) {
      filters.search = this.searchQuery.trim();
    }
    
    if (this.selectedStatus !== 'all') {
      filters.status = this.selectedStatus as 'active' | 'completed' | 'paused';
    }

    this.filtersChange.emit(filters);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
