/**
 * Bundle Management System - Complete Type Definitions
 * Enterprise-grade TypeScript interfaces for Bundle entities
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type BundleStatus = 'active' | 'inactive' | 'all';
export type SortOrder = 'asc' | 'desc';
export type SortField = 'name' | 'createdAt' | 'pricing.oneMonth' | 'updatedAt';

// ============================================================================
// CORE ENTITY INTERFACES
// ============================================================================

/**
 * Doctor entity within Bundle
 */
export interface DoctorInBundle {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
}

/**
 * Doctor reference with ID
 */
export interface DoctorReference {
  doctorId: DoctorInBundle | null;
  _id: string;
}

/**
 * Pricing model for Bundle
 */
export interface BundlePricing {
  oneMonth: number;
  threeMonths: number;
  sixMonths: number;
}

/**
 * Admin user reference (createdBy, activatedBy, deactivatedBy)
 */
export interface AdminReference {
  _id: string;
  name: string;
  email?: string;
}

/**
 * Complete Bundle entity
 */
export interface Bundle {
  _id: string;
  name: string;
  doctors: DoctorReference[];
  pricing: BundlePricing;
  isActive: boolean;
  createdBy: AdminReference;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  deactivatedAt?: string;
  activatedBy?: AdminReference;
  deactivatedBy?: AdminReference;
}

// ============================================================================
// REQUEST INTERFACES
// ============================================================================

/**
 * Create Bundle Request
 */
export interface CreateBundleRequest {
  name: string;
  doctors: string[]; // Array of doctor IDs
  pricing: BundlePricing;
}

/**
 * Update Bundle Request (Partial update supported)
 */
export interface UpdateBundleRequest {
  name?: string;
  doctors?: string[]; // Array of doctor IDs
  pricing?: Partial<BundlePricing>;
}

/**
 * Query Parameters for Get All Bundles
 */
export interface GetBundlesQueryParams {
  page?: number;
  limit?: number;
  status?: BundleStatus;
  search?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

/**
 * Activate Bundle Request
 */
export interface ActivateBundleRequest {
  bundleId: string;
}

/**
 * Deactivate Bundle Request
 */
export interface DeactivateBundleRequest {
  bundleId: string;
}

/**
 * Delete Bundle Request
 */
export interface DeleteBundleRequest {
  bundleId: string;
}

// ============================================================================
// RESPONSE INTERFACES
// ============================================================================

/**
 * Pagination metadata
 */
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Filter metadata
 */
export interface Filters {
  status: BundleStatus;
  search: string | null;
  sortBy: SortField;
  sortOrder: SortOrder;
}

/**
 * Create Bundle Response
 */
export interface CreateBundleResponse {
  success: boolean;
  message: string;
  data: {
    bundle: Bundle;
  };
}

/**
 * Get All Bundles Response
 */
export interface GetBundlesResponse {
  success: boolean;
  data: Bundle[];
}

/**
 * Get Bundle by ID Response
 */
export interface GetBundleByIdResponse {
  success: boolean;
  data: {
    bundle: Bundle;
  };
}

/**
 * Update Bundle Response
 */
export interface UpdateBundleResponse {
  success: boolean;
  message: string;
  data: {
    bundle: Bundle;
  };
}

/**
 * Activate Bundle Response
 */
export interface ActivateBundleResponse {
  success: boolean;
  message: string;
  data: {
    bundle: Partial<Bundle> & {
      _id: string;
      name: string;
      isActive: boolean;
      activatedAt: string;
      activatedBy: AdminReference;
    };
  };
}

/**
 * Deactivate Bundle Response
 */
export interface DeactivateBundleResponse {
  success: boolean;
  message: string;
  data: {
    bundle: Partial<Bundle> & {
      _id: string;
      name: string;
      isActive: boolean;
      deactivatedAt: string;
      deactivatedBy: AdminReference;
    };
  };
}

/**
 * Delete Bundle Response
 */
export interface DeleteBundleResponse {
  success: boolean;
  message: string;
  data: {
    deletedBundle: {
      _id: string;
      name: string;
    };
    deletedAt: string;
    deletedBy: AdminReference;
  };
}

// ============================================================================
// ERROR RESPONSE INTERFACES
// ============================================================================

/**
 * Standard API Error Response
 */
export interface BundleErrorResponse {
  success: false;
  error: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Bundle creation form data type
 */
export type BundleFormData = Omit<Bundle, '_id' | 'isActive' | 'createdBy' | 'createdAt' | 'updatedAt' | 'activatedAt' | 'deactivatedAt' | 'activatedBy' | 'deactivatedBy'> & {
  doctors: string[];
};

/**
 * Bundle list item (simplified for list views)
 */
export type BundleListItem = Pick<Bundle, '_id' | 'name' | 'isActive' | 'createdAt' | 'updatedAt'> & {
  doctorCount: number;
  minPrice: number;
};

/**
 * Bundle statistics
 */
export interface BundleStats {
  totalBundles: number;
  activeBundles: number;
  inactiveBundles: number;
  totalDoctors: number;
  avgPrice: number;
}
