import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Doctor } from '../../../../../../core/services/users/doctor.service';

@Component({
  selector: 'app-request-model',
  imports: [CommonModule],
  templateUrl: './request-model.component.html',
  styleUrl: './request-model.component.scss'
})
export class RequestModelComponent {
  @Input() doctor: Doctor | null = null;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() approve = new EventEmitter<Doctor>();
  @Output() reject = new EventEmitter<Doctor>();

  onClose(): void {
    this.close.emit();
  }

  onApprove(): void {
    if (this.doctor) {
      this.approve.emit(this.doctor);
    }
  }

  onReject(): void {
    if (this.doctor) {
      this.reject.emit(this.doctor);
    }
  }

  getStatusClass(): string {
    if (!this.doctor) return '';
    return this.doctor.status.toLowerCase();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
