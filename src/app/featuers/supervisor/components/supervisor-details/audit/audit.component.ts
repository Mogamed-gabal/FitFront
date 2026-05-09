import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupervisorService } from '../../../../../core/services/supervisor.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

interface AuditLog {
  _id: string;
  supervisorId: string;
  actionType: string;
  targetId: string;
  targetType: string;
  date: string;
  metadata: any;
}

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, JsonPipe],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss'
})
export class AuditComponent implements OnInit, OnDestroy {
  private supervisorId = signal<string>('');
  protected auditLogs = signal<AuditLog[]>([]);
  protected isLoading = signal<boolean>(false);
  private pagination = signal<any>({});
  protected selectedLog = signal<AuditLog | null>(null);
  protected showDetailsModal = signal(false);
  protected error = signal<string | null>(null);
  
  // Filter state
  protected filters = signal({
    actionType: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });

  // Computed properties
  readonly currentPage = computed(() => this.pagination()?.page || 1);
  readonly totalPages = computed(() => this.pagination()?.pages || 1);
  readonly hasPrev = computed(() => this.pagination()?.hasPrev || false);
  readonly hasNext = computed(() => this.pagination()?.hasNext || false);

  constructor(
    private route: ActivatedRoute,
    private supervisorService: SupervisorService
  ) {}

  ngOnInit(): void {
    this.supervisorId.set(this.route.snapshot.paramMap.get('id') || '');
    this.loadAuditLogs();
  }

  protected loadAuditLogs(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    const params = {
      page: this.filters().page,
      limit: this.filters().limit,
      actionType: this.filters().actionType || undefined,
      startDate: this.filters().startDate || undefined,
      endDate: this.filters().endDate || undefined
    };

    this.supervisorService.getAuditLogs(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.auditLogs.set(response.data.logs || []);
            this.pagination.set(response.data.pagination || {});
          } else {
            this.error.set('Failed to load audit logs');
            this.auditLogs.set([]);
          }
        },
        error: (error: any) => {
          this.error.set('Error loading audit logs');
          this.auditLogs.set([]);
          console.error('Error loading audit logs:', error);
        }
      });
  }

  onFiltersChange(newFilters: any): void {
    this.filters.set({ ...this.filters(), ...newFilters, page: 1 });
    this.loadAuditLogs();
  }

  onResetFilters(): void {
    this.filters.set({
      actionType: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10
    });
    this.loadAuditLogs();
  }

  onPageChange(page: number): void {
    this.filters.set({ ...this.filters(), page });
    this.loadAuditLogs();
  }

  onViewDetails(log: AuditLog): void {
    this.selectedLog.set(log);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedLog.set(null);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getActionBadgeClass(actionType: string): string {
    const type = actionType.toLowerCase();
    if (type.includes('create')) return 'badge-success';
    if (type.includes('update')) return 'badge-primary';
    if (type.includes('delete')) return 'badge-danger';
    return 'badge-secondary';
  }

  ngOnDestroy(): void {
    // Cleanup
  }
}
