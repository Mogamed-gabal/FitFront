import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeletedUser } from '../../../../../core/models/user/deleted-user.model';

@Component({
  selector: 'app-deleted-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deleted-table.component.html',
  styleUrl: './deleted-table.component.scss'
})
export class DeletedTableComponent {
  @Input({ required: true }) users: DeletedUser[] = [];
  @Input() pagination: any = {};
  @Output() restore = new EventEmitter<DeletedUser>();
  @Output() delete = new EventEmitter<DeletedUser>();
  @Output() pageChange = new EventEmitter<number>();

  protected getRoleClass(role: string): string {
    return `role-${(role || '').toLowerCase()}`;
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected onRestore(user: DeletedUser): void {
    this.restore.emit(user);
  }

  protected onDelete(user: DeletedUser): void {
    this.delete.emit(user);
  }

  protected onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  protected getRoleIcon(role: string): string {
    switch (role) {
      case 'client': return 'fa-user';
      case 'doctor': return 'fa-user-md';
      case 'supervisor': return 'fa-user-shield';
      case 'admin': return 'fa-user-cog';
      default: return 'fa-user';
    }
  }
}
