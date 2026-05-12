import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DietPlanMonitoring } from '../../../../../../core/models/admin/admin-monitoring.model';

@Component({
  selector: 'app-diet-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diet-details-modal.component.html',
  styleUrl: './diet-details-modal.component.scss'
})
export class DietDetailsModalComponent {
  @Input() plan: DietPlanMonitoring | null = null;
  @Input() isModalOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  // Modal state
  protected selectedDayIndex: number = 0;
  protected expandedMealId: string | null = null;

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

  // Day selection
  protected selectDay(index: number): void {
    this.selectedDayIndex = index;
    this.expandedMealId = null; // Reset expanded meal
  }

  // Meal expansion
  protected toggleMeal(mealId: string): void {
    this.expandedMealId = this.expandedMealId === mealId ? null : mealId;
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
    if (!day.meals || day.meals.length === 0) return 'No meals';
    
    const completedMeals = day.meals.filter((meal: any) => meal.completed === true).length;
    const totalMeals = day.meals.length;
    
    if (completedMeals === 0) return 'Not Started';
    if (completedMeals === totalMeals) return 'Completed';
    return `${completedMeals}/${totalMeals} Completed`;
  }

  // Get progress percentage for day
  protected getDayProgressPercentage(day: any): number {
    if (!day.meals || day.meals.length === 0) return 0;
    
    const completedMeals = day.meals.filter((meal: any) => meal.completed === true).length;
    return Math.round((completedMeals / day.meals.length) * 100);
  }

  // Helper methods for diet-specific data
  protected getMealTypeIcon(mealType: string): string {
    const mealIcons: Record<string, string> = {
      'breakfast': 'fa-solid fa-sun',
      'lunch': 'fa-solid fa-cloud-sun',
      'dinner': 'fa-solid fa-moon',
      'snack': 'fa-solid fa-cookie'
    };
    return mealIcons[mealType] || 'fa-solid fa-utensils';
  }

  protected getMealTypeLabel(mealType: string): string {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  }

  protected getTotalCaloriesForDay(day: any): number {
    return day?.dailyTotals?.calories || 0;
  }

  protected getTotalProteinForDay(day: any): number {
    return day?.dailyTotals?.protein || 0;
  }

  protected getTotalCarbsForDay(day: any): number {
    return day?.dailyTotals?.carbs || 0;
  }

  protected getTotalFatForDay(day: any): number {
    return day?.dailyTotals?.fat || 0;
  }
}
