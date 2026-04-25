import { Component, EventEmitter, Input, Output, inject, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { ActionType, TargetType } from '../../../../../core/models/audit/audit-log.model';
import { AuditFilters } from '../../../../../core/models/audit/audit-filters.model';

@Component({
  selector: 'app-audit-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-filters.component.html',
  styleUrls: ['./audit-filters.component.scss']
})
export class AuditFiltersComponent implements OnChanges {
  @Input() actionTypes: ActionType[] = [];
  @Input() targetTypes: TargetType[] = [];
  @Output() filtersChange = new EventEmitter<AuditFilters>();

  // Filter state
  private searchSubject = new Subject<string>();
  protected filters = signal<AuditFilters>({
    page: 1,
    limit: 10
  });

  // Computed values
  protected currentSearch = computed(() => this.filters().search || '');
  protected currentAction = computed(() => this.filters().action || '');
  protected currentTarget = computed(() => this.filters().target || '');
  protected currentOutcome = computed(() => this.filters().outcome || '');
  protected currentDateFrom = computed(() => this.filters().dateFrom || '');
  protected currentDateTo = computed(() => this.filters().dateTo || '');

  constructor() {
    // Setup debounced search
    this.searchSubject
      .pipe(debounceTime(500))
      .subscribe(searchTerm => {
        this.updateFilter({ search: searchTerm });
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['actionTypes']) {
      this.actionTypes = changes['actionTypes'].currentValue || [];
    }
    if (changes['targetTypes']) {
      this.targetTypes = changes['targetTypes'].currentValue || [];
    }
  }

  protected onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  protected onActionChange(action: string): void {
    this.updateFilter({ action: action || undefined });
  }

  protected onTargetChange(target: string): void {
    this.updateFilter({ target: target || undefined });
  }

  protected onOutcomeChange(outcome: string): void {
    this.updateFilter({ outcome: outcome as 'success' | 'failure' | 'error' || undefined });
  }

  protected onDateFromChange(dateFrom: string): void {
    this.updateFilter({ dateFrom: dateFrom || undefined });
  }

  protected onDateToChange(dateTo: string): void {
    this.updateFilter({ dateTo: dateTo || undefined });
  }

  protected onApplyFilters(): void {
    // Emit current filters
    this.filtersChange.emit(this.filters());
  }

  protected onResetFilters(): void {
    // Reset all filters
    this.filters.set({
      page: 1,
      limit: 10
    });
    this.filtersChange.emit(this.filters());
  }

  private updateFilter(updates: Partial<AuditFilters>): void {
    const currentFilters = this.filters();
    const newFilters = { ...currentFilters, ...updates, page: 1 }; // Reset to page 1 when filters change
    this.filters.set(newFilters);
    this.filtersChange.emit(newFilters);
  }

  protected getActionName(actionType: string): string {
    const action = this.actionTypes.find(a => a.type === actionType);
    return action?.name || actionType;
  }

  protected getTargetName(targetType: string): string {
    const target = this.targetTypes.find(t => t.type === targetType);
    return target?.name || targetType;
  }

  protected getActionTypesArray(): ActionType[] {
    return Array.isArray(this.actionTypes) ? this.actionTypes : [];
  }

  protected getTargetTypesArray(): TargetType[] {
    return Array.isArray(this.targetTypes) ? this.targetTypes : [];
  }
}
