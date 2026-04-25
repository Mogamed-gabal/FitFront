import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivitySummary } from '../../../../../core/models/audit/audit-log.model';

@Component({
  selector: 'app-audit-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-summary.component.html',
  styleUrl: './audit-summary.component.scss'
})
export class AuditSummaryComponent {
  @Input({ required: true }) summary: ActivitySummary | null = null;

  // Computed values
  protected readonly totalActions = computed(() => this.summary?.totalActions || 0);
  protected readonly topActions = computed(() => this.summary?.topActions || []);
  protected readonly userActivity = computed(() => this.summary?.userActivity || []);
  protected readonly dailyActivity = computed(() => this.summary?.dailyActivity || []);

  // Computed percentages for top actions
  protected getActionPercentage(action: any): number {
    const total = this.totalActions();
    return total > 0 ? Math.round((action.count / total) * 100) : 0;
  }

  protected formatPercentage(value: number): string {
    return `${value}%`;
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  protected getDayHeight(count: number): number {
    const maxCount = Math.max(...this.dailyActivity().map(day => day.count));
    return maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
  }
}
