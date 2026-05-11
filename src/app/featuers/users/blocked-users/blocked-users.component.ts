import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { finalize, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BlockedUsersService, BlockedUser, GetBlockedUsersParams } from '../../../core/services/users/blocked-users.service';
import { DoctorService } from '../../../core/services/users/doctor.service';
import { ClientService } from '../../../core/services/users/client.service';
import { BlockedFilterComponent } from './components/blocked-filter/blocked-filter.component';
import { BlockedTableComponent } from './components/blocked-table/blocked-table.component';
import { BlockedModelComponent } from './components/blocked-model/blocked-model.component';
import Swal from 'sweetalert2';

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
  private readonly clientService = inject(ClientService);
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

  goToPage(page: number | string): void {
    const pageNumber = typeof page === 'number' ? page : parseInt(page as string);
    if (pageNumber < 1 || pageNumber > this.pagination().totalPages || pageNumber === this.currentPage()) {
      return;
    }
    this.currentPage.set(pageNumber);
    this.loadBlockedUsers();
  }

  getPageNumbers(): (string | number)[] {
    const currentPage = this.currentPage();
    const totalPages = this.pagination().totalPages;
    const delta = 2;
    const range: (string | number)[] = [];
    const rangeWithDots: (string | number)[] = [];

    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      range.push(i);
    }

    if (totalPages <= 7) {
      return range;
    }

    let left = Math.max(1, currentPage - delta);
    let right = Math.min(totalPages, currentPage + delta);
    const middle = Math.floor((left + right) / 2);

    if (left > 1 && middle > left && middle < right) {
      rangeWithDots.push('...');
    }

    if (right < totalPages) {
      rangeWithDots.push(right);
    }

    return rangeWithDots;
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

    // Show reason dialog first
    Swal.fire({
      title: 'Unblock User?',
      text: `Are you sure you want to unblock ${user.name}?`,
      icon: 'question',
      input: 'text',
      inputLabel: 'Unblock Reason',
      inputPlaceholder: 'Enter reason for unblocking...',
      showCancelButton: true,
      confirmButtonText: 'Unblock',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#16a34a',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'Please enter a reason for unblocking!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const reason = result.value.trim();
        
        // Show loading toast
        Swal.fire({
          title: 'Unblocking User...',
          text: `Please wait while unblocking ${user.name}`,
          icon: 'info',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.loading.set(true);
        this.errorMessage.set(null);

        // Use correct service based on user role
        let unblockObservable;
        
        switch (user.role) {
          case 'doctor':
            unblockObservable = this.doctorService.unblockDoctor(userId);
            break;
          case 'client':
            unblockObservable = this.clientService.unblockClient(userId, reason);
            break;
          case 'supervisor':
            unblockObservable = this.doctorService.unblockDoctor(userId);
            break;
          default:
            unblockObservable = this.clientService.unblockClient(userId, reason);
        }
        
        unblockObservable.pipe(
          finalize(() => {
            this.loading.set(false);
            Swal.close();
          })
        ).subscribe({
          next: (response: any) => {
            if (response.success) {
              // Show success toast (same as doctor component)
              Swal.close();
              Swal.fire('Unblocked!', `${user.name} has been unblocked.`, 'success');
              
              this.closeModal();
              this.loadBlockedUsers();
            } else {
              // Show error toast
              Swal.close();
              Swal.fire('Unblock Failed', response.message || 'Failed to unblock user. Please try again.', 'error');
              this.errorMessage.set(response.message || 'Failed to unblock user. Please try again.');
            }
          },
          error: (err: unknown) => {
            Swal.close();
            // Show error toast (same as doctor component)
            this.errorMessage.set('Failed to unblock user. Please try again.');
          }
        });
      }
    });
  }

  onBlockUser(userId: string, reason: string): void {
    const user = this.blockedUsers().find(u => u._id === userId);
    if (!user) return;

    // Show confirmation dialog
    Swal.fire({
      title: 'Block User?',
      text: `Are you sure you want to block ${user.name}?`,
      icon: 'warning',
      input: 'text',
      inputLabel: 'Block Reason',
      inputPlaceholder: 'Enter reason for blocking...',
      inputValue: reason,
      showCancelButton: true,
      confirmButtonText: 'Block',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'Please enter a reason for blocking!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const blockReason = result.value.trim();
        
        // Show loading toast
        Swal.fire({
          title: 'Blocking User...',
          text: `Please wait while blocking ${user.name}`,
          icon: 'info',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.loading.set(true);
        this.errorMessage.set(null);

        // Use client service for blocking
        this.clientService.blockClient(userId, blockReason).pipe(
          finalize(() => {
            this.loading.set(false);
            Swal.close();
          })
        ).subscribe({
          next: (response: any) => {
            if (response.success) {
              // Show success toast
              Swal.fire({
                icon: 'success',
                title: 'Blocked!',
                text: `${user.name} has been successfully blocked.`,
                timer: 3000,
                showConfirmButton: false,
                timerProgressBar: true
              });
              
              this.closeModal();
              this.loadBlockedUsers();
            } else {
              // Show error toast
              Swal.fire({
                icon: 'error',
                title: 'Block Failed',
                text: response.message || 'Failed to block user. Please try again.',
                timer: 3000,
                showConfirmButton: false,
                timerProgressBar: true
              });
              this.errorMessage.set(response.message || 'Failed to block user. Please try again.');
            }
          },
          error: (err: unknown) => {
            Swal.close();
            // Show error toast
            Swal.fire({
              icon: 'error',
              title: 'Block Failed',
              text: 'Failed to block user. Please try again.',
              timer: 3000,
              showConfirmButton: false,
              timerProgressBar: true
            });
            this.errorMessage.set('Failed to block user. Please try again.');
          }
        });
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
