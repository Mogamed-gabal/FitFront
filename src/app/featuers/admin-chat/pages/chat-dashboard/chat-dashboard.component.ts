import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { ChatAdminService } from '../../../../core/services/chat/chat-admin.service';
import { SocketService } from '../../../../core/services/chat/socket.service';
import { Chat, ChatStatistics } from '../../../../core/models/chat/chat.model';
import { Message } from '../../../../core/models/chat/message.model';
import { ChatFilters } from '../../../../core/models/chat/chat-filters.model';
import { ChatsFiltersComponent } from '../../components/chats-filters/chats-filters.component';

interface DashboardStats {
  totalChats: number;
  activeChats: number;
  closedChats: number;
  onlineUsers: number;
  averageResponseTime: number;
}

@Component({
  selector: 'app-chat-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChatsFiltersComponent
  ],
  templateUrl: './chat-dashboard.component.html',
  styleUrl: './chat-dashboard.component.scss'
})
export class ChatDashboardComponent implements OnInit {
  private readonly chatService = inject(ChatAdminService);
  private readonly socketService = inject(SocketService);

  // Signals for state management
  protected readonly chats = signal<Chat[]>([]);
  protected readonly stats = signal<DashboardStats>({
    totalChats: 0,
    activeChats: 0,
    closedChats: 0,
    onlineUsers: 0,
    averageResponseTime: 0
  });
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly socketConnected = signal(false);

  // Pagination signals
  protected readonly pagination = signal<any>({});

  // Current filters state
  private currentFilters: ChatFilters = {
    page: 1,
    limit: 10
  };

  // Computed signals
  protected readonly hasChats = computed(() => this.chats().length > 0);
  protected readonly currentPage = computed(() => this.pagination().page || 1);
  protected readonly totalPages = computed(() => this.pagination().pages || 1);
  protected readonly hasNext = computed(() => this.pagination().hasNext || false);
  protected readonly hasPrev = computed(() => this.pagination().hasPrev || false);

  ngOnInit(): void {
    this.loadInitialData();
    this.connectSocket();
  }

  private loadInitialData(): void {
    this.loadChatsAndStats();
  }

  private connectSocket(): void {
    this.socketService.connect();
    this.socketConnected.set(this.socketService.isConnected());
  }

  private loadChatsAndStats(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.chatService.getAllChats(this.currentFilters)
      .subscribe({
        next: (response: any) => {
          this.chats.set(response.data?.chats || []);
          this.pagination.set(response.data?.pagination || {});
          this.calculateStats(response.data?.chats || []);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading chats:', error);
          this.error.set('Failed to load chats. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  private calculateStats(chats: Chat[]): void {
    const totalChats = chats.length;
    const activeChats = chats.filter(chat => chat.status === 'ACTIVE').length;
    const closedChats = chats.filter(chat => chat.status === 'CLOSED').length;
    const onlineUsers = chats.reduce((sum, chat) =>
      sum + chat.participants.filter(p => p.isActive).length, 0);

    this.stats.set({
      totalChats,
      activeChats,
      closedChats,
      onlineUsers,
      averageResponseTime: 0 // Will be updated from API if available
    });
  }

  protected onFiltersChange(filters: ChatFilters): void {
    this.currentFilters = { ...this.currentFilters, ...filters, page: 1 };
    this.loadChatsAndStats();
  }

  protected onPageChange(page: number): void {
    this.currentFilters = { ...this.currentFilters, page };
    this.loadChatsAndStats();
  }

  protected onRetry(): void {
    this.loadChatsAndStats();
  }

  protected formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'SUSPENDED': return 'status-suspended';
      case 'CLOSED': return 'status-closed';
      default: return '';
    }
  }

  protected getRoleClass(role: string): string {
    switch (role) {
      case 'doctor': return 'role-doctor';
      case 'client': return 'role-client';
      case 'admin': return 'role-admin';
      case 'supervisor': return 'role-supervisor';
      default: return '';
    }
  }

  protected getParticipantNames(chat: Chat): string {
    return chat.participants.map(p => p.user.name).join(', ');
  }

  protected getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2; // Show 2 pages before and after current
    
    let start = Math.max(1, current - delta);
    let end = Math.min(total, current + delta);
    
    // Always show first page if current is far from start
    if (start > 1) {
      start = 1;
      end = Math.min(total, 5); // Show first 5 pages
    }
    
    // Show last pages if we're near the end
    if (end >= total - 1) {
      start = Math.max(1, total - 4);
      end = total;
    }
    
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
