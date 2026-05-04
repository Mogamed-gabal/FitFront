import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../config/environment';
import { Message } from '../../models/chat/message.model';

export interface SocketEvents {
  new_message: { chatId: string; message: Message };
  typing_start: { chatId: string; userId: string; userName: string };
  typing_stop: { chatId: string; userId: string; userName: string };
  user_online: { userId: string; userName: string };
  user_offline: { userId: string; userName: string };
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private readonly baseUrl = environment.apiBaseUrl;

  // BehaviorSubjects for real-time updates
  private newMessageSubject = new BehaviorSubject<{ chatId: string; message: Message } | null>(null);
  private typingStartSubject = new BehaviorSubject<{ chatId: string; userId: string; userName: string } | null>(null);
  private typingStopSubject = new BehaviorSubject<{ chatId: string; userId: string; userName: string } | null>(null);
  private userOnlineSubject = new BehaviorSubject<{ userId: string; userName: string } | null>(null);
  private userOfflineSubject = new BehaviorSubject<{ userId: string; userName: string } | null>(null);

  // Observable streams
  readonly newMessage$ = this.newMessageSubject.asObservable();
  readonly typingStart$ = this.typingStartSubject.asObservable();
  readonly typingStop$ = this.typingStopSubject.asObservable();
  readonly userOnline$ = this.userOnlineSubject.asObservable();
  readonly userOffline$ = this.userOfflineSubject.asObservable();

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.baseUrl, {
      auth: {
        token: this.getAuthToken()
      }
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_room', { chatId });
    }
  }

  leaveRoom(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', { chatId });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Listen to new messages
    this.socket.on('new_message', (data: { chatId: string; message: Message }) => {
      this.newMessageSubject.next(data);
    });

    // Listen to typing indicators
    this.socket.on('typing_start', (data: { chatId: string; userId: string; userName: string }) => {
      this.typingStartSubject.next(data);
    });

    this.socket.on('typing_stop', (data: { chatId: string; userId: string; userName: string }) => {
      this.typingStopSubject.next(data);
    });

    // Listen to user status changes
    this.socket.on('user_online', (data: { userId: string; userName: string }) => {
      this.userOnlineSubject.next(data);
    });

    this.socket.on('user_offline', (data: { userId: string; userName: string }) => {
      this.userOfflineSubject.next(data);
    });

    // Handle connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
    });
  }

  private getAuthToken(): string {
    // Get auth token from localStorage or auth service
    return localStorage.getItem('auth.accessToken') || '';
  }
}
