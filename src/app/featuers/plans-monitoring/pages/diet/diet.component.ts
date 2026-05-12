import { Component, signal, computed, inject, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, Subject, takeUntil } from 'rxjs';
import { AdminMonitoringService } from '../../../../core/services/admin/admin-monitoring.service';
import { DietPlanMonitoring, DietPlanProgress, DietPlanFilters } from '../../../../core/models/admin/admin-monitoring.model';
import { DietCardComponent } from './components/diet-card/diet-card.component';
import { DietFilterComponent } from './components/diet-filter/diet-filter.component';
import { DietDetailsComponent } from './components/diet-details/diet-details.component';
import { DietProgressComponent } from './components/diet-progress/diet-progress.component';
import { DietDetailsModalComponent } from './components/diet-details-modal/diet-details-modal.component';

@Component({
  selector: 'app-diet',
  standalone: true,
  imports: [CommonModule, DietCardComponent, DietFilterComponent, DietDetailsComponent, DietProgressComponent, DietDetailsModalComponent],
  templateUrl: './diet.component.html',
  styleUrl: './diet.component.scss'
})
export class DietComponent implements OnInit, OnDestroy {
  private adminMonitoringService = inject(AdminMonitoringService);
  private destroy$ = new Subject<void>();

  protected readonly isLoading = signal(false);
  protected readonly dietPlans = signal<DietPlanMonitoring[]>([]);
  protected readonly filters = signal<DietPlanFilters>({});
  protected readonly selectedPlanId = signal<string | null>(null);
  protected readonly expandedType = signal<'details' | 'progress' | null>(null);
  protected readonly selectedPlanProgress = signal<DietPlanProgress | null>(null);
  
  // Modal state
  protected readonly isDetailsModalOpen = signal(false);
  protected readonly selectedPlanDetails = signal<DietPlanMonitoring | null>(null);

  protected readonly filteredPlans = computed(() => {
    const plans = this.dietPlans();
    const currentFilters = this.filters();

    return plans.filter(plan => {
      if (currentFilters.status && plan.isActive !== (currentFilters.status === 'active')) {
        return false;
      }
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        return plan.name.toLowerCase().includes(searchLower) ||
               plan.clientId.name.toLowerCase().includes(searchLower);
      }
      return true;
    });
  });

  @Output() back = new EventEmitter<void>();

  ngOnInit(): void {
    this.loadDietPlans();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected loadDietPlans(): void {
    this.isLoading.set(true);
    this.adminMonitoringService.getDietPlans(this.filters())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.dietPlans.set(response.data.dietPlans);
          }
        },
        error: (error) => {
          console.error('Error loading diet plans:', error);
        }
      });
  }

  protected onFiltersChange(newFilters: DietPlanFilters): void {
    this.filters.set(newFilters);
    this.loadDietPlans();
  }

  protected onViewDetails(planId: string): void {
    this.loadDietPlanDetails(planId);
  }

  private loadDietPlanDetails(planId: string): void {
    // For now, use the existing plan data since we don't have a separate details API
    const plan = this.dietPlans().find(p => p._id === planId);
    if (plan) {
      this.selectedPlanDetails.set(plan);
      this.isDetailsModalOpen.set(true);
    }
  }

  protected closeDetailsModal(): void {
    this.isDetailsModalOpen.set(false);
    this.selectedPlanDetails.set(null);
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
    this.adminMonitoringService.getDietPlanProgress(planId)
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

  protected getSelectedPlan(): DietPlanMonitoring | null {
    return this.dietPlans().find(plan => plan._id === this.selectedPlanId()) || null;
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
