import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SupervisorService } from '../../../../../core/services/supervisor.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

interface AuditLog {
  _id: string;
  adminId: string;
  actionType: string;
  targetId: string;
  targetType: string;
  details: {
    reason: string;
    changes?: {
      oldValues?: any;
      newValues?: any;
    };
    metadata: {
      performedBy: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    };
  };
  requestInfo: {
    endpoint: string;
    method: string;
    ipAddress: string;
  };
  result: 'success' | 'fail';
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-audit',
  imports: [CommonModule, JsonPipe],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss'
})
export class AuditComponent implements OnInit, OnDestroy {
  private supervisorId = signal<string>('');
  private auditLogs = signal<AuditLog[]>([]);
  private isLoading = signal<boolean>(true);
  private expandedCards = signal<Set<string>>(new Set());
  private error = signal<string | null>(null);

  // Computed properties for template access
  readonly auditLogsValue = computed(() => this.auditLogs());
  readonly isLoadingValue = computed(() => this.isLoading());
  readonly expandedCardsValue = computed(() => this.expandedCards());
  readonly errorValue = computed(() => this.error());

  constructor(
    private route: ActivatedRoute,
    private supervisorService: SupervisorService
  ) {}

  ngOnInit(): void {
    this.supervisorId.set(this.route.snapshot.paramMap.get('id') || '');
    this.loadAuditLogs();
  }

  private loadAuditLogs(): void {
    if (!this.supervisorId()) {
      this.error.set('Supervisor ID not found');
      this.isLoading.set(false);
      return;
    }

    this.supervisorService.getPermissionHistory(this.supervisorId())
      .pipe(
        takeUntilDestroyed(),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.auditLogs.set(response.data.history || []);
          } else {
            this.error.set('Failed to load audit logs');
          }
        },
        error: (error: any) => {
          this.error.set('Error loading audit logs');
          console.error('Error loading audit logs:', error);
        }
      });
  }

  toggleCardExpansion(logId: string): void {
    const current = this.expandedCards();
    const newSet = new Set(current);
    
    if (newSet.has(logId)) {
      newSet.delete(logId);
    } else {
      newSet.add(logId);
    }
    
    this.expandedCards.set(newSet);
  }

  isCardExpanded(logId: string): boolean {
    return this.expandedCards().has(logId);
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

  formatActionType(actionType: string): string {
    return actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getActionIcon(actionType: string): string {
    const iconMap: { [key: string]: string } = {
      'approve_user': 'fas fa-user-check',
      'reject_user': 'fas fa-user-times',
      'block_user': 'fas fa-user-slash',
      'unblock_user': 'fas fa-user',
      'create_supervisor': 'fas fa-user-plus',
      'delete_supervisor': 'fas fa-user-minus',
      'create_bundle': 'fas fa-box',
      'update_bundle': 'fas fa-edit',
      'deactivate_bundle': 'fas fa-pause',
      'activate_bundle': 'fas fa-play',
      'delete_bundle': 'fas fa-trash',
      'grant_permission': 'fas fa-key',
      'revoke_permission': 'fas fa-lock'
    };
    return iconMap[actionType] || 'fas fa-cog';
  }

  retryLoading(): void {
    this.error.set(null);
    this.isLoading.set(true);
    this.loadAuditLogs();
  }

  ngOnDestroy(): void {
    // Cleanup handled by takeUntilDestroyed
  }
}
