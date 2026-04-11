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
    await this.confirmAction('block', client.name, () => {
      this.clientService.blockClient(client.id).subscribe({
        next: () => {
          this.loadClients(); // Refresh the list
          Swal.fire('Success!', 'Client has been blocked successfully.', 'success');
        },
        error: (err: unknown) => {
          this.errorMessage.set(this.extractErrorMessage(err));
        }
      });
    });
  }

  protected async onUnblockClient(client: ClientTableRow): Promise<void> {
    await this.confirmAction('unblock', client.name, () => {
      this.clientService.unblockClient(client.id).subscribe({
        next: () => {
          this.loadClients(); // Refresh the list
          Swal.fire('Success!', 'Client has been unblocked successfully.', 'success');
        },
        error: (err: unknown) => {
          this.errorMessage.set(this.extractErrorMessage(err));
        }
      });
    });
  }

  protected async onDeleteClient(client: ClientTableRow): Promise<void> {
    await this.confirmAction('delete', client.name, () => {
      this.clientService.deleteClient(client.id).subscribe({
        next: () => {
          this.loadClients(); // Refresh the list
          Swal.fire('Success!', 'Client has been deleted successfully.', 'success');
        },
        error: (err: unknown) => {
          this.errorMessage.set(this.extractErrorMessage(err));
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
