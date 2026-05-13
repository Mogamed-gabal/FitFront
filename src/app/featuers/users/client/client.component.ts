import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { Client } from '../../../core/models/user/client';
import { ClientService } from '../../../core/services/users/client.service';
import { ClientDetailsModalComponent } from './components/client-details-modal/client-details-modal.component';
import { ClientTableComponent } from './components/client-table/client-table.component';
import { ClientTableRow, mapClientToRow } from './client.types';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule, FormsModule, ClientTableComponent, ClientDetailsModalComponent],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
})
export class ClientComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  private readonly searchTrigger$ = new Subject<string>();

  protected readonly searchTerm = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly clients = signal<ClientTableRow[]>([]);
  protected readonly selectedClient = signal<Client | null>(null);

  protected readonly pagination = signal({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false,
  });

  protected readonly loading = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly totalPages = computed(() => this.pagination().totalPages);

  protected readonly paginatedClients = computed(() => this.clients());

  ngOnInit(): void {
    this.searchTrigger$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadClients();
      });

    this.loadClients();
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    this.searchTrigger$.next(term);
  }

  protected nextPage(): void {
    const p = this.pagination();
    if (!p.hasNext) {
      return;
    }
    this.currentPage.update((page) => page + 1);
    this.loadClients();
  }

  protected prevPage(): void {
    const p = this.pagination();
    if (!p.hasPrev) {
      return;
    }
    this.currentPage.update((page) => Math.max(page - 1, 1));
    this.loadClients();
  }

  protected openClientDetails(row: ClientTableRow): void {
    this.detailLoading.set(true);
    this.errorMessage.set(null);

    this.clientService
      .getClientById(row.id)
      .pipe(
        finalize(() => {
          this.detailLoading.set(false);
        }),
      )
      .subscribe({
        next: (client) => {
          if (client) {
            this.selectedClient.set(client);
          } else {
            this.errorMessage.set('Could not load client details.');
          }
        },
        error: (err: unknown) => {
          this.errorMessage.set(this.extractErrorMessage(err));
        },
      });
  }

  protected closeModal(): void {
    this.selectedClient.set(null);
  }

  protected async onBlockClient(client: ClientTableRow): Promise<void> {
    const result = await Swal.fire({
      title: 'Block Client?',
      text: `Are you sure you want to block ${client.name}?`,
      icon: 'warning',
      input: 'text',
      inputLabel: 'Block Reason',
      inputPlaceholder: 'Enter reason for blocking...',
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
    });

    if (result.isConfirmed && result.value) {
      const reason = result.value.trim();
      
      await this.confirmAction('block', client.name, () => {
        this.clientService.blockClient(client.id, reason).subscribe({
          next: () => {
            this.loadClients(); // Refresh the list
            Swal.fire('Success!', 'Client has been blocked successfully.', 'success');
          },
          error: (err: unknown) => {
            Swal.fire('Error!', 'Failed to block client.', 'error');
          }
        });
      });
    }
  }

  protected async onUnblockClient(client: ClientTableRow): Promise<void> {
    // Show alert directing to blocked users page
    await Swal.fire({
      title: 'Unblock Client?',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p><strong>Client:</strong> ${client.name}</p>
          <p><strong>Email:</strong> ${client.email}</p>
          <hr style="margin: 15px 0; border: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            To unblock this client, please go to the <strong>Blocked Users</strong> page where you can manage all blocked users and perform unblock operations.
          </p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Go to Blocked Users',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Navigate to blocked users page
        this.router.navigate(['/users/blocked']);
      }
    });
  }

  protected async onDeleteClient(client: ClientTableRow): Promise<void> {
    await this.confirmAction('delete', client.name, () => {
      // Show loading toast
      Swal.fire({
        title: 'Deleting Client...',
        text: `Please wait while deleting ${client.name}`,
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.clientService.deleteClient(client.id).subscribe({
        next: () => {
          Swal.close();
          this.loadClients(); // Refresh the list
          Swal.fire('Success!', 'Client has been deleted successfully.', 'success');
        },
        error: (err: unknown) => {
          Swal.close();
          this.errorMessage.set(this.extractErrorMessage(err));
          Swal.fire('Error!', 'Failed to delete client. Please try again.', 'error');
        }
      });
    });
  }

  private async confirmAction(action: string, clientName: string, onConfirm: () => void): Promise<void> {
    const actionText = action.charAt(0).toUpperCase() + action.slice(1);
    const message = `Are you sure you want to ${action} client "${clientName}"?`;
    
    const result = await Swal.fire({
      title: `${actionText} Client`,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'delete' ? '#dc2626' : '#6366f1',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, ${actionText.toLowerCase()}`,
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      onConfirm();
    }
  }

  private loadClients(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.clientService
      .getClients({
        page: this.currentPage(),
        limit: this.pageSize(),
        search: this.searchTerm().trim() || undefined,
      })
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (res) => {
          if (!res.success || !res.data) {
            this.clients.set([]);
            this.errorMessage.set('Invalid response from server.');
            return;
          }

          const rows = res.data.users.map((u) => mapClientToRow(u));
          this.clients.set(rows);
          this.pagination.set(res.data.pagination);
          this.currentPage.set(res.data.pagination.currentPage);
        },
        error: (err: unknown) => {
          this.clients.set([]);
          this.errorMessage.set(this.extractErrorMessage(err));
        },
      });
  }


  private extractErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const body = (err as { error?: { message?: string } }).error;
      if (body?.message && typeof body.message === 'string') {
        return body.message;
      }
    }
    return 'Something went wrong. Please try again.';
  }
}
