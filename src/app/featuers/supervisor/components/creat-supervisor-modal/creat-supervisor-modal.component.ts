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
      console.log('Form is valid, submitting data:', this.supervisorForm.value);
      
      const formData = {
        name: this.supervisorForm.get('name')?.value,
        email: this.supervisorForm.get('email')?.value,
        password: this.supervisorForm.get('password')?.value,
        phone: this.supervisorForm.get('phone')?.value,
        address: this.supervisorForm.get('address')?.value
      };
      
      console.log('Prepared form data for API:', formData);
      this.create.emit(formData);
    } else {
      console.log('Form is invalid:', this.supervisorForm.errors);
      
      // Mark all fields as touched to show validation errors
      Object.keys(this.supervisorForm.controls).forEach(key => {
        this.supervisorForm.get(key)?.markAsTouched();
      });
    }
  }

  onClose(): void {
    console.log('Modal close requested');
    this.resetForm();
    this.close.emit();
  }

  resetForm(): void {
    console.log('Resetting form');
    this.supervisorForm.reset();
  }
}

