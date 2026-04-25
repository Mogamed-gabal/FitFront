import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audit-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-stats.component.html',
  styleUrl: './audit-stats.component.scss'
})
export class AuditStatsComponent {
  @Input({ required: true }) statistics: any = {};

  // Computed values for better performance
  protected readonly totalLogs = computed(() => this.statistics?.total || 0);
  protected readonly successCount = computed(() => this.statistics?.success || 0);
  protected readonly failureCount = computed(() => this.statistics?.failure || 0);
  protected readonly errorCount = computed(() => this.statistics?.error || 0);

  // Computed percentages
  protected readonly successPercentage = computed(() => {
    const total = this.totalLogs();
    return total > 0 ? Math.round((this.successCount() / total) * 100) : 0;
  });

  protected readonly failurePercentage = computed(() => {
    const total = this.totalLogs();
    return total > 0 ? Math.round((this.failureCount() / total) * 100) : 0;
  });

  protected readonly errorPercentage = computed(() => {
    const total = this.totalLogs();
    return total > 0 ? Math.round((this.errorCount() / total) * 100) : 0;
  });

  protected getOutcomeClass(outcome: string): string {
    switch (outcome) {
      case 'success': return 'stat-success';
      case 'failure': return 'stat-failure';
      case 'error': return 'stat-error';
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
}
