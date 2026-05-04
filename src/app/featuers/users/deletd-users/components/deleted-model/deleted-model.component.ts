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
  protected reasonTouched = false;
  protected loading = false;

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
    this.reasonTouched = true;
    
    if (!this.reason.trim()) {
      return; // Don't proceed if reason is empty
    }
    
    this.loading = true;
    this.confirm.emit(this.reason.trim());
  }

  protected onCancel(): void {
    this.cancel.emit();
    this.reason = '';
    this.reasonTouched = false;
    this.loading = false;
  }

  // Method to reset loading state (called by parent component)
  setLoading(loading: boolean): void {
    this.loading = loading;
  }

  protected onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
