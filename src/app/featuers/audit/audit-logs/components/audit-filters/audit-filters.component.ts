import { Component, EventEmitter, Input, Output, inject, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['actionTypes']) {
      this.actionTypes = changes['actionTypes'].currentValue || [];
    }
    if (changes['targetTypes']) {
      this.targetTypes = changes['targetTypes'].currentValue || [];
    }
  }

  protected onSearchChange(searchTerm: string): void {
    // Update local filter state without emitting
    const currentFilters = this.filters();
    this.filters.set({ ...currentFilters, search: searchTerm || undefined });
  }

  protected onActionChange(action: string): void {
    // Update local filter state without emitting
    const currentFilters = this.filters();
    this.filters.set({ ...currentFilters, action: action || undefined });
  }

  protected onTargetChange(target: string): void {
    // Update local filter state without emitting
    const currentFilters = this.filters();
    this.filters.set({ ...currentFilters, target: target || undefined });
  }

  protected onOutcomeChange(outcome: string): void {
    // Update local filter state without emitting
    const currentFilters = this.filters();
    const outcomeValue = outcome === '' ? undefined : outcome as 'success' | 'failure' | 'error';
    this.filters.set({ ...currentFilters, outcome: outcomeValue });
  }

  protected onDateFromChange(dateFrom: string): void {
    // Update local filter state without emitting
    const currentFilters = this.filters();
    this.filters.set({ ...currentFilters, dateFrom: dateFrom || undefined });
  }

  protected onDateToChange(dateTo: string): void {
    // Update local filter state without emitting
    const currentFilters = this.filters();
    this.filters.set({ ...currentFilters, dateTo: dateTo || undefined });
  }

  protected onApplyFilters(): void {
    // Emit filters with page reset to 1
    const currentFilters = this.filters();
    const filtersToApply = { ...currentFilters, page: 1 };
    this.filters.set(filtersToApply);
    this.filtersChange.emit(filtersToApply);
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

  protected getActiveFiltersCount(): number {
    const currentFilters = this.filters();
    let count = 0;
    
    if (currentFilters.search) count++;
    if (currentFilters.action) count++;
    if (currentFilters.target) count++;
    if (currentFilters.outcome) count++;
    if (currentFilters.dateFrom) count++;
    if (currentFilters.dateTo) count++;
    
    return count;
  }

  protected clearSearch(): void {
    const currentFilters = this.filters();
    this.filters.set({ ...currentFilters, search: undefined });
  }

  protected getOutcomeClass(outcome: string): string {
    switch (outcome) {
      case 'success': return 'outcome-success';
      case 'failure': return 'outcome-failure';
      case 'error': return 'outcome-error';
      default: return 'outcome-default';
    }
  }

  protected getOutcomeIcon(outcome: string): string {
    switch (outcome) {
      case 'success': return 'fa-check-circle';
      case 'failure': return 'fa-times-circle';
      case 'error': return 'fa-exclamation-triangle';
      default: return 'fa-question-circle';
    }
  }
}
