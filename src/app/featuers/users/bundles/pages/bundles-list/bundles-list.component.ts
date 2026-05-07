import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { BundleService } from '../../../../../core/services/bundle.service';
import type { 
  Bundle, 
  GetBundlesQueryParams, 
  BundleStatus, 
  SortField, 
  SortOrder,
  Pagination
} from '../../../../../core/models/bundle.interface';

@Component({
  selector: 'app-bundles-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './bundles-list.component.html',
  styleUrl: './bundles-list.component.scss'
})
export class BundlesListComponent implements OnInit, OnDestroy {
  // Signals for reactive state management
  bundles = signal<Bundle[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal<boolean>(false);
  searchTerm = signal<string>('');
  selectedStatus = signal<BundleStatus>('active');
  selectedSortField = signal<SortField>('createdAt');
  selectedSortOrder = signal<SortOrder>('desc');
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(12);
  
  // Computed signals
  hasBundles = computed(() => {
    const bundlesData = this.bundles();
    return bundlesData && bundlesData.length > 0;
  });
  totalPages = computed(() => 1); // API doesn't return pagination, default to 1 page
  totalItems = computed(() => this.bundles()?.length || 0); // Calculate from actual bundles
  
  // Subject for search debouncing
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private bundleService: BundleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeSearchDebouncer();
    this.loadBundles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  private loadBundles(): void {
    this.isLoading.set(true);

    const params: GetBundlesQueryParams = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      status: this.selectedStatus(),
      search: this.searchTerm() || undefined,
      sortBy: this.selectedSortField(),
      sortOrder: this.selectedSortOrder()
    };

    this.bundleService.getAllBundles(params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.bundles.set(response.data);
        this.pagination.set(null); // API doesn't return pagination
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading bundles:', error);
        this.bundles.set([]);
        this.pagination.set(null);
        this.isLoading.set(false);
      }
    });
  }

  // ============================================================================
  // SEARCH & FILTERING
  // ============================================================================

  private initializeSearchDebouncer(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadBundles();
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.searchSubject.next(term);
  }

  onStatusChange(status: BundleStatus): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
    this.loadBundles();
  }

  onSortChange(field: SortField, order: SortOrder): void {
    this.selectedSortField.set(field);
    this.selectedSortOrder.set(order);
    this.currentPage.set(1);
    this.loadBundles();
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage.set(itemsPerPage);
    this.currentPage.set(1);
    this.loadBundles();
  }

  // ============================================================================
  // PAGINATION
  // ============================================================================

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadBundles();
  }

  onNextPage(): void {
    if (this.pagination()?.hasNext) {
      this.onPageChange(this.currentPage() + 1);
    }
  }

  onPreviousPage(): void {
    if (this.pagination()?.hasPrev) {
      this.onPageChange(this.currentPage() - 1);
    }
  }

  // ============================================================================
  // BUNDLE ACTIONS
  // ============================================================================

  onActivateBundle(bundleId: string): void {
    this.bundleService.activateBundle(bundleId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.loadBundles();
      },
      error: (error) => {
        console.error('Error activating bundle:', error);
      }
    });
  }

  onDeactivateBundle(bundleId: string): void {
    this.bundleService.deactivateBundle(bundleId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.loadBundles();
      },
      error: (error) => {
        console.error('Error deactivating bundle:', error);
      }
    });
  }

  onDeleteBundle(bundleId: string): void {
    if (confirm('Are you sure you want to delete this bundle? This action cannot be undone.')) {
      this.bundleService.deleteBundle(bundleId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.loadBundles();
        },
        error: (error) => {
          console.error('Error deleting bundle:', error);
        }
      });
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getBundleStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getBundleStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getMinPrice(bundle: Bundle): number {
    return Math.min(bundle.pricing.oneMonth, bundle.pricing.threeMonths, bundle.pricing.sixMonths);
  }

  getDoctorCount(bundle: Bundle): number {
    return bundle.doctors.length;
  }

  // ============================================================================
  // PAGINATION HELPERS
  // ============================================================================

  getPagesArray(): number[] {
    const pagination = this.pagination();
    if (!pagination) return [];
    
    const pages: number[] = [];
    const current = this.currentPage();
    const total = pagination.totalPages;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  hasPreviousPage(): boolean {
    return this.pagination()?.hasPrev || false;
  }

  hasNextPage(): boolean {
    return this.pagination()?.hasNext || false;
  }

  // ============================================================================
  // EMPTY STATE HELPERS
  // ============================================================================

  get shouldShowEmptyState(): boolean {
    return !this.isLoading() && !this.hasBundles();
  }

  get shouldShowNoResultsState(): boolean {
    return !this.isLoading() && !this.hasBundles() && (!!this.searchTerm() || this.selectedStatus() !== 'active');
  }

  get shouldShowCreateBundleState(): boolean {
    return !this.isLoading() && !this.hasBundles() && !this.searchTerm() && this.selectedStatus() === 'active';
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('active');
    this.selectedSortField.set('createdAt');
    this.selectedSortOrder.set('desc');
    this.currentPage.set(1);
    this.loadBundles();
  }

  // ============================================================================
  // NAVIGATION METHODS
  // ============================================================================

  navigateToDetails(bundleId: string): void {
    this.router.navigate(['/bundles', bundleId]);
  }

  navigateToEdit(bundleId: string): void {
    this.router.navigate(['/bundles', bundleId, 'edit']);
  }

  // Helper method for pagination calculation
  getPaginationEndCount(): number {
    return Math.min(this.currentPage() * this.itemsPerPage(), this.totalItems());
  }
}
