import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../config/environment';
import { 
  Chat, 
  GetAllChatsResponse, 
  ChatStatistics 
} from '../../models/chat/chat.model';
import { 
  Message, 
  GetMessagesResponse 
} from '../../models/chat/message.model';
import { 
  ChatFilters, 
  GetMessagesParams 
} from '../../models/chat/chat-filters.model';

@Injectable({
  providedIn: 'root'
})
export class ChatAdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getAllChats(filters: ChatFilters = {}): Observable<GetAllChatsResponse> {
    let params = this.buildHttpParams(filters);
    
    return this.http.get<GetAllChatsResponse>(`${this.baseUrl}/api/chat/admin/all-chats`, { params });
  }

  getMessages(chatId: string, params: GetMessagesParams = {}): Observable<GetMessagesResponse> {
    let httpParams = this.buildHttpParams(params);
    
    return this.http.get<GetMessagesResponse>(`${this.baseUrl}/api/chat/admin/${chatId}/messages`, { params: httpParams });
  }

  getChatStatistics(chatId: string): Observable<ChatStatistics> {
    return this.http.get<ChatStatistics>(`${this.baseUrl}/api/chat/admin/${chatId}/statistics`);
  }

  private buildHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    
    // Only add non-null, non-undefined values
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    
    return httpParams;
  }
}
