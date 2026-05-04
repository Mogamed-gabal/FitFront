import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DietPlanProgress } from '../../../../../../core/models/admin/admin-monitoring.model';

@Component({
  selector: 'app-diet-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diet-progress.component.html',
  styleUrl: './diet-progress.component.scss'
})
export class DietProgressComponent {
  @Input() progress: DietPlanProgress | null = null;

  protected getProgressClass(progress: number): string {
    if (progress >= 80) return 'progress-high';
    if (progress >= 50) return 'progress-medium';
    return 'progress-low';
  }

  protected getNutritionStatusClass(actual: number, target: number): string {
    const percentage = (actual / target) * 100;
    if (percentage >= 95 && percentage <= 105) return 'status-perfect';
    if (percentage < 95) return 'status-low';
    return 'status-high';
  }

  protected getNutritionStatusIcon(actual: number, target: number): string {
    const percentage = (actual / target) * 100;
    if (percentage >= 95 && percentage <= 105) return 'fa-solid fa-check-circle';
    if (percentage < 95) return 'fa-solid fa-arrow-down';
    return 'fa-solid fa-arrow-up';
  }

  protected calculateNutritionPercentage(actual: number, target: number): number {
    return Math.round((actual / target) * 100);
  }

  protected roundNumber(value: number): number {
    return Math.round(value);
  }
}
