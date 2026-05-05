import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-creat-supervisor-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './creat-supervisor-modal.component.html',
  styleUrls: ['./creat-supervisor-modal.component.scss']
})
export class CreatSupervisorModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();

  supervisorForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private fb: FormBuilder) {
    this.supervisorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.supervisorForm.valid) {
      this.isLoading = true;
      this.clearMessages();
      
      const formData = {
        name: this.supervisorForm.get('name')?.value,
        email: this.supervisorForm.get('email')?.value,
        password: this.supervisorForm.get('password')?.value,
        phone: this.supervisorForm.get('phone')?.value,
        address: this.supervisorForm.get('address')?.value
      };
      
      // Emit the create event and wait for parent response
      this.create.emit(formData);
      
      // The parent component should handle the API call and call the appropriate method
      // For now, we'll simulate the response handling
      setTimeout(() => {
        // This will be replaced by actual response handling from parent
        // The parent component will call either onCreateSuccess() or onCreateError()
        this.isLoading = false;
      }, 1500);
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
      
      // Mark all fields as touched to show validation errors
      Object.keys(this.supervisorForm.controls).forEach(key => {
        this.supervisorForm.get(key)?.markAsTouched();
      });
    }
  }

  // Method to be called by parent component on successful creation
  onCreateSuccess(): void {
    this.isLoading = false;
    this.successMessage = 'Supervisor created successfully!';
    setTimeout(() => {
      this.onClose();
    }, 2000);
  }

  // Method to be called by parent component on creation failure
  onCreateError(error: string = 'Failed to create supervisor. Please try again.'): void {
    this.isLoading = false;
    this.errorMessage = error;
  }

  onClose(): void {
    this.resetForm();
    this.clearMessages();
    this.close.emit();
  }

  resetForm(): void {
    this.supervisorForm.reset();
    this.isLoading = false;
  }

  clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  clearError(): void {
    this.errorMessage = null;
  }

  clearSuccess(): void {
    this.successMessage = null;
  }
}

