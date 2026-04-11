import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Client } from '../../../../../core/models/user/client';

@Component({
  selector: 'app-client-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-details-modal.component.html',
  styleUrl: './client-details-modal.component.scss',
})
export class ClientDetailsModalComponent {
  @Input({ required: true }) client!: Client;
  @Input() loading: boolean = false;
  @Output() close = new EventEmitter<void>();

  protected closeModal(): void {
    this.close.emit();
  }

  protected formatDate(dateString: string | any): string {
    if (!dateString) return 'N/A';
    
    // Handle MongoDB date objects
    if (dateString && typeof dateString === 'object' && dateString.$date) {
      dateString = dateString.$date;
    }
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected formatGoal(goal: string): string {
    if (!goal) return 'N/A';
    return goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  protected formatStatus(status: string): string {
    switch (status) {
      case 'approved':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Inactive';
      default:
        return status || 'N/A';
    }
  }
}
