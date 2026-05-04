import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DietPlanMonitoring } from '../../../../../../core/models/admin/admin-monitoring.model';

@Component({
  selector: 'app-diet-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diet-details.component.html',
  styleUrl: './diet-details.component.scss'
})
export class DietDetailsComponent {
  @Input() plan: DietPlanMonitoring | null = null;

  protected getDaysOfWeek(): string[] {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  }

  protected getDayPlan(day: string): any {
    return this.plan?.weeklyPlan?.[day] || null;
  }

  protected formatCalories(calories: number): string {
    return `${calories} cal`;
  }

  protected getMealIcon(mealType: string): string {
    switch (mealType) {
      case 'breakfast':
        return 'fa-solid fa-coffee';
      case 'lunch':
        return 'fa-solid fa-utensils';
      case 'dinner':
        return 'fa-solid fa-moon';
      default:
        return 'fa-solid fa-bowl-food';
    }
  }
}
