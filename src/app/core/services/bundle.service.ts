/**
 * Bundle Management Service
 * Enterprise-grade Angular service for Bundle operations
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../config/environment';

// Import all bundle interfaces
import type {
  Bundle,
  CreateBundleRequest,
  UpdateBundleRequest,
  GetBundlesQueryParams,
  ActivateBundleRequest,
  DeactivateBundleRequest,
  DeleteBundleRequest,
  CreateBundleResponse,
  GetBundlesResponse,
  GetBundleByIdResponse,
  UpdateBundleResponse,
  ActivateBundleResponse,
  DeactivateBundleResponse,
  DeleteBundleResponse,
  BundleErrorResponse,
  BundleStatus,
  SortOrder,
  SortField,
  Pagination,
  Filters,
  BundleListItem,
  BundleStats
} from '../models/bundle.interface';

@Injectable({
  providedIn: 'root'
})
export class BundleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/bundles`;
  private readonly defaultParams = {
    page: 1,
    limit: 10,
    status: 'active' as BundleStatus,
    sortBy: 'createdAt' as SortField,
    sortOrder: 'desc' as SortOrder
  };

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  /**
   * Get all bundles with pagination, filtering, and sorting
   * @param params Query parameters for filtering and pagination
   * @returns Observable with paginated bundles data
   */
  getAllBundles(params: GetBundlesQueryParams = {}): Observable<GetBundlesResponse> {
    const queryParams = this.buildQueryParams({
      ...this.defaultParams,
      ...params
    });

    return this.http.get<GetBundlesResponse>(this.apiUrl, { params: queryParams }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get bundle by ID
   * @param bundleId Bundle ID
   * @returns Observable with bundle data
   */
  getBundleById(bundleId: string): Observable<GetBundleByIdResponse> {
    if (!bundleId) {
      return throwError(() => new Error('Bundle ID is required'));
    }

    return this.http.get<GetBundleByIdResponse>(`${this.apiUrl}/${bundleId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new bundle
   * @param bundleData Bundle creation data
   * @returns Observable with created bundle data
   */
  createBundle(bundleData: CreateBundleRequest): Observable<CreateBundleResponse> {
    this.validateBundleData(bundleData);

    return this.http.post<CreateBundleResponse>(this.apiUrl, bundleData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update existing bundle (partial update supported)
   * @param bundleId Bundle ID
   * @param updateData Partial bundle update data
   * @returns Observable with updated bundle data
   */
  updateBundle(bundleId: string, updateData: UpdateBundleRequest): Observable<UpdateBundleResponse> {
    if (!bundleId) {
      return throwError(() => new Error('Bundle ID is required'));
    }

    if (updateData.pricing) {
      this.validatePricing(updateData.pricing);
    }

    return this.http.put<UpdateBundleResponse>(`${this.apiUrl}/${bundleId}`, updateData).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // STATUS MANAGEMENT
  // ============================================================================

  /**
   * Activate bundle
   * @param bundleId Bundle ID
   * @returns Observable with activation response
   */
  activateBundle(bundleId: string): Observable<ActivateBundleResponse> {
    if (!bundleId) {
      return throwError(() => new Error('Bundle ID is required'));
    }

    return this.http.patch<ActivateBundleResponse>(`${this.apiUrl}/${bundleId}/activate`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Deactivate bundle
   * @param bundleId Bundle ID
   * @returns Observable with deactivation response
   */
  deactivateBundle(bundleId: string): Observable<DeactivateBundleResponse> {
    if (!bundleId) {
      return throwError(() => new Error('Bundle ID is required'));
    }

    return this.http.patch<DeactivateBundleResponse>(`${this.apiUrl}/${bundleId}/deactivate`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete bundle permanently
   * @param bundleId Bundle ID
   * @returns Observable with deletion response
   */
  deleteBundle(bundleId: string): Observable<DeleteBundleResponse> {
    if (!bundleId) {
      return throwError(() => new Error('Bundle ID is required'));
    }

    return this.http.delete<DeleteBundleResponse>(`${this.apiUrl}/${bundleId}`).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get bundle statistics
   * @returns Observable with bundle statistics
   */
  getBundleStats(): Observable<{ success: boolean; data: BundleStats }> {
    return this.http.get<{ success: boolean; data: BundleStats }>(`${this.apiUrl}/stats`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Search bundles by name
   * @param searchTerm Search term
   * @param limit Maximum results to return
   * @returns Observable with search results
   */
  searchBundles(searchTerm: string, limit: number = 10): Observable<GetBundlesResponse> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return throwError(() => new Error('Search term is required'));
    }

    return this.getAllBundles({
      search: searchTerm.trim(),
      limit,
      page: 1
    });
  }

  /**
   * Get bundles for a specific doctor
   * @param doctorId Doctor ID
   * @returns Observable with bundles containing the doctor
   */
  getBundlesByDoctor(doctorId: string): Observable<GetBundlesResponse> {
    if (!doctorId) {
      return throwError(() => new Error('Doctor ID is required'));
    }

    return this.http.get<GetBundlesResponse>(`${this.apiUrl}/doctor/${doctorId}`).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Build HTTP parameters from query params object
   * @param params Query parameters
   * @returns HttpParams instance
   */
  private buildQueryParams(params: GetBundlesQueryParams): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return httpParams;
  }

  /**
   * Validate bundle creation data
   * @param data Bundle data to validate
   */
  private validateBundleData(data: CreateBundleRequest): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Bundle name is required');
    }

    if (!data.doctors || data.doctors.length < 2) {
      throw new Error('Bundle must contain at least 2 doctors');
    }

    if (data.doctors.length > 3) {
      throw new Error('Bundle cannot contain more than 3 doctors');
    }

    this.validatePricing(data.pricing);
  }

  /**
   * Validate pricing data
   * @param pricing Pricing object to validate
   */
  private validatePricing(pricing: any): void {
    if (!pricing) {
      throw new Error('Pricing information is required');
    }

    const { oneMonth, threeMonths, sixMonths } = pricing;

    if (typeof oneMonth !== 'number' || oneMonth <= 0) {
      throw new Error('One month price must be a positive number');
    }

    if (typeof threeMonths !== 'number' || threeMonths <= 0) {
      throw new Error('Three months price must be a positive number');
    }

    if (typeof sixMonths !== 'number' || sixMonths <= 0) {
      throw new Error('Six months price must be a positive number');
    }

    // Validate logical pricing (longer duration should be cheaper per month)
    const oneMonthPerMonth = oneMonth;
    const threeMonthsPerMonth = threeMonths / 3;
    const sixMonthsPerMonth = sixMonths / 6;

    if (threeMonthsPerMonth >= oneMonthPerMonth) {
      console.warn('Three months pricing should offer discount compared to one month');
    }

    if (sixMonthsPerMonth >= threeMonthsPerMonth) {
      console.warn('Six months pricing should offer discount compared to three months');
    }
  }

  /**
   * Handle HTTP errors
   * @param error HTTP error response
   * @returns Observable with error
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && error.error.error) {
      // Server-side error with message
      errorMessage = error.error.error;
    } else if (error.status) {
      // Server-side error without message
      switch (error.status) {
        case 400:
          errorMessage = 'Bad request. Please check your input data.';
          break;
        case 401:
          errorMessage = 'Authentication required. Please log in.';
          break;
        case 403:
          errorMessage = 'Insufficient permissions to perform this action.';
          break;
        case 404:
          errorMessage = 'Bundle not found.';
          break;
        case 409:
          errorMessage = 'Conflict. Bundle with this name already exists.';
          break;
        case 422:
          errorMessage = 'Validation error. Please check all required fields.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Server error: ${error.status} ${error.statusText}`;
      }
    }

    console.error('Bundle Service Error:', error);
    return throwError(() => new Error(errorMessage));
  };

  // ============================================================================
  // CONVENIENCE METHODS FOR COMMON OPERATIONS
  // ============================================================================

  /**
   * Get active bundles only
   * @param page Page number
   * @param limit Items per page
   * @returns Observable with active bundles
   */
  getActiveBundles(page: number = 1, limit: number = 10): Observable<GetBundlesResponse> {
    return this.getAllBundles({
      page,
      limit,
      status: 'active'
    });
  }

  /**
   * Get inactive bundles only
   * @param page Page number
   * @param limit Items per page
   * @returns Observable with inactive bundles
   */
  getInactiveBundles(page: number = 1, limit: number = 10): Observable<GetBundlesResponse> {
    return this.getAllBundles({
      page,
      limit,
      status: 'inactive'
    });
  }

  /**
   * Get bundles sorted by name
   * @param sortOrder Sort order (asc or desc)
   * @param page Page number
   * @param limit Items per page
   * @returns Observable with sorted bundles
   */
  getBundlesSortedByName(sortOrder: SortOrder = 'asc', page: number = 1, limit: number = 10): Observable<GetBundlesResponse> {
    return this.getAllBundles({
      page,
      limit,
      sortBy: 'name',
      sortOrder
    });
  }

  /**
   * Get bundles sorted by price
   * @param sortOrder Sort order (asc or desc)
   * @param page Page number
   * @param limit Items per page
   * @returns Observable with sorted bundles
   */
  getBundlesSortedByPrice(sortOrder: SortOrder = 'asc', page: number = 1, limit: number = 10): Observable<GetBundlesResponse> {
    return this.getAllBundles({
      page,
      limit,
      sortBy: 'pricing.oneMonth',
      sortOrder
    });
  }

  /**
   * Toggle bundle status (activate if inactive, deactivate if active)
   * @param bundleId Bundle ID
   * @returns Observable with toggle response
   */
  toggleBundleStatus(bundleId: string): Observable<ActivateBundleResponse | DeactivateBundleResponse> {
    return new Observable<ActivateBundleResponse | DeactivateBundleResponse>((subscriber) => {
      this.getBundleById(bundleId).subscribe({
        next: (response) => {
          const bundle = response.data.bundle;
          if (bundle.isActive) {
            this.deactivateBundle(bundleId).subscribe({
              next: (deactivateResponse) => subscriber.next(deactivateResponse),
              error: (error) => subscriber.error(error)
            });
          } else {
            this.activateBundle(bundleId).subscribe({
              next: (activateResponse) => subscriber.next(activateResponse),
              error: (error) => subscriber.error(error)
            });
          }
        },
        error: (error) => subscriber.error(error)
      });
    });
  }
}
