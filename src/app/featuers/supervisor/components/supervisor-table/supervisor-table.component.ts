import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Supervisor } from '../../../../core/services/supervisor.service';

@Component({
  selector: 'app-supervisor-table',
  imports: [CommonModule],
  templateUrl: './supervisor-table.component.html',
  styleUrl: './supervisor-table.component.scss'
})
export class SupervisorTableComponent {
  @Input() supervisors: Supervisor[] | null = null;
  @Input() isLoading = false;
  @Output() view = new EventEmitter<Supervisor>();
  @Output() delete = new EventEmitter<Supervisor>();

  onViewSupervisor(supervisor: Supervisor): void {
    this.view.emit(supervisor);
  }

  onDeleteSupervisor(supervisor: Supervisor): void {
    this.delete.emit(supervisor);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  trackBySupervisorId(index: number, supervisor: Supervisor): string {
    return supervisor._id;
  }
}
