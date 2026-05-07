import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { Bundle, BundleStatus, DoctorInBundle, GetBundleByIdResponse, ActivateBundleResponse, DeactivateBundleResponse, DeleteBundleResponse } from '../../../../../core/models/bundle.interface';
import { BundleService } from '../../../../../core/services/bundle.service';

@Component({
  selector: 'app-bundle-details',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './bundle-details.component.html',
  styleUrl: './bundle-details.component.scss'
})
export class BundleDetailsComponent implements OnInit, OnDestroy {
  bundle = signal<Bundle | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  // Action states
  isActivating = signal<boolean>(false);
  isDeactivating = signal<boolean>(false);
  isDeleting = signal<boolean>(false);
  
  // Dialog states
  showActivateDialog = signal<boolean>(false);
  showDeactivateDialog = signal<boolean>(false);
  showDeleteDialog = signal<boolean>(false);
  
  // Public getters for template access
  get isLoadingValue() { return this.isLoading(); }
  get bundleValue() { return this.bundle(); }
  get errorValue() { return this.error(); }
  get isActivatingValue() { return this.isActivating(); }
  get isDeactivatingValue() { return this.isDeactivating(); }
  get isDeletingValue() { return this.isDeleting(); }
  get showActivateDialogValue() { return this.showActivateDialog(); }
  get showDeactivateDialogValue() { return this.showDeactivateDialog(); }
  get showDeleteDialogValue() { return this.showDeleteDialog(); }
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bundleService: BundleService
  ) {}

  ngOnInit(): void {
    this.loadBundle();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBundle(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Bundle ID not found');
      this.isLoading.set(false);
      return;
    }

    this.bundleService.getBundleById(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: GetBundleByIdResponse) => {
        this.bundle.set(response.data.bundle);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading bundle:', error);
        this.error.set('Failed to load bundle details');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/bundles']);
  }

  editBundle(): void {
    const id = this.bundleId();
    if (id) {
      this.router.navigate(['/bundles', id, 'edit']);
    }
  }

  // Dialog methods
  openActivateDialog(): void {
    this.showActivateDialog.set(true);
  }

  closeActivateDialog(): void {
    this.showActivateDialog.set(false);
  }

  openDeactivateDialog(): void {
    this.showDeactivateDialog.set(true);
  }

  closeDeactivateDialog(): void {
    this.showDeactivateDialog.set(false);
  }

  openDeleteDialog(): void {
    this.showDeleteDialog.set(true);
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
  }

  // Action methods
  activateBundle(): void {
    this.openActivateDialog();
  }

  confirmActivateBundle(): void {
    const id = this.bundleId();
    if (!id) return;

    this.isActivating.set(true);
    this.closeActivateDialog();

    this.bundleService.activateBundle(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: ActivateBundleResponse) => {
        if (response.success) {
          // Update bundle status instantly
          const currentBundle = this.bundle();
          if (currentBundle) {
            this.bundle.set({ ...currentBundle, isActive: true });
          }
          
          this.isActivating.set(false);
          this.showToast('Bundle activated successfully');
        }
      },
      error: (error) => {
        this.isActivating.set(false);
        this.showToast('Failed to activate bundle');
        console.error('Activate bundle error:', error);
      }
    });
  }

  deactivateBundle(): void {
    this.openDeactivateDialog();
  }

  confirmDeactivateBundle(): void {
    const id = this.bundleId();
    if (!id) return;

    this.isDeactivating.set(true);
    this.closeDeactivateDialog();

    this.bundleService.deactivateBundle(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: DeactivateBundleResponse) => {
        if (response.success) {
          // Update bundle status instantly
          const currentBundle = this.bundle();
          if (currentBundle) {
            this.bundle.set({ ...currentBundle, isActive: false });
          }
          
          this.isDeactivating.set(false);
          this.showToast('Bundle deactivated successfully');
        }
      },
      error: (error) => {
        this.isDeactivating.set(false);
        this.showToast('Failed to deactivate bundle');
        console.error('Deactivate bundle error:', error);
      }
    });
  }

  deleteBundle(): void {
    this.openDeleteDialog();
  }

  confirmDeleteBundle(): void {
    const id = this.bundleId();
    if (!id) return;

    this.isDeleting.set(true);
    this.closeDeleteDialog();

    this.bundleService.deleteBundle(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: DeleteBundleResponse) => {
        if (response.success) {
          this.isDeleting.set(false);
          this.showToast('Bundle deleted successfully');
          
          // Redirect to bundles list after successful deletion
          setTimeout(() => {
            this.router.navigate(['/bundles']);
          }, 1500);
        }
      },
      error: (error) => {
        this.isDeleting.set(false);
        this.showToast('Failed to delete bundle');
        console.error('Delete bundle error:', error);
      }
    });
  }

  // Toast notification helper
  private showToast(message: string): void {
    // Simple toast implementation - can be enhanced with proper toast service
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      font-weight: 500;
      font-size: 14px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  retryLoading(): void {
    this.error.set(null);
    this.isLoading.set(true);
    this.loadBundle();
  }

  // Helper getters
  bundleId = computed(() => this.bundle()?._id || '');
  bundleName = computed(() => this.bundle()?.name || '');
  bundleStatus = computed(() => this.bundle()?.isActive ? 'active' : 'inactive');
  createdDate = computed(() => {
    const bundle = this.bundle();
    return bundle?.createdAt ? new Date(bundle.createdAt) : null;
  });
  updatedDate = computed(() => {
    const bundle = this.bundle();
    return bundle?.updatedAt ? new Date(bundle.updatedAt) : null;
  });
  createdBy = computed(() => this.bundle()?.createdBy?.name || '');
  doctors = computed(() => {
    const bundle = this.bundle();
    return bundle?.doctors?.map(d => d.doctorId).filter(d => d !== null) || [];
  });
  pricing = computed(() => this.bundle()?.pricing || { oneMonth: 0, threeMonths: 0, sixMonths: 0 });
}
