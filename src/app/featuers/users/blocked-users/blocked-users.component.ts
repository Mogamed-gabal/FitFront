import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { finalize, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BlockedUsersService, BlockedUser, GetBlockedUsersParams } from '../../../core/services/users/blocked-users.service';
import { DoctorService } from '../../../core/services/users/doctor.service';
import { BlockedFilterComponent } from './components/blocked-filter/blocked-filter.component';
import { BlockedTableComponent } from './components/blocked-table/blocked-table.component';
import { BlockedModelComponent } from './components/blocked-model/blocked-model.component';

@Component({
  selector: 'app-blocked-users',
  standalone: true,
  imports: [CommonModule, BlockedFilterComponent, BlockedTableComponent, BlockedModelComponent],
  templateUrl: './blocked-users.component.html',
  styleUrl: './blocked-users.component.scss'
})
export class BlockedUsersComponent implements OnInit {
  private readonly blockedUsersService = inject(BlockedUsersService);
  private readonly doctorService = inject(DoctorService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly searchTrigger$ = new Subject<string>();

  readonly searchTerm = signal('');
  readonly selectedRole = signal<'all' | 'client' | 'doctor'>('all');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly blockedUsers = signal<BlockedUser[]>([]);
  readonly pagination = signal({
    currentPage: 1,
    totalPages: 1,
    totalBlockedUsers: 0,
    hasNext: false,
    hasPrev: false,
  });
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedUser = signal<BlockedUser | null>(null);
  readonly showModal = signal(false);

  ngOnInit(): void {
    this.loadBlockedUsers();
    this.setupSearchListener();
  }

  onSearch(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.currentPage.set(1);
    this.searchTrigger$.next(searchTerm);
  }

  onRoleChange(role: 'all' | 'client' | 'doctor'): void {
    this.selectedRole.set(role);
    this.currentPage.set(1);
    this.loadBlockedUsers();
  }

  nextPage(): void {
    const p = this.pagination();
    if (!p.hasNext) {
      return;
    }
    this.currentPage.update((page) => page + 1);
    this.loadBlockedUsers();
  }

  prevPage(): void {
    const p = this.pagination();
    if (!p.hasPrev) {
      return;
    }
    this.currentPage.update((page) => Math.max(page - 1, 1));
    this.loadBlockedUsers();
  }

  onViewUser(userId: string): void {
    const user = this.blockedUsers().find(u => u._id === userId);
    if (user) {
      this.selectedUser.set(user);
      this.showModal.set(true);
    }
  }

  onUnblockUser(userId: string): void {
    const user = this.blockedUsers().find(u => u._id === userId);
    if (!user) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    // Use doctor service for both client and doctor unblocking
    const unblockMethod = user.role === 'doctor' ? 'unblockDoctor' : 'unblockClient';
    
    (this.doctorService as any)[unblockMethod](userId).pipe(
      finalize(() => {
        this.loading.set(false);
      })
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.closeModal();
          this.loadBlockedUsers();
        } else {
          this.errorMessage.set('Failed to unblock user.');
        }
      },
      error: () => {
        this.errorMessage.set('Failed to unblock user. Please try again.');
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedUser.set(null);
  }

  private loadBlockedUsers(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const params: GetBlockedUsersParams = {
      page: this.currentPage(),
      limit: this.pageSize(),
    };

    if (this.selectedRole() !== 'all') {
      params.role = this.selectedRole() as 'client' | 'doctor';
    }

    this.blockedUsersService
      .getBlockedUsers(params)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response: any) => {
          console.log('🔍 Blocked Users API Response:', response);
          if (response.success && response.data) {
            this.blockedUsers.set(response.data.users);
            
            // Map API pagination to component pagination structure
            const apiPagination = response.data.pagination;
            this.pagination.set({
              currentPage: apiPagination.page,
              totalPages: apiPagination.pages,
              totalBlockedUsers: apiPagination.total,
              hasNext: apiPagination.page < apiPagination.pages,
              hasPrev: apiPagination.page > 1,
            });
            
            console.log('🔍 Blocked Users loaded:', response.data.users?.length || 0);
            console.log('🔍 Pagination:', apiPagination);
          } else {
            this.errorMessage.set('Could not load blocked users.');
          }
        },
        error: () => {
          this.errorMessage.set('Failed to load blocked users. Please try again.');
        },
      });
  }

  private setupSearchListener(): void {
    this.searchTrigger$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.loadBlockedUsers();
      });
  }
}
