import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeletedUser } from '../../../../../core/models/user/deleted-user.model';

@Component({
  selector: 'app-deleted-model',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deleted-model.component.html',
  styleUrl: './deleted-model.component.scss'
})
export class DeletedModelComponent {
  @Input() isVisible = false;
  @Input() type: 'restore' | 'delete' = 'restore';
  @Input() user: DeletedUser | null = null;
  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  protected reason = '';

  protected get modalTitle(): string {
    return this.type === 'restore' ? 'Restore User' : 'Delete Permanently';
  }

  protected get modalMessage(): string {
    if (!this.user) return '';
    
    const action = this.type === 'restore' ? 'restore' : 'permanently delete';
    return `Are you sure you want to ${action} ${this.user.name}?`;
  }

  protected get confirmButtonText(): string {
    return this.type === 'restore' ? 'Restore' : 'Delete';
  }

  protected get confirmButtonClass(): string {
    return this.type === 'restore' ? 'btn-restore' : 'btn-delete';
  }

  protected onConfirm(): void {
    this.confirm.emit(this.reason);
  }

  protected onCancel(): void {
    this.cancel.emit();
    this.reason = '';
  }

  protected onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
