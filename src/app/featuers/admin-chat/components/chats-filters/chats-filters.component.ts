import { Component, EventEmitter, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { ChatFilters } from '../../../../core/models/chat/chat-filters.model';

@Component({
  selector: 'app-chats-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chats-filters.component.html',
  styleUrl: './chats-filters.component.scss'
})
export class ChatsFiltersComponent {
  @Output() filtersChange = new EventEmitter<ChatFilters>();

  // Filter state
  private searchSubject = new Subject<string>();
  protected filters = signal<ChatFilters>({
    page: 1,
    limit: 20
  });

  // Computed values
  protected currentSearch = computed(() => this.filters().search || '');
  protected currentStatus = computed(() => this.filters().status || '');
  protected currentRole = computed(() => this.filters().participantRole || '');
  protected currentSpecialization = computed(() => this.filters().specialization || '');
  protected currentChatType = computed(() => this.filters().chatType || '');

  constructor() {
    // Setup debounced search
    this.searchSubject
      .pipe(debounceTime(500))
      .subscribe(searchTerm => {
        this.updateFilter({ search: searchTerm });
      });
  }

  protected onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  protected onStatusChange(status: string): void {
    this.updateFilter({ status: status as 'ACTIVE' | 'SUSPENDED' | 'CLOSED' || undefined });
  }

  protected onRoleChange(role: string): void {
    this.updateFilter({ participantRole: role as 'client' | 'doctor' || undefined });
  }

  protected onSpecializationChange(specialization: string): void {
    this.updateFilter({ specialization: specialization || undefined });
  }

  protected onChatTypeChange(chatType: string): void {
    this.updateFilter({ chatType: chatType as 'ONE_TO_ONE' | 'GROUP' || undefined });
  }

  protected onApplyFilters(): void {
    this.filtersChange.emit(this.filters());
  }

  protected onResetFilters(): void {
    this.filters.set({
      page: 1,
      limit: 20
    });
    this.filtersChange.emit(this.filters());
  }

  private updateFilter(updates: Partial<ChatFilters>): void {
    const currentFilters = this.filters();
    const newFilters = { ...currentFilters, ...updates, page: 1 };
    this.filters.set(newFilters);
    this.filtersChange.emit(newFilters);
  }
}
