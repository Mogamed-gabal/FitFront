import { Component, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ChatAdminService } from '../../../../core/services/chat/chat-admin.service';
import { Message } from '../../../../core/models/chat/message.model';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages-list.component.html',
  styleUrl: './messages-list.component.scss'
})
export class MessagesListComponent implements OnInit {
  private readonly chatService = inject(ChatAdminService);
  private readonly sanitizer = inject(DomSanitizer);

  @Input() chatId: string = '';

  protected readonly messages = signal<Message[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    if (this.chatId) {
      this.loadMessages();
    }
  }

  private loadMessages(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.chatService.getMessages(this.chatId)
      .subscribe({
        next: (response: any) => {
          this.messages.set(response.data?.messages || []);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading messages:', error);
          this.error.set('Failed to load messages. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  protected formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected getSenderClass(role: string): string {
    switch (role) {
      case 'doctor': return 'sender-doctor';
      case 'client': return 'sender-client';
      case 'admin': return 'sender-admin';
      default: return '';
    }
  }

  protected isOwnMessage(message: Message): boolean {
    // Check if the message is from the current user (admin)
    return message.senderId.role === 'admin';
  }

  protected getSafeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  protected onRetry(): void {
    this.loadMessages();
  }
}
