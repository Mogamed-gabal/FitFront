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
    this.testApiConnection();
    this.loadInitialData();
  }

  // Temporary test method to verify API connection
  private testApiConnection(): void {
    console.log('Testing API connection...');
    
    // Test with a simple request
    this.auditService.getActionTypes()
      .subscribe({
        next: (response) => {
          console.log('API connection test successful:', response);
        },
        error: (error) => {
          console.error('API connection test failed:', error);
        }
      });
  }

  private loadInitialData(): void {
    this.loadStatistics();
    this.loadLogs();
    this.loadActionTypes();
    this.loadTargetTypes();
    this.loadActivitySummary();
  }

  protected loadStatistics(): void {
    console.log('Loading audit statistics...');
    
    this.auditService.getStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Statistics response:', response);
          
          // Handle different response structures
          let stats = {
            total: 0,
            success: 0,
            failure: 0,
            error: 0
          };
          
          if (response && response.data) {
            // If response has data property
            stats = {
              total: response.data.total || 0,
              success: response.data.success || 0,
              failure: response.data.failure || 0,
              error: response.data.error || 0
            };
          } else if (response) {
            // If response is direct
            stats = {
              total: response.total || 0,
              success: response.success || 0,
              failure: response.failure || 0,
              error: response.error || 0
            };
          }
          
          this.statistics.set(stats);
          console.log('Statistics loaded successfully:', stats);
        },
        error: (error) => {
          console.error('Error loading statistics:', error);
          // Set default values on error
          this.statistics.set({
            total: 0,
            success: 0,
            failure: 0,
            error: 0
          });
        }
      });
  }

  protected loadLogs(): void {
    this.isLoading.set(true);
    
    console.log('Loading audit logs with filters:', this.currentFilters);
    
    this.auditService.getLogs(this.currentFilters)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          console.log('Audit logs response:', response);
          console.log('Response type:', typeof response);
          console.log('Response keys:', response ? Object.keys(response) : 'null');
          
          // Handle the actual API response structure: { success: true, data: { logs: [...], pagination: {...} } }
          let logs = [];
          let pagination = {};
          let statistics = {};
          
          if (response) {
            // Handle the actual API structure: { success: true, data: { logs: [...], pagination: {...} } }
            if (response.success && response.data) {
              logs = response.data.logs || [];
              pagination = response.data.pagination || {};
              statistics = response.data.statistics || {};
            }
            // Handle standard structure
            else if (response.logs && Array.isArray(response.logs)) {
              logs = response.logs;
              pagination = response.pagination || {};
              statistics = response.statistics || {};
            }
            // Handle if response is directly an array
            else if (Array.isArray(response)) {
              logs = response;
              pagination = { page: 1, limit: logs.length, total: logs.length, pages: 1, hasNext: false, hasPrev: false };
              statistics = { total: logs.length, success: 0, failure: 0, error: 0 };
            }
            // Handle if response has data property (direct)
            else if (response.data && Array.isArray(response.data)) {
              logs = response.data;
              pagination = response.pagination || {};
              statistics = response.statistics || {};
            }
          }
          
          // Transform the log data to match the expected interface
          const transformedLogs = logs.map((log: any) => ({
            _id: log._id,
            actor: {
              id: log.adminId?._id || log.adminId,
              name: log.adminId?.name || 'Unknown',
              email: log.adminId?.email || '',
              role: log.adminId?.role || 'unknown'
            },
            action: {
              type: log.actionType || 'unknown',
              name: log.actionType || 'Unknown Action',
              description: log.actionType || 'Unknown action performed'
            },
            target: {
              id: log.targetId || '',
              type: log.targetType || 'Unknown',
              name: log.targetId || 'Unknown Target'
            },
            module: log.details?.requestInfo?.endpoint?.split('/')[2] || 'system',
            context: {
              ip: log.details?.requestInfo?.ipAddress || '',
              userAgent: log.details?.requestInfo?.userAgent || '',
              sessionId: log.sessionId || ''
            },
            details: {
              reason: log.details?.reason,
              previousData: log.details?.changes?.oldValues
            },
            outcome: log.result === 'success' ? 'success' : log.result === 'failure' ? 'failure' : 'error',
            timestamp: log.timestamp || log.createdAt,
            duration: 0 // API doesn't provide duration
          }));
          
          // Calculate statistics from the logs
          const calculatedStats = {
            total: logs.length,
            success: logs.filter((log: any) => log.result === 'success').length,
            failure: logs.filter((log: any) => log.result === 'failure').length,
            error: logs.filter((log: any) => log.result === 'error').length
          };
          
          this.logs.set(transformedLogs);
          this.pagination.set(pagination);
          // Don't override statistics - keep the real totals from loadStatistics()
          console.log('Logs loaded successfully:', transformedLogs.length, 'logs');
        },
        error: (error) => {
          console.error('Error loading logs:', error);
          console.log('Error details:', error.error, error.status, error.message);
          this.logs.set([]);
          this.pagination.set({});
          this.statistics.set({});
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Failed to load audit logs: ${error.message || 'Unknown error'}`,
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
