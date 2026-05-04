import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutPlanMonitoring } from '../../../../../../core/models/admin/admin-monitoring.model';

@Component({
  selector: 'app-workout-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workout-details.component.html',
  styleUrl: './workout-details.component.scss'
})
export class WorkoutDetailsComponent {
  @Input() plan: WorkoutPlanMonitoring | null = null;

  protected getDaysOfWeek(): string[] {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  }

  protected getDayPlan(day: string): any {
    if (!this.plan?.weeklyPlan) return null;
    return this.plan.weeklyPlan[day.toLowerCase()] || null;
  }

  protected getExerciseIcon(index: number): string {
    const icons = [
      'fa-solid fa-dumbbell',
      'fa-solid fa-person-running',
      'fa-solid fa-heart-pulse',
      'fa-solid fa-fire-flame-curved',
      'fa-solid fa-bolt',
      'fa-solid fa-weight-hanging'
    ];
    return icons[index % icons.length];
  }

  protected formatSetsRepsWeight(sets: number, reps: number, weight: number): string {
    return `${sets} sets × ${reps} reps @ ${weight}kg`;
  }

  protected formatRestTime(restTime: number): string {
    if (restTime < 60) {
      return `${restTime}s rest`;
    } else {
      const minutes = Math.floor(restTime / 60);
      const seconds = restTime % 60;
      return `${minutes}m${seconds > 0 ? ` ${seconds}s` : ''} rest`;
    }
  }
}
