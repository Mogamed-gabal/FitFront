import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Supervisor } from '../../../../core/services/supervisor.service';

@Component({
  selector: 'app-supervisor-modal',
  imports: [CommonModule],
  templateUrl: './supervisor-modal.component.html',
  styleUrl: './supervisor-modal.component.scss'
})
export class SupervisorModalComponent {
  @Input() supervisor: Supervisor | null = null;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
