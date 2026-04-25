import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLog } from '../../../../../core/models/audit/audit-log.model';

@Component({
  selector: 'app-audit-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-table.component.html',
  styleUrl: './audit-table.component.scss'
})
export class AuditTableComponent {
  @Input({ required: true }) logs: AuditLog[] = [];
  @Input() pagination: any = {};
  @Output() logClick = new EventEmitter<AuditLog>();
  @Output() pageChange = new EventEmitter<number>();

  protected getOutcomeClass(outcome: string): string {
    switch (outcome) {
      case 'success': return 'outcome-success';
      case 'failure': return 'outcome-failure';
      case 'error': return 'outcome-error';
      default: return '';
    }
  }

  protected getOutcomeIcon(outcome: string): string {
    switch (outcome) {
      case 'success': return 'fa-check-circle';
      case 'failure': return 'fa-times-circle';
      case 'error': return 'fa-exclamation-circle';
      default: return 'fa-circle';
    }
  }

  protected formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected formatDuration(duration: number): string {
    if (duration < 1000) {
      return `${duration}ms`;
    }
    return `${(duration / 1000).toFixed(2)}s`;
  }

  protected onLogRowClick(log: AuditLog): void {
    this.logClick.emit(log);
  }

  protected onPageChangeClick(page: number): void {
    this.pageChange.emit(page);
  }

  protected getModuleIcon(module: string): string {
    switch (module?.toLowerCase()) {
      case 'auth': return 'fa-key';
      case 'users': return 'fa-users';
      case 'supervisor': return 'fa-user-shield';
      case 'doctor': return 'fa-user-doctor';
      case 'client': return 'fa-user';
      case 'subscription': return 'fa-credit-card';
      case 'requests': return 'fa-clipboard-list';
      case 'audit': return 'fa-history';
      default: return 'fa-cog';
    }
  }
}
