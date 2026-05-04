import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutPlanProgress } from '../../../../../../core/models/admin/admin-monitoring.model';

@Component({
  selector: 'app-workout-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workout-progress.component.html',
  styleUrl: './workout-progress.component.scss'
})
export class WorkoutProgressComponent {
  @Input() progress: WorkoutPlanProgress | null = null;

  protected getProgressClass(progress: number): string {
    if (progress >= 80) return 'progress-high';
    if (progress >= 50) return 'progress-medium';
    return 'progress-low';
  }

  protected getPerformanceStatusClass(actual: number, target: number): string {
    const percentage = (actual / target) * 100;
    if (percentage >= 95 && percentage <= 105) return 'status-perfect';
    if (percentage < 95) return 'status-low';
    return 'status-high';
  }

  protected getPerformanceStatusIcon(actual: number, target: number): string {
    const percentage = (actual / target) * 100;
    if (percentage >= 95 && percentage <= 105) return 'fa-solid fa-check-circle';
    if (percentage < 95) return 'fa-solid fa-arrow-down';
    return 'fa-solid fa-arrow-up';
  }

  protected calculatePerformancePercentage(actual: number, target: number): number {
    return Math.round((actual / target) * 100);
  }

  protected roundNumber(value: number): number {
    return Math.round(value);
  }
}
