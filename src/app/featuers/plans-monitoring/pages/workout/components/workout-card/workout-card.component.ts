import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutPlanMonitoring } from '../../../../../../core/models/admin/admin-monitoring.model';

@Component({
  selector: 'app-workout-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workout-card.component.html',
  styleUrl: './workout-card.component.scss'
})
export class WorkoutCardComponent {
  @Input() plan: WorkoutPlanMonitoring | null = null;
  @Input() isExpanded: boolean = false;
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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  protected onViewDetailsClick(): void {
    if (this.plan) {
      this.viewDetails.emit(this.plan._id);
    }
  }

  protected onViewProgressClick(): void {
    if (this.plan) {
      this.viewProgress.emit(this.plan._id);
    }
  }
}
