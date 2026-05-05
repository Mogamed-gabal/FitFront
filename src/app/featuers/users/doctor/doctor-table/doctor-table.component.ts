import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DoctorTableRow } from '../doctor.types';

@Component({
  selector: 'app-doctor-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-table.component.html',
  styleUrls: ['./doctor-table.component.scss']
})
export class DoctorTableComponent {
  @Input({ required: true }) doctors: DoctorTableRow[] = [];
  @Input() bundleMode = false;
  @Input() selectedDoctors: string[] = [];
  @Output() viewDoctor = new EventEmitter<DoctorTableRow>();
  @Output() blockDoctor = new EventEmitter<DoctorTableRow>();
  @Output() unblockDoctor = new EventEmitter<DoctorTableRow>();
  @Output() deleteDoctor = new EventEmitter<DoctorTableRow>();
  @Output() recommendDoctor = new EventEmitter<DoctorTableRow>();
  @Output() unrecommendDoctor = new EventEmitter<DoctorTableRow>();
  @Output() doctorSelect = new EventEmitter<string>();

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

  protected onRecommend(doctor: DoctorTableRow): void {
    this.recommendDoctor.emit(doctor);
  }

  protected onUnrecommend(doctor: DoctorTableRow): void {
    this.unrecommendDoctor.emit(doctor);
  }

  protected onDoctorSelect(doctorId: string): void {
    this.doctorSelect.emit(doctorId);
  }

  protected isDoctorSelected(doctorId: string): boolean {
    return this.selectedDoctors.includes(doctorId);
  }

  protected isDoctorDisabled(doctorId: string): boolean {
    const selected = this.selectedDoctors;
    return selected.length === 2 && !selected.includes(doctorId);
  }
}
