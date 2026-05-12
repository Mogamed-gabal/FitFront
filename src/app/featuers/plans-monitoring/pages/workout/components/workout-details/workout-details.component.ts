import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutPlanDetails } from '../../../../../../core/models/admin/admin-monitoring.model';

@Component({
  selector: 'app-workout-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workout-details.component.html',
  styleUrl: './workout-details.component.scss'
})
export class WorkoutDetailsComponent {
  @Input() plan: WorkoutPlanDetails | null = null;
  @Input() isModalOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  // Modal state
  protected selectedDayIndex: number = 0;
  protected expandedExerciseId: string | null = null;

  // Get selected day
  protected get selectedDay(): any {
    if (!this.plan?.weeklyPlan) return null;
    return this.plan.weeklyPlan[this.selectedDayIndex];
  }

  protected formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  protected getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'beginner':
        return '#28a745';
      case 'intermediate':
        return '#ffc107';
      case 'advanced':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  protected getEquipmentIcon(equipment: string): string {
    const equipmentIcons: Record<string, string> = {
      'barbell': 'fa-solid fa-weight-hanging',
      'dumbbells': 'fa-solid fa-dumbbell',
      'bodyweight': 'fa-solid fa-user',
      'cable': 'fa-solid fa-link',
      'machine': 'fa-solid fa-cog',
      'resistance': 'fa-solid fa-compress'
    };
    return equipmentIcons[equipment] || 'fa-solid fa-dumbbell';
  }

  // Day selection
  protected selectDay(index: number): void {
    this.selectedDayIndex = index;
    this.expandedExerciseId = null; // Reset expanded exercise
  }

  // Exercise expansion
  protected toggleExercise(exerciseId: string): void {
    this.expandedExerciseId = this.expandedExerciseId === exerciseId ? null : exerciseId;
  }

  // Close modal
  protected onCloseModal(): void {
    this.closeModal.emit();
  }

  // Close on backdrop click
  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCloseModal();
    }
  }

  // ESC key handler
  @HostListener('document:keydown.escape')
  protected onEscapeKey(): void {
    if (this.isModalOpen) {
      this.onCloseModal();
    }
  }

  // Get completion status for day
  protected getDayCompletionStatus(day: any): string {
    if (!day.exercises || day.exercises.length === 0) return 'No exercises';
    
    const completedExercises = day.exercises.filter((ex: any) => ex.status === 'completed').length;
    const totalExercises = day.exercises.length;
    
    if (completedExercises === 0) return 'Not Started';
    if (completedExercises === totalExercises) return 'Completed';
    return `${completedExercises}/${totalExercises} Completed`;
  }

  // Get progress percentage for day
  protected getDayProgressPercentage(day: any): number {
    if (!day.exercises || day.exercises.length === 0) return 0;
    
    const completedExercises = day.exercises.filter((ex: any) => ex.status === 'completed').length;
    return Math.round((completedExercises / day.exercises.length) * 100);
  }
}
