import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GetDeletedUsersParams } from '../../../../../core/models/user/deleted-user.model';

@Component({
  selector: 'app-deleted-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deleted-filter.component.html',
  styleUrl: './deleted-filter.component.scss'
})
export class DeletedFilterComponent {
  @Output() filterChange = new EventEmitter<GetDeletedUsersParams>();

  protected filters: GetDeletedUsersParams = {
    search: '',
    role: '',
    sortBy: 'deletedAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  };

  onApplyFilters(): void {
    this.filterChange.emit({ ...this.filters });
  }

  onResetFilters(): void {
    this.filters = {
      search: '',
      role: '',
      sortBy: 'deletedAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10
    };
    this.filterChange.emit({ ...this.filters });
  }

  onSearchChange(): void {
    // Auto-apply search filter with debounce
    setTimeout(() => {
      this.filterChange.emit({ ...this.filters });
    }, 300);
  }
}
