import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { Bundle, BundleStatus, DoctorInBundle, GetBundleByIdResponse } from '../../../../../core/models/bundle.interface';
import { BundleService } from '../../../../../core/services/bundle.service';

@Component({
  selector: 'app-bundle-details',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './bundle-details.component.html',
  styleUrl: './bundle-details.component.scss'
})
export class BundleDetailsComponent implements OnInit, OnDestroy {
  bundle = signal<Bundle | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  // Public getters for template access
  get isLoadingValue() { return this.isLoading(); }
  get bundleValue() { return this.bundle(); }
  get errorValue() { return this.error(); }
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bundleService: BundleService
  ) {}

  ngOnInit(): void {
    this.loadBundle();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBundle(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Bundle ID not found');
      this.isLoading.set(false);
      return;
    }

    this.bundleService.getBundleById(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: GetBundleByIdResponse) => {
        this.bundle.set(response.data.bundle);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading bundle:', error);
        this.error.set('Failed to load bundle details');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/bundles']);
  }

  editBundle(): void {
    const id = this.bundleId();
    if (id) {
      this.router.navigate(['/bundles', id, 'edit']);
    }
  }

  activateBundle(): void {
    // TODO: Implement activation logic
    console.log('Activate bundle:', this.bundleId());
  }

  deactivateBundle(): void {
    // TODO: Implement deactivation logic
    console.log('Deactivate bundle:', this.bundleId());
  }

  deleteBundle(): void {
    // TODO: Implement delete logic
    console.log('Delete bundle:', this.bundleId());
  }

  retryLoading(): void {
    this.error.set(null);
    this.isLoading.set(true);
    this.loadBundle();
  }

  // Helper getters
  bundleId = computed(() => this.bundle()?._id || '');
  bundleName = computed(() => this.bundle()?.name || '');
  bundleStatus = computed(() => this.bundle()?.isActive ? 'active' : 'inactive');
  createdDate = computed(() => {
    const bundle = this.bundle();
    return bundle?.createdAt ? new Date(bundle.createdAt) : null;
  });
  updatedDate = computed(() => {
    const bundle = this.bundle();
    return bundle?.updatedAt ? new Date(bundle.updatedAt) : null;
  });
  createdBy = computed(() => this.bundle()?.createdBy?.name || '');
  doctors = computed(() => {
    const bundle = this.bundle();
    return bundle?.doctors?.map(d => d.doctorId).filter(d => d !== null) || [];
  });
  pricing = computed(() => this.bundle()?.pricing || { oneMonth: 0, threeMonths: 0, sixMonths: 0 });
}
