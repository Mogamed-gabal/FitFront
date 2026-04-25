import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config/environment';

export interface Subscription {
  _id: string;
  userId: string;
  planName: string;
  planType: 'BASIC' | 'PREMIUM' | 'PROFESSIONAL';
  status: 'ACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED';
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  billingInfo: {
    address: string;
    city: string;
    country: string;
    zipCode: string;
  };
  paymentInfo: {
    lastFourDigits: string;
    cardType: string;
    expiryDate: string;
  };
  features: string[];
  limits: {
    [key: string]: string | number;
  };
  autoRenewal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetSubscriptionsResponse {
  success: boolean;
  data: {
    subscriptions: Subscription[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    statistics: {
      totalSubscriptions: number;
      activeSubscriptions: number;
      paidSubscriptions: number;
      pendingSubscriptions: number;
      failedSubscriptions: number;
      totalRevenue: number;
      avgDuration: number;
    };
  };
}

export interface GetSubscriptionResponse {
  success: boolean;
  data: Subscription;
}

export interface CancelSubscriptionRequest {
  reason: string;
  immediate: boolean;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message: string;
}

export interface UpdateSubscriptionRequest {
  planType: 'BASIC' | 'PREMIUM' | 'PROFESSIONAL';
}

export interface UpdateSubscriptionResponse {
  success: boolean;
  data: Subscription;
}

export interface RenewSubscriptionResponse {
  success: boolean;
  data: Subscription;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getMySubscriptions(params: {
    page?: number;
    limit?: number;
    status?: string;
    planType?: string;
    paymentStatus?: string;
    isActive?: boolean;
    duration?: number;
    dateFrom?: string;
    dateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
  }): Observable<GetSubscriptionsResponse> {
    let httpParams = new HttpParams();
    
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.planType) httpParams = httpParams.set('planType', params.planType);
    if (params.paymentStatus) httpParams = httpParams.set('paymentStatus', params.paymentStatus);
    if (params.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive.toString());
    if (params.duration) httpParams = httpParams.set('duration', params.duration.toString());
    if (params.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom);
    if (params.dateTo) httpParams = httpParams.set('dateTo', params.dateTo);
    if (params.endDateFrom) httpParams = httpParams.set('endDateFrom', params.endDateFrom);
    if (params.endDateTo) httpParams = httpParams.set('endDateTo', params.endDateTo);

    return this.http.get<GetSubscriptionsResponse>(`${this.baseUrl}/api/subscription/admin/all`, { params: httpParams });
  }

  getSubscription(subscriptionId: string): Observable<GetSubscriptionResponse> {
    return this.http.get<GetSubscriptionResponse>(`${this.baseUrl}/api/subscription/${subscriptionId}`);
  }

  cancelSubscription(subscriptionId: string, request: CancelSubscriptionRequest): Observable<CancelSubscriptionResponse> {
    return this.http.delete<CancelSubscriptionResponse>(`${this.baseUrl}/api/subscription/${subscriptionId}`, { body: request });
  }

  updateSubscription(subscriptionId: string, request: UpdateSubscriptionRequest): Observable<UpdateSubscriptionResponse> {
    return this.http.put<UpdateSubscriptionResponse>(`${this.baseUrl}/api/subscription/${subscriptionId}`, request);
  }

  renewSubscription(subscriptionId: string): Observable<RenewSubscriptionResponse> {
    return this.http.post<RenewSubscriptionResponse>(`${this.baseUrl}/api/subscription/${subscriptionId}/renew`, {});
  }
}
