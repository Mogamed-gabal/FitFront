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
  @Input() plan: any | null = null;
  @Input() isExpanded: boolean = false;
  @Input() expandedType: 'details' | 'progress' | null = null;
  
  @Output() viewDetails = new EventEmitter<string>();
  @Output() viewProgress = new EventEmitter<string>();

  protected getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'completed':
        return 'status-completed';
      case 'paused':
        return 'status-paused';
      default:
        return 'status-inactive';
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

  protected calculateProgress(): number {
    if (!this.plan?.weeklyPlan) return 0;
    
    let totalExercises = 0;
    let completedExercises = 0;
    
    this.plan.weeklyPlan.forEach((day: any) => {
      day.exercises.forEach((exercise: any) => {
        totalExercises++;
        if (exercise.status === 'completed') {
          completedExercises++;
        }
      });
    });
    
    return totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
  }

  protected getTotalWorkouts(): number {
    if (!this.plan?.weeklyPlan) return 0;
    
    let totalExercises = 0;
    this.plan.weeklyPlan.forEach((day: any) => {
      totalExercises += day.exercises.length;
    });
    
    return totalExercises;
  }

  protected getCompletedWorkouts(): number {
    if (!this.plan?.weeklyPlan) return 0;
    
    let completedExercises = 0;
    this.plan.weeklyPlan.forEach((day: any) => {
      day.exercises.forEach((exercise: any) => {
        if (exercise.status === 'completed') {
          completedExercises++;
        }
      });
    });
    
    return completedExercises;
  }

  protected getWeeklyPlanPreview(): any[] {
    if (!this.plan?.weeklyPlan) return [];
    
    return this.plan.weeklyPlan.map((day: any) => ({
      name: day.dayName,
      exercises: day.exercises.length,
      completed: day.status === 'completed'
    }));
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
