import { Component, OnInit, inject, signal, computed, afterRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, finalize, Subject, takeUntil } from 'rxjs';
import { AuditService } from '../../../core/services/audit.service';
import { AuditLog, ActionType, TargetType, ActivitySummary } from '../../../core/models/audit/audit-log.model';
import { AuditFilters, ActivitySummaryFilters } from '../../../core/models/audit/audit-filters.model';
import { AuditFiltersComponent } from './components/audit-filters/audit-filters.component';
import { AuditTableComponent } from './components/audit-table/audit-table.component';
import { AuditStatsComponent } from './components/audit-stats/audit-stats.component';
import { AuditSummaryComponent } from './components/audit-summary/audit-summary.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AuditFiltersComponent,
    AuditTableComponent,
    AuditStatsComponent,
    AuditSummaryComponent
  ],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss'
})
export class AuditLogsComponent implements OnInit {
  private readonly auditService = inject(AuditService);
  private readonly destroy$ = new Subject<void>();

  // Signals for state management
  protected readonly logs = signal<AuditLog[]>([]);
  protected readonly pagination = signal<any>({});
  protected readonly statistics = signal<any>({});
  protected readonly isLoading = signal(false);
  protected readonly actionTypes = signal<ActionType[]>([]);
  protected readonly targetTypes = signal<TargetType[]>([]);
  protected readonly activitySummary = signal<ActivitySummary | null>(null);
  protected readonly selectedLog = signal<AuditLog | null>(null);
  protected readonly showDetailsModal = signal(false);

  // Current filters state
  private currentFilters: AuditFilters = {
    page: 1,
    limit: 10
  };

  // Computed signals
  protected readonly hasLogs = computed(() => {
    const logs = this.logs();
    return logs && logs.length > 0;
  });
  protected readonly currentPage = computed(() => {
    const pagination = this.pagination();
    return pagination?.page || 1;
  });
  protected readonly totalPages = computed(() => {
    const pagination = this.pagination();
    return pagination?.pages || 1;
  });
  protected readonly hasPrev = computed(() => {
    const pagination = this.pagination();
    return pagination?.hasPrev || false;
  });
  protected readonly hasNext = computed(() => {
    const pagination = this.pagination();
    return pagination?.hasNext || false;
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loadLogs();
    this.loadActionTypes();
    this.loadTargetTypes();
    this.loadActivitySummary();
  }

  protected loadLogs(): void {
    this.isLoading.set(true);
    
    this.auditService.getLogs(this.currentFilters)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.logs.set(response.logs);
          this.pagination.set(response.pagination);
          this.statistics.set(response.statistics);
        },
        error: (error) => {
          console.error('Error loading logs:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load audit logs. Please try again.',
            confirmButtonColor: '#3b82f6'
          });
        }
      });
  }

  protected loadActionTypes(): void {
    this.auditService.getActionTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (types) => {
          this.actionTypes.set(types);
        },
        error: (error) => {
          console.error('Error loading action types:', error);
        }
      });
  }

  protected loadTargetTypes(): void {
    this.auditService.getTargetTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (types) => {
          this.targetTypes.set(types);
        },
        error: (error) => {
          console.error('Error loading target types:', error);
        }
      });
  }

  protected loadActivitySummary(): void {
    const filters: ActivitySummaryFilters = {
      dateFrom: this.currentFilters.dateFrom,
      dateTo: this.currentFilters.dateTo,
      userId: this.currentFilters.userId
    };

    this.auditService.getActivitySummary(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.activitySummary.set(summary);
        },
        error: (error) => {
          console.error('Error loading activity summary:', error);
        }
      });
  }

  protected onFiltersChange(filters: AuditFilters): void {
    this.currentFilters = { ...this.currentFilters, ...filters, page: 1 };
    this.loadLogs();
    this.loadActivitySummary();
  }

  protected onPageChange(page: number): void {
    this.currentFilters = { ...this.currentFilters, page };
    this.loadLogs();
  }

  protected onLogClick(log: AuditLog): void {
    this.selectedLog.set(log);
    this.showDetailsModal.set(true);
  }

  protected closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedLog.set(null);
  }

  protected getOutcomeClass(outcome: string): string {
    switch (outcome) {
      case 'success': return 'outcome-success';
      case 'failure': return 'outcome-failure';
      case 'error': return 'outcome-error';
      default: return '';
    }
  }

  protected formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  protected formatDuration(duration: number): string {
    if (duration < 1000) {
      return `${duration}ms`;
    }
    return `${(duration / 1000).toFixed(2)}s`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
