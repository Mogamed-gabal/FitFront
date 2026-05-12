import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../config/environment';
import {
  DietPlanMonitoring,
  WorkoutPlanMonitoring,
  DietPlanProgress,
  WorkoutPlanProgress,
  DietPlanFilters,
  WorkoutPlanFilters,
  GetDietPlansResponse,
  GetWorkoutPlansResponse,
  GetDietPlanDetailsResponse,
  GetWorkoutPlanDetailsResponse,
  GetDietProgressResponse,
  GetWorkoutProgressResponse
} from '../../models/admin/admin-monitoring.model';

@Injectable({
  providedIn: 'root'
})
export class AdminMonitoringService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // Diet Plans Monitoring
  getDietPlans(filters: DietPlanFilters = {}): Observable<GetDietPlansResponse> {
    const httpParams = new HttpParams({ fromObject: filters as any });
    return this.http.get<GetDietPlansResponse>(`${this.baseUrl}/api/diet-plans`, { params: httpParams });
  }

  getDietPlanDetails(planId: string): Observable<GetDietPlanDetailsResponse> {
    return this.http.get<GetDietPlanDetailsResponse>(`${this.baseUrl}/api/diet-plans/${planId}`);
  }

  getDietPlanProgress(planId: string): Observable<GetDietProgressResponse> {
    return this.http.get<GetDietProgressResponse>(`${this.baseUrl}/api/progress/${planId}/stats`);
  }

  getClientDietPlans(clientId: string): Observable<GetDietPlansResponse> {
    return this.http.get<GetDietPlansResponse>(`${this.baseUrl}/api/diet-plans/client/${clientId}`);
  }

  getActiveDietPlan(clientId: string): Observable<GetDietPlanDetailsResponse> {
    return this.http.get<GetDietPlanDetailsResponse>(`${this.baseUrl}/api/diet-plans/active/${clientId}`);
  }

  // Workout Plans Monitoring
  getWorkoutPlans(filters: WorkoutPlanFilters = {}): Observable<GetWorkoutPlansResponse> {
    const httpParams = new HttpParams({ fromObject: filters as any });
    return this.http.get<GetWorkoutPlansResponse>(`${this.baseUrl}/api/workout-plans/plans`, { params: httpParams });
  }

  getWorkoutPlanDetails(planId: string): Observable<GetWorkoutPlanDetailsResponse> {
    return this.http.get<GetWorkoutPlanDetailsResponse>(`${this.baseUrl}/api/workout-plans/plans/${planId}`);
  }

  getWorkoutPlanProgress(planId: string): Observable<GetWorkoutProgressResponse> {
    return this.http.get<GetWorkoutProgressResponse>(`${this.baseUrl}/api/progress/${planId}/workout-stats`);
  }

  getClientWorkoutPlans(clientId: string): Observable<GetWorkoutPlansResponse> {
    return this.http.get<GetWorkoutPlansResponse>(`${this.baseUrl}/api/workout-plans/client/${clientId}`);
  }

  getActiveWorkoutPlan(clientId: string): Observable<GetWorkoutPlanDetailsResponse> {
    return this.http.get<GetWorkoutPlanDetailsResponse>(`${this.baseUrl}/api/workout-plans/active/${clientId}`);
  }

  // Client Overview
  getClientFitnessOverview(clientId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/clients/${clientId}/fitness-overview`);
  }

  getAllClientsFitnessMonitoring(filters: any = {}): Observable<any> {
    const httpParams = new HttpParams({ fromObject: filters as any });
    return this.http.get<any>(`${this.baseUrl}/api/clients/fitness-monitoring`, { params: httpParams });
  }

  // Analytics
  getDietSystemAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/analytics/diet-system`);
  }

  getWorkoutSystemAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/analytics/workout-system`);
  }
}
