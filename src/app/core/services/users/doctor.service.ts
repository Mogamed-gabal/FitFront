import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../config/environment';

export interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  status: 'approved' | 'pending' | 'rejected';
  isBlocked: boolean;
  isRecommended: boolean;
  recommendedAt?: string;
  recommendationReason?: string;
  profilePicture?: Certificate;
  id_card_front?: Certificate;
  id_card_back?: Certificate;
  shortBio?: string;
  certificates?: Certificate[];
  packages?: Package[];
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  secure_url: string;
  public_id: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  isActive: boolean;
}

export interface GetDoctorsParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
}

export interface GetDoctorsResponse {
  success: boolean;
  data: {
    doctors: Doctor[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalDoctors: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface GetDoctorByIdResponse {
  success: boolean;
  data: Doctor;
}

export interface ApproveDoctorResponse {
  success: boolean;
  message: string;
  data: {
    user: Doctor & {
      approvedAt: string;
      approvedBy: string;
      emailVerified: string,
    };
  };
}

export interface RejectDoctorResponse {
  success: boolean;
  message: string;
  data: {
    user: Doctor & {
      rejectedAt: string;
      rejectedBy: string;
      rejectionReason?: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getDoctors(params: GetDoctorsParams = {}): Observable<GetDoctorsResponse> {
    let httpParams = new HttpParams();
    if (params.page != null) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params.limit != null) {
      httpParams = httpParams.set('limit', String(params.limit));
    }
    if (params.search != null && params.search.trim() !== '') {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.specialization != null && params.specialization.trim() !== '') {
      httpParams = httpParams.set('specialization', params.specialization.trim());
    }

    return this.http.get<GetDoctorsResponse>(`${this.baseUrl}/api/doctors`, {
      params: httpParams,
    });
  }

  getDoctorById(id: string): Observable<Doctor> {
    return this.http.get<GetDoctorByIdResponse>(`${this.baseUrl}/api/doctors/${id}`).pipe(
      map((response: GetDoctorByIdResponse) => response.data)
    );
  }

  blockDoctor(id: string, reason: string): Observable<{ success: boolean; message: string; data: Doctor }> {
    return this.http.post<{ success: boolean; message: string; data: Doctor }>(`${this.baseUrl}/api/admin/users/${id}/block`, { reason });
  }

  unblockDoctor(id: string): Observable<{ success: boolean; message: string; data: Doctor }> {
    return this.http.post<{ success: boolean; message: string; data: Doctor }>(`${this.baseUrl}/api/admin/users/${id}/unblock`, {});
  }

  deleteDoctor(id: string, reason?: string): Observable<{ success: boolean; message: string; data: Doctor }> {
    const options = reason ? { body: { reason } } : {};
    return this.http.delete<{ success: boolean; message: string; data: Doctor }>(`${this.baseUrl}/api/admin/users/${id}`, options);
  }

  approveDoctor(userId: string): Observable<ApproveDoctorResponse> {
    return this.http.post<ApproveDoctorResponse>(`${this.baseUrl}/api/auth/admin/approve/${userId}`, {});
  }

  rejectDoctor(userId: string, rejectionReason?: string): Observable<RejectDoctorResponse> {
    const body = rejectionReason ? { rejectionReason } : {};
    return this.http.post<RejectDoctorResponse>(`${this.baseUrl}/api/auth/admin/reject/${userId}`, body);
  }

  recommendDoctor(doctorId: string, reason?: string): Observable<{ success: boolean; message: string; data: Doctor }> {
    return this.http.post<{ success: boolean; message: string; data: Doctor }>(`${this.baseUrl}/api/doctors/${doctorId}/recommend`, { reason });
  }

  unrecommendDoctor(doctorId: string, reason?: string): Observable<{ success: boolean; message: string; data: Doctor }> {
    return this.http.delete<{ success: boolean; message: string; data: Doctor }>(`${this.baseUrl}/api/doctors/${doctorId}/recommend`, {
      body: { reason }
    });
  }
}
