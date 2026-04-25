import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config/environment';
import { 
  AuditLog, 
  GetAuditLogsResponse, 
  ActionType, 
  TargetType, 
  ActivitySummary 
} from '../models/audit/audit-log.model';
import { AuditFilters, ActivitySummaryFilters } from '../models/audit/audit-filters.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getLogs(filters: AuditFilters): Observable<GetAuditLogsResponse> {
    // Build query params dynamically, only including non-null values
    let params = new HttpParams();
    
    if (filters.page !== undefined && filters.page !== null) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.limit !== undefined && filters.limit !== null) {
      params = params.set('limit', filters.limit.toString());
    }
    if (filters.userId) {
      params = params.set('userId', filters.userId);
    }
    if (filters.action) {
      params = params.set('action', filters.action);
    }
    if (filters.target) {
      params = params.set('target', filters.target);
    }
    if (filters.module) {
      params = params.set('module', filters.module);
    }
    if (filters.outcome) {
      params = params.set('outcome', filters.outcome);
    }
    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<GetAuditLogsResponse>(`${this.baseUrl}/api/audit/logs`, { params });
  }

  getActionTypes(): Observable<ActionType[]> {
    return this.http.get<ActionType[]>(`${this.baseUrl}/api/audit/action-types`);
  }

  getTargetTypes(): Observable<TargetType[]> {
    return this.http.get<TargetType[]>(`${this.baseUrl}/api/audit/target-types`);
  }

  getActivitySummary(filters: ActivitySummaryFilters): Observable<ActivitySummary> {
    let params = new HttpParams();
    
    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }
    if (filters.userId) {
      params = params.set('userId', filters.userId);
    }

    return this.http.get<ActivitySummary>(`${this.baseUrl}/api/audit/activity-summary`, { params });
  }
}
