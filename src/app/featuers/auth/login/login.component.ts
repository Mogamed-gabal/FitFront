import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isSubmitting = false;
  errorMessage = '';
  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    const payload = this.form.getRawValue();

    this.authService
      .login(payload)
      .pipe(
        switchMap((tokens) => {
          this.authService.saveToken(tokens);
          return this.authService.getMe();
        }),
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: (user) => {
          if (!this.authService.isAllowedRole(user)) {
            this.authService.logout();
            this.errorMessage = 'Access denied. Admin or supervisor account required.';
            return;
          }

          this.router.navigateByUrl('/dashboard');
        },
        error: (error: unknown) => {
          this.authService.logout();
          this.errorMessage =
            error instanceof Error
              ? error.message
              : 'Unable to sign in right now. Please try again.';
        },
      });
  }
}
