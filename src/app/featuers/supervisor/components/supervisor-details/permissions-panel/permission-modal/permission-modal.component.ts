import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AvailablePermission } from '../../../../../../core/services/supervisor.service';

@Component({
  selector: 'app-permission-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './permission-modal.component.html',
  styleUrl: './permission-modal.component.scss'
})
export class PermissionModalComponent {
  @Input() permission: AvailablePermission | null = null;
  @Input() isLoading: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() grant = new EventEmitter<{reason: string, expiresAt: string | null}>();

  grantForm: FormGroup;
  minDate: string;

  constructor(private fb: FormBuilder) {
    this.minDate = new Date().toISOString().slice(0, 16);
    this.grantForm = this.fb.group({
      reason: ['', [/* Validators.required */]],
      expiresAt: [null]
    });
  }

  ngOnInit(): void {
    if (this.permission) {
      // Set default values if needed
    }
  }

  onSubmit(): void {
    if (this.grantForm.valid) {
      const { reason, expiresAt } = this.grantForm.value;
      this.grant.emit({ reason, expiresAt });
    }
  }

  onClose(): void {
    this.close.emit();
  }

  clearExpiration(): void {
    this.grantForm.patchValue({ expiresAt: null });
  }
}
