import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import Swal from 'sweetalert2';

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

  protected copyToClipboard(text: string): void {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Copied!',
          text: 'Email copied to clipboard',
          timer: 2000,
          showConfirmButton: false,
          toast: true
        });
      }).catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Copy Failed',
          text: 'Failed to copy email to clipboard',
          timer: 2000,
          showConfirmButton: false,
          toast: true
        });
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Email copied to clipboard',
        timer: 2000,
        showConfirmButton: false,
        toast: true
      });
    }
  }

  protected onUnblockUser(): void {
    if (!this.user) return;
    
    Swal.fire({
      title: 'Unblock User',
      text: `Are you sure you want to unblock ${this.user.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Unblock',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Emit unblock event to parent component
        this.closeModal.emit();
      }
    });
  }

  protected onCloseModal(): void {
    this.closeModal.emit();
  }
}
