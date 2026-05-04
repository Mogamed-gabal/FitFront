import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DietPlanMonitoring } from '../../../../../../core/models/admin/admin-monitoring.model';

@Component({
  selector: 'app-diet-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diet-card.component.html',
  styleUrl: './diet-card.component.scss'
})
export class DietCardComponent {
  @Input() plan!: DietPlanMonitoring;
  @Input() isExpanded = false;
  @Input() expandedType: 'details' | 'progress' | null = null;

  @Output() viewDetails = new EventEmitter<string>();
  @Output() viewProgress = new EventEmitter<string>();

  protected getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'paused':
        return 'status-paused';
      default:
        return 'status-unknown';
    }
  }

  protected getProgressClass(progress: number): string {
    if (progress >= 80) return 'progress-high';
    if (progress >= 50) return 'progress-medium';
    return 'progress-low';
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  protected onViewDetailsClick(): void {
    this.viewDetails.emit(this.plan._id);
  }

  protected onViewProgressClick(): void {
    this.viewProgress.emit(this.plan._id);
  }
}
