import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface DoctorTableRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  status: 'approved' | 'pending' | 'rejected';
  isBlocked: boolean;
}

@Component({
  selector: 'app-doctor-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-table.component.html',
  styleUrls: ['./doctor-table.component.scss']
})
export class DoctorTableComponent {
  @Input({ required: true }) doctors: DoctorTableRow[] = [];
  @Output() viewDoctor = new EventEmitter<DoctorTableRow>();
  @Output() blockDoctor = new EventEmitter<DoctorTableRow>();
  @Output() unblockDoctor = new EventEmitter<DoctorTableRow>();
  @Output() deleteDoctor = new EventEmitter<DoctorTableRow>();

  protected onView(doctor: DoctorTableRow): void {
    this.viewDoctor.emit(doctor);
  }

  protected onBlock(doctor: DoctorTableRow): void {
    this.blockDoctor.emit(doctor);
  }

  protected onUnblock(doctor: DoctorTableRow): void {
    this.unblockDoctor.emit(doctor);
  }

  protected onDelete(doctor: DoctorTableRow): void {
    this.deleteDoctor.emit(doctor);
  }
}
