import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';

interface BlockedUser {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'doctor' | 'supervisor';
  isBlocked: boolean;
  blockedAt: string;
  blockedBy: string;
  blockReason: string;
}

@Component({
  selector: 'app-blocked-model',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blocked-model.component.html',
  styleUrl: './blocked-model.component.scss'
})
export class BlockedModelComponent {
  @Input() user: BlockedUser | null = null;
  @Output() closeModal = new EventEmitter<void>();

  protected formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected onCloseModal(): void {
    this.closeModal.emit();
  }
}
