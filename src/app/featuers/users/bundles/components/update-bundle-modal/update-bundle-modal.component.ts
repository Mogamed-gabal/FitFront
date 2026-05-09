import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { Bundle, BundlePricing, UpdateBundleRequest, DoctorInBundle } from '../../../../../core/models/bundle.interface';
import { BundleService } from '../../../../../core/services/bundle.service';

@Component({
  selector: 'app-update-bundle-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-bundle-modal.component.html',
  styleUrl: './update-bundle-modal.component.scss'
})
export class UpdateBundleModalComponent implements OnInit, OnDestroy {
  @Input() bundle: Bundle | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() updateSuccess = new EventEmitter<Bundle>();

  updateForm!: FormGroup;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private bundleService: BundleService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.bundle) {
      this.prefillForm();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.updateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      pricing: this.fb.group({
        oneMonth: [0, [Validators.required, Validators.min(0)]],
        threeMonths: [0, [Validators.required, Validators.min(0)]],
        sixMonths: [0, [Validators.required, Validators.min(0)]]
      })
    });
  }

  private prefillForm(): void {
    if (!this.bundle) return;

    this.updateForm.patchValue({
      name: this.bundle.name,
      pricing: {
        oneMonth: this.bundle.pricing.oneMonth,
        threeMonths: this.bundle.pricing.threeMonths,
        sixMonths: this.bundle.pricing.sixMonths
      }
    });
  }

  onSubmit(): void {
    if (this.updateForm.invalid || !this.bundle) {
      this.markFormAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.updateForm.value;
    
    const updateData: UpdateBundleRequest = {
      name: formData.name,
      pricing: formData.pricing
    };

    this.bundleService.updateBundle(this.bundle._id, updateData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.isLoading = false;
          this.updateSuccess.emit(response.data.bundle);
          this.closeModal();
          this.showSuccessToast('Bundle updated successfully');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showErrorToast('Failed to update bundle');
        console.error('Update bundle error:', error);
      }
    });
  }

  onCancel(): void {
    this.closeModal();
  }

  closeModal(): void {
    this.close.emit();
  }

  private markFormAsTouched(): void {
    Object.keys(this.updateForm.controls).forEach(key => {
      this.updateForm.get(key)?.markAsTouched();
    });
  }

  private showSuccessToast(message: string): void {
    this.showToast(message, 'success');
  }

  private showErrorToast(message: string): void {
    this.showToast(message, 'error');
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
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
    
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // Getters for template
  get f() { return this.updateForm.controls; }
  get pricing() { return (this.updateForm.get('pricing') as FormGroup).controls; }
}
