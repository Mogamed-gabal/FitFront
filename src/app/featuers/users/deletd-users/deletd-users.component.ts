import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { DeletedUsersService } from '../../../core/services/users/deleted-users.service';
import { DeletedUser, GetDeletedUsersParams } from '../../../core/models/user/deleted-user.model';
import { DeletedFilterComponent } from './components/deleted-filter/deleted-filter.component';
import { DeletedTableComponent } from './components/deleted-table/deleted-table.component';
import { DeletedModelComponent } from './components/deleted-model/deleted-model.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-deletd-users',
  standalone: true,
  imports: [CommonModule, FormsModule, DeletedFilterComponent, DeletedTableComponent, DeletedModelComponent],
  templateUrl: './deletd-users.component.html',
  styleUrl: './deletd-users.component.scss'
})
export class DeletdUsersComponent implements OnInit {
  private readonly deletedUsersService = inject(DeletedUsersService);
  private readonly destroy$ = new Subject<void>();

  // State
  users = signal<DeletedUser[]>([]);
  loading = signal(false);
  filters = signal<GetDeletedUsersParams>({});
  pagination = signal<any>({});
  statistics = signal<any>({});
  selectedUser = signal<DeletedUser | null>(null);
  modalVisible = signal(false);
  modalType = signal<'restore' | 'delete'>('restore');

  // Computed
  paginatedUsers = computed(() => this.users());

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    const currentFilters = this.filters();
    
    this.deletedUsersService.getDeletedUsers(currentFilters)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.users.set(response.data.users);
          this.pagination.set(response.data.pagination);
          this.statistics.set(response.data.statistics);
        },
        error: (error) => {
          Swal.fire('Error', error.error?.message || 'Failed to load deleted users', 'error');
        }
      });
  }

  onFilterChange(filters: GetDeletedUsersParams): void {
    this.filters.set(filters);
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.filters.update(current => ({ ...current, page }));
    this.loadUsers();
  }

  onRestore(user: DeletedUser): void {
    this.selectedUser.set(user);
    this.modalType.set('restore');
    this.modalVisible.set(true);
  }

  onPermanentDelete(user: DeletedUser): void {
    this.selectedUser.set(user);
    this.modalType.set('delete');
    this.modalVisible.set(true);
  }

  onModalConfirm(reason?: string): void {
    const user = this.selectedUser();
    if (!user) return;

    const action$ = this.modalType() === 'restore' 
      ? this.deletedUsersService.restoreUser(user._id, reason)
      : this.deletedUsersService.permanentDelete(user._id, reason);

    action$
      .pipe(
        finalize(() => this.modalVisible.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          const action = this.modalType() === 'restore' ? 'restored' : 'permanently deleted';
          Swal.fire('Success', `User ${action} successfully`, 'success');
          this.loadUsers();
        },
        error: (error) => {
          Swal.fire('Error', error.error?.message || `Failed to ${this.modalType()} user`, 'error');
        }
      });
  }

  onModalCancel(): void {
    this.modalVisible.set(false);
    this.selectedUser.set(null);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
