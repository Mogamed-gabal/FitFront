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
  selector: 'app-blocked-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blocked-table.component.html',
  styleUrl: './blocked-table.component.scss'
})
export class BlockedTableComponent {
  @Input() users: BlockedUser[] = [];
  @Input() loading: boolean = false;
  @Output() viewUser = new EventEmitter<string>();
  @Output() unblockUser = new EventEmitter<string>();

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

  protected onViewUser(userId: string): void {
    this.viewUser.emit(userId);
  }

  protected onUnblockUser(userId: string): void {
    this.unblockUser.emit(userId);
  }
}
