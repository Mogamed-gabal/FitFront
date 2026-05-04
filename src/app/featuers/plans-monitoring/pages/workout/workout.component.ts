import { Component, signal, computed, inject, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, Subject, takeUntil } from 'rxjs';
import { AdminMonitoringService } from '../../../../core/services/admin/admin-monitoring.service';
import { WorkoutPlanMonitoring, WorkoutPlanProgress, WorkoutPlanFilters } from '../../../../core/models/admin/admin-monitoring.model';
import { WorkoutCardComponent } from './components/workout-card/workout-card.component';
import { WorkoutFilterComponent } from './components/workout-filter/workout-filter.component';
import { WorkoutDetailsComponent } from './components/workout-details/workout-details.component';
import { WorkoutProgressComponent } from './components/workout-progress/workout-progress.component';

@Component({
  selector: 'app-workout',
  standalone: true,
  imports: [CommonModule, WorkoutCardComponent, WorkoutFilterComponent, WorkoutDetailsComponent, WorkoutProgressComponent],
  templateUrl: './workout.component.html',
  styleUrl: './workout.component.scss'
})
export class WorkoutComponent implements OnInit, OnDestroy {
  private adminMonitoringService = inject(AdminMonitoringService);
  private destroy$ = new Subject<void>();

  protected readonly isLoading = signal(false);
  protected readonly workoutPlans = signal<WorkoutPlanMonitoring[]>([]);
  protected readonly filters = signal<WorkoutPlanFilters>({});
  protected readonly selectedPlanId = signal<string | null>(null);
  protected readonly expandedType = signal<'details' | 'progress' | null>(null);
  protected readonly selectedPlanProgress = signal<WorkoutPlanProgress | null>(null);

  protected readonly filteredPlans = computed(() => {
    const plans = this.workoutPlans();
    const currentFilters = this.filters();

    return plans.filter(plan => {
      if (currentFilters.status && plan.status !== currentFilters.status) {
        return false;
      }
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        return plan.name.toLowerCase().includes(searchLower) ||
               plan.clientName.toLowerCase().includes(searchLower);
      }
      return true;
    });
  });

  @Output() back = new EventEmitter<void>();

  ngOnInit(): void {
    this.loadWorkoutPlans();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected loadWorkoutPlans(): void {
    this.isLoading.set(true);
    this.adminMonitoringService.getWorkoutPlans(this.filters())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.workoutPlans.set(response.data.workoutPlans);
          }
        },
        error: (error) => {
          console.error('Error loading workout plans:', error);
        }
      });
  }

  protected onFiltersChange(newFilters: WorkoutPlanFilters): void {
    this.filters.set(newFilters);
    this.loadWorkoutPlans();
  }

  protected clearFilters(): void {
    this.onFiltersChange({});
  }

  protected onViewDetails(planId: string): void {
    if (this.selectedPlanId() === planId && this.expandedType() === 'details') {
      this.selectedPlanId.set(null);
      this.expandedType.set(null);
    } else {
      this.selectedPlanId.set(planId);
      this.expandedType.set('details');
      this.selectedPlanProgress.set(null);
    }
  }

  protected onViewProgress(planId: string): void {
    if (this.selectedPlanId() === planId && this.expandedType() === 'progress') {
      this.selectedPlanId.set(null);
      this.expandedType.set(null);
      this.selectedPlanProgress.set(null);
    } else {
      this.selectedPlanId.set(planId);
      this.expandedType.set('progress');
      this.loadPlanProgress(planId);
    }
  }

  private loadPlanProgress(planId: string): void {
    this.adminMonitoringService.getWorkoutPlanProgress(planId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.selectedPlanProgress.set(response.data);
          }
        },
        error: (error) => {
          console.error('Error loading plan progress:', error);
        }
      });
  }

  protected getSelectedPlan(): WorkoutPlanMonitoring | null {
    return this.workoutPlans().find(plan => plan._id === this.selectedPlanId()) || null;
  }

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
}
