import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

import { Bundle, BundleStatus, DoctorInBundle, GetBundleByIdResponse, ActivateBundleResponse, DeactivateBundleResponse, DeleteBundleResponse } from '../../../../../core/models/bundle.interface';
import { BundleService } from '../../../../../core/services/bundle.service';
import { UpdateBundleModalComponent } from '../../components/update-bundle-modal/update-bundle-modal.component';

@Component({
  selector: 'app-bundle-details',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, UpdateBundleModalComponent],
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
  showUpdateDialog = signal<boolean>(false);
  
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
  get showUpdateDialogValue() { return this.showUpdateDialog(); }
  
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
    this.openUpdateDialog();
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

  // Update dialog methods
  openUpdateDialog(): void {
    this.showUpdateDialog.set(true);
  }

  closeUpdateDialog(): void {
    this.showUpdateDialog.set(false);
  }

  onBundleUpdateSuccess(updatedBundle: Bundle): void {
    // Update the bundle signal with the updated data
    this.bundle.set(updatedBundle);
    this.closeUpdateDialog();
    this.showToast('Bundle updated successfully');
  }

  // Action methods
  activateBundle(): void {
    const bundle = this.bundle();
    if (!bundle) return;

    Swal.fire({
      title: 'Activate Bundle',
      html: `
        <div style="text-align: left; padding: 10px;">
          <div class="warning-message" style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: #d1fae5; border-radius: 8px; border-left: 4px solid #10b981;">
            <i class="fa-solid fa-play" style="font-size: 1.25rem; margin-top: 0.125rem; flex-shrink: 0; color: #10b981;"></i>
            <p style="margin: 0; color: #065f46; font-size: 0.875rem; line-height: 1.5;">Are you sure you want to activate this bundle? This will make it available for purchase.</p>
          </div>
          
          <div class="bundle-details" style="background: #f9fafb; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
            <div class="bundle-info">
              <div class="bundle-name" style="font-size: 1rem; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem;">${bundle.name}</div>
              <div class="bundle-status" style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Current Status: Inactive</div>
              <div class="bundle-price" style="font-size: 0.875rem; color: #374151; font-weight: 500;">Price: From $${bundle.pricing.oneMonth}/month</div>
            </div>
          </div>

          <div class="reason-section">
            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Reason for activation *</label>
            <textarea id="activate-reason" placeholder="Enter reason for activating this bundle..." rows="3" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; font-family: inherit; resize: vertical;"></textarea>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Activate Bundle',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      preConfirm: () => {
        const reason = (document.getElementById('activate-reason') as HTMLTextAreaElement)?.value;
        if (!reason || reason.trim() === '') {
          Swal.showValidationMessage('Please enter a reason for activation');
          return false;
        }
        return reason.trim();
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.confirmActivateBundleWithReason(result.value);
      }
    });
  }

  confirmActivateBundleWithReason(reason: string): void {
    const id = this.bundleId();
    if (!id) return;

    // Show loading toast
    Swal.fire({
      title: 'Activating Bundle...',
      text: 'Please wait while activating the bundle',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.isActivating.set(true);

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
          Swal.close();
          Swal.fire('Activated!', 'Bundle has been activated successfully.', 'success');
        }
      },
      error: (error) => {
        this.isActivating.set(false);
        Swal.close();
        Swal.fire('Activation Failed', 'Failed to activate bundle. Please try again.', 'error');
        console.error('Activate bundle error:', error);
      }
    });
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
    const bundle = this.bundle();
    if (!bundle) return;

    Swal.fire({
      title: 'Deactivate Bundle',
      html: `
        <div style="text-align: left; padding: 10px;">
          <div class="warning-message" style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <i class="fa-solid fa-pause" style="font-size: 1.25rem; margin-top: 0.125rem; flex-shrink: 0; color: #f59e0b;"></i>
            <p style="margin: 0; color: #92400e; font-size: 0.875rem; line-height: 1.5;">Are you sure you want to deactivate this bundle? This will make it unavailable for purchase.</p>
          </div>
          
          <div class="bundle-details" style="background: #f9fafb; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
            <div class="bundle-info">
              <div class="bundle-name" style="font-size: 1rem; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem;">${bundle.name}</div>
              <div class="bundle-status" style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Current Status: Active</div>
              <div class="bundle-price" style="font-size: 0.875rem; color: #374151; font-weight: 500;">Price: From $${bundle.pricing.oneMonth}/month</div>
            </div>
          </div>

          <div class="reason-section">
            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Reason for deactivation *</label>
            <textarea id="deactivate-reason" placeholder="Enter reason for deactivating this bundle..." rows="3" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; font-family: inherit; resize: vertical;"></textarea>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Deactivate Bundle',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      preConfirm: () => {
        const reason = (document.getElementById('deactivate-reason') as HTMLTextAreaElement)?.value;
        if (!reason || reason.trim() === '') {
          Swal.showValidationMessage('Please enter a reason for deactivation');
          return false;
        }
        return reason.trim();
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.confirmDeactivateBundleWithReason(result.value);
      }
    });
  }

  confirmDeactivateBundleWithReason(reason: string): void {
    const id = this.bundleId();
    if (!id) return;

    // Show loading toast
    Swal.fire({
      title: 'Deactivating Bundle...',
      text: 'Please wait while deactivating the bundle',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.isDeactivating.set(true);

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
          Swal.close();
          Swal.fire('Deactivated!', 'Bundle has been deactivated successfully.', 'success');
        }
      },
      error: (error) => {
        this.isDeactivating.set(false);
        Swal.close();
        Swal.fire('Deactivation Failed', 'Failed to deactivate bundle. Please try again.', 'error');
        console.error('Deactivate bundle error:', error);
      }
    });
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
    const bundle = this.bundle();
    if (!bundle) return;

    Swal.fire({
      title: 'Delete Bundle',
      html: `
        <div style="text-align: left; padding: 10px;">
          <div class="warning-message" style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: #fee2e2; border-radius: 8px; border-left: 4px solid #ef4444;">
            <i class="fa-solid fa-exclamation-triangle" style="font-size: 1.25rem; margin-top: 0.125rem; flex-shrink: 0; color: #ef4444;"></i>
            <p style="margin: 0; color: #991b1b; font-size: 0.875rem; line-height: 1.5;">Are you sure you want to delete this bundle? This action cannot be undone and will permanently remove the bundle.</p>
          </div>
          
          <div class="bundle-details" style="background: #f9fafb; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
            <div class="bundle-info">
              <div class="bundle-name" style="font-size: 1rem; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem;">${bundle.name}</div>
              <div class="bundle-status" style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Status: ${bundle.isActive ? 'Active' : 'Inactive'}</div>
              <div class="bundle-price" style="font-size: 0.875rem; color: #374151; font-weight: 500;">Price: From $${bundle.pricing.oneMonth}/month</div>
              <div class="bundle-doctors" style="font-size: 0.875rem; color: #374151; font-weight: 500;">Doctors: ${bundle.doctors.length} assigned</div>
            </div>
          </div>

          <div class="reason-section">
            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Reason for deletion *</label>
            <textarea id="delete-reason" placeholder="Enter reason for deleting this bundle..." rows="3" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; font-family: inherit; resize: vertical;"></textarea>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Delete Bundle',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      preConfirm: () => {
        const reason = (document.getElementById('delete-reason') as HTMLTextAreaElement)?.value;
        if (!reason || reason.trim() === '') {
          Swal.showValidationMessage('Please enter a reason for deletion');
          return false;
        }
        return reason.trim();
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.confirmDeleteBundleWithReason(result.value);
      }
    });
  }

  confirmDeleteBundleWithReason(reason: string): void {
    const id = this.bundleId();
    if (!id) return;

    // Show loading toast
    Swal.fire({
      title: 'Deleting Bundle...',
      text: 'Please wait while deleting the bundle',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.isDeleting.set(true);

    this.bundleService.deleteBundle(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: DeleteBundleResponse) => {
        if (response.success) {
          this.isDeleting.set(false);
          Swal.close();
          Swal.fire('Deleted!', 'Bundle has been deleted successfully.', 'success');
          
          // Redirect to bundles list after successful deletion
          setTimeout(() => {
            this.router.navigate(['/bundles']);
          }, 1500);
        }
      },
      error: (error) => {
        this.isDeleting.set(false);
        Swal.close();
        Swal.fire('Deletion Failed', 'Failed to delete bundle. Please try again.', 'error');
        console.error('Delete bundle error:', error);
      }
    });
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
