import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Doctor } from '../../../../core/services/users/doctor.service';

@Component({
  selector: 'app-doctor-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-details-modal.component.html',
  styleUrl: './doctor-details-modal.component.scss'
})
export class DoctorDetailsModalComponent {
  @Input({ required: true }) doctor!: Doctor;
  @Input() loading: boolean = false;
  @Output() close = new EventEmitter<void>();

  protected closeModal(): void {
    this.close.emit();
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
