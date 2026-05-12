import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminPassService } from '../../../core/services/admin/admin-setting/admin-pass.service';

@Component({
  selector: 'app-admin-setting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-setting.component.html',
  styleUrl: './admin-setting.component.scss'
})
export class AdminSettingComponent implements OnInit {
  
  // Form
  public changePasswordForm!: FormGroup;
  
  // UI State
  public isLoading: boolean = false;
  public isSuccess: boolean = false;
  public errorMessage: string = '';
  public validationErrors: string[] = [];
  
  // Password Visibility
  public showCurrentPassword: boolean = false;
  public showNewPassword: boolean = false;
  public showConfirmPassword: boolean = false;
  
  // View References
  @ViewChild('currentPasswordInput') public currentPasswordInput!: ElementRef;
  
  constructor(
    private fb: FormBuilder,
    private adminPassService: AdminPassService,
    private router: Router
  ) {
    // Initialize form
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  
  ngOnInit(): void {
    // Auto focus first input
    setTimeout(() => {
      this.currentPasswordInput?.nativeElement.focus();
    }, 100);
  }
  
  // Custom validator for password matching
  public passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    
    return null;
  }
  
  // Handle form submission
  public onSubmit(): void {
    // Prevent multiple submissions
    if (this.isLoading) return;
    
    // Clear previous errors
    this.errorMessage = '';
    this.validationErrors = [];
    
    // Validate form
    if (this.changePasswordForm.invalid) {
      this.markFormGroupTouched(this.changePasswordForm);
      this.displayValidationErrors();
      return;
    }
    
    // Prepare request body
    const body = {
      currentPassword: this.changePasswordForm.value.currentPassword,
      newPassword: this.changePasswordForm.value.newPassword,
      confirmPassword: this.changePasswordForm.value.confirmPassword
    };
    
    // Set loading state
    this.isLoading = true;
    
    // Call API
    this.adminPassService.changeOwnPassword(body).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.success) {
          // Success flow
          this.isSuccess = true;
          this.changePasswordForm.reset();
          
          // Logout after 1-2 seconds
          setTimeout(() => {
            this.logout();
          }, 1500);
        } else {
          // Error from backend
          this.errorMessage = response.message || 'Failed to change password';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Something went wrong';
      }
    });
  }
  
  // Display validation errors
  public displayValidationErrors(): void {
    this.validationErrors = [];
    
    const currentPassword = this.changePasswordForm.get('currentPassword');
    const newPassword = this.changePasswordForm.get('newPassword');
    const confirmPassword = this.changePasswordForm.get('confirmPassword');
    
    if (currentPassword?.errors?.['required']) {
      this.validationErrors.push('Current password is required');
    }
    
    if (newPassword?.errors?.['required']) {
      this.validationErrors.push('New password is required');
    }
    
    if (newPassword?.errors?.['minlength']) {
      this.validationErrors.push('New password must be at least 8 characters');
    }
    
    if (confirmPassword?.errors?.['required']) {
      this.validationErrors.push('Password confirmation is required');
    }
    
    if (this.changePasswordForm.errors?.['passwordMismatch']) {
      this.validationErrors.push('Passwords do not match');
    }
  }
  
  // Mark all form controls as touched
  public markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
  
  // Toggle password visibility
  public togglePasswordVisibility(field: string): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }
  
  // Logout user
  public logout(): void {
    // Clear token from localStorage
    localStorage.removeItem('auth.accessToken');
    localStorage.removeItem('auth.refreshToken');
    
    // Redirect to login page
    this.router.navigateByUrl('/login');
  }
}
