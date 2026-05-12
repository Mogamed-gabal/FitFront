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
  @Input() plan: DietPlanMonitoring | null = null;
  @Input() isExpanded = false;
  @Input() expandedType: 'details' | 'progress' | null = null;

  @Output() viewDetails = new EventEmitter<string>();
  @Output() viewProgress = new EventEmitter<string>();

  protected getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-paused';
  }

  protected formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
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

  // Helper methods for the new API structure
  protected get clientName(): string {
    return this.plan?.clientId?.name || 'Unknown Client';
  }

  protected get clientEmail(): string {
    return this.plan?.clientId?.email || '';
  }

  protected get doctorName(): string {
    return this.plan?.doctorId?.name || this.plan?.doctorName || 'Unknown Doctor';
  }

  protected get statusText(): string {
    return this.plan?.isActive ? 'Active' : 'Inactive';
  }

  protected get totalMeals(): number {
    if (!this.plan?.weeklyPlan) return 0;
    return this.plan.weeklyPlan.reduce((total, day) => total + (day.meals?.length || 0), 0);
  }

  protected get totalCalories(): number {
    if (!this.plan?.weeklyPlan) return 0;
    return this.plan.weeklyPlan.reduce((total: number, day: any) => total + (day.dailyTotals?.calories || 0), 0);
  }

  protected get completedDays(): number {
    if (!this.plan?.weeklyPlan) return 0;
    // This would need to be calculated based on actual completion data
    return Math.floor(Math.random() * this.plan.weeklyPlan.length); // Placeholder
  }

  // Add missing getProgressClass method
  protected getProgressClass(progress: number): string {
    if (progress >= 80) return 'progress-high';
    if (progress >= 50) return 'progress-medium';
    return 'progress-low';
  }

  // Add Math helper methods
  protected round(value: number): number {
    return Math.round(value);
  }

  protected max(a: number, b: number): number {
    return Math.max(a, b);
  }
}
