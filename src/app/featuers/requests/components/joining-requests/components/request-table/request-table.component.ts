import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Doctor } from '../../../../../../core/services/users/doctor.service';

@Component({
  selector: 'app-request-table',
  imports: [CommonModule],
  templateUrl: './request-table.component.html',
  styleUrl: './request-table.component.scss'
})
export class RequestTableComponent {
  @Input() doctors: Doctor[] = [];
  @Input() isLoading = false;
  @Output() view = new EventEmitter<Doctor>();
  @Output() approve = new EventEmitter<Doctor>();
  @Output() reject = new EventEmitter<Doctor>();

  onViewDoctor(doctor: Doctor): void {
    this.view.emit(doctor);
  }

  onApproveDoctor(doctor: Doctor): void {
    this.approve.emit(doctor);
  }

  onRejectDoctor(doctor: Doctor): void {
    this.reject.emit(doctor);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  trackByDoctorId(index: number, doctor: Doctor): string {
    return doctor._id;
  }
}
