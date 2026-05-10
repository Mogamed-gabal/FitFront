import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { Doctor, DoctorService, GetDoctorsParams, CreateBundleRequest } from '../../../core/services/users/doctor.service';
import { DoctorTableComponent } from './doctor-table/doctor-table.component';
import { DoctorDetailsModalComponent } from './doctor-details-modal/doctor-details-modal.component';
import { DoctorTableRow } from './doctor.types';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorTableComponent, DoctorDetailsModalComponent],
  templateUrl: './doctor.component.html',
  styleUrl: './doctor.component.scss',
})
export class DoctorComponent implements OnInit {
  private readonly doctorService = inject(DoctorService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly searchTrigger$ = new Subject<string>();

  protected readonly searchTerm = signal('');
  protected readonly selectedSpecialization = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly doctors = signal<Doctor[]>([]);
  protected readonly selectedDoctor = signal<Doctor | null>(null);
  protected readonly specializations = signal<string[]>([]);

  protected readonly pagination = signal({
    currentPage: 1,
    totalPages: 1,
    totalDoctors: 0,
    hasNext: false,
    hasPrev: false,
  });

  protected readonly loading = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Bundle creation state
  protected readonly bundleMode = signal(false);
  protected readonly selectedDoctors = signal<string[]>([]);
  protected readonly bundleName = signal('');
  protected readonly bundlePricing = signal({
    oneMonth: '',
    threeMonths: '',
    sixMonths: ''
  });
  protected readonly bundleLoading = signal(false);
  protected readonly bundleError = signal<string | null>(null);

  protected readonly totalPages = computed(() => this.pagination().totalPages);
  protected readonly paginatedDoctors = computed(() => 
    this.doctors().map(this.mapToDoctorTableRow)
  );

  // Bundle computed properties
  protected readonly canCreateBundle = computed(() => {
    const selected = this.selectedDoctors();
    const name = this.bundleName().trim();
    const pricing = this.bundlePricing();
    
    return selected.length === 2 && 
           name.length > 0 && 
           name.length <= 100 &&
           pricing.oneMonth && 
           pricing.threeMonths && 
           pricing.sixMonths &&
           parseFloat(pricing.oneMonth) > 0 &&
           parseFloat(pricing.threeMonths) > 0 &&
           parseFloat(pricing.sixMonths) > 0;
  });

  protected readonly selectedDoctorsNames = computed(() => {
    const selectedIds = this.selectedDoctors();
    return this.doctors()
      .filter(doctor => selectedIds.includes(doctor._id))
      .map(doctor => doctor.name);
  });

  protected readonly isDoctorSelected = (doctorId: string) => {
    return this.selectedDoctors().includes(doctorId);
  };

  protected readonly isDoctorDisabled = (doctorId: string) => {
    const selected = this.selectedDoctors();
    return selected.length === 2 && !selected.includes(doctorId);
  };

  private mapToDoctorTableRow(doctor: Doctor): DoctorTableRow {
    return {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      status: doctor.status,
      isBlocked: doctor.isBlocked,
      isRecommended: doctor.isRecommended,
    };
  }

  ngOnInit(): void {
    this.searchTrigger$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadDoctors();
      });

    this.loadDoctors();
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    this.searchTrigger$.next(term);
  }

  protected onSpecializationChange(specialization: string): void {
    this.selectedSpecialization.set(specialization);
    this.currentPage.set(1);
    this.loadDoctors();
  }

  protected nextPage(): void {
    const p = this.pagination();
    if (!p.hasNext) {
      return;
    }
    this.currentPage.update((page) => page + 1);
    this.loadDoctors();
  }

  protected prevPage(): void {
    const p = this.pagination();
    if (!p.hasPrev) {
      return;
    }
    this.currentPage.update((page) => Math.max(page - 1, 1));
    this.loadDoctors();
  }

  protected openDoctorDetails(doctor: DoctorTableRow): void {
    this.detailLoading.set(true);
    this.errorMessage.set(null);

    // Find the full doctor data from the doctors list (which includes id_card_front and id_card_back)
    const fullDoctor = this.doctors().find(d => d._id === doctor.id);
    
    if (fullDoctor) {
      this.selectedDoctor.set(fullDoctor);
      this.detailLoading.set(false);
    } else {
      // Fallback to API call if not found in list
      this.doctorService
        .getDoctorById(doctor.id)
        .pipe(
          finalize(() => {
            this.detailLoading.set(false);
          }),
        )
        .subscribe({
          next: (doctorData) => {
            this.selectedDoctor.set(doctorData);
          },
          error: (err: unknown) => {
            this.errorMessage.set(this.extractErrorMessage(err));
          },
        });
    }
  }

  protected closeModal(): void {
    this.selectedDoctor.set(null);
  }

  protected onBlockDoctor(doctor: DoctorTableRow): void {
    Swal.fire({
      title: 'Block Doctor',
      text: `Are you sure you want to block ${doctor.name}?`,
      icon: 'warning',
      input: 'text',
      inputLabel: 'Reason for blocking',
      inputPlaceholder: 'Enter reason...',
      inputValidator: (value: string) => {
        if (!value) {
          return 'Reason is required!';
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Block',
      cancelButtonText: 'Cancel',
    }).then((result: any) => {
      if (result.isConfirmed && result.value) {
        // Show loading toast
        Swal.fire({
          title: 'Blocking Doctor...',
          text: `Please wait while blocking ${doctor.name}`,
          icon: 'info',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.doctorService.blockDoctor(doctor.id, result.value).subscribe({
          next: () => {
            Swal.close();
            Swal.fire('Blocked!', `${doctor.name} has been blocked.`, 'success');
            this.loadDoctors();
          },
          error: (err: unknown) => {
            Swal.close();
            this.errorMessage.set(this.extractErrorMessage(err));
          }
        });
      }
    });
  }

  protected onUnblockDoctor(doctor: DoctorTableRow): void {
    Swal.fire({
      title: 'Unblock Doctor',
      text: `Are you sure you want to unblock ${doctor.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Unblock',
      cancelButtonText: 'Cancel',
    }).then((result: any) => {
      if (result.isConfirmed) {
        // Show loading toast
        Swal.fire({
          title: 'Unblocking Doctor...',
          text: `Please wait while unblocking ${doctor.name}`,
          icon: 'info',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.doctorService.unblockDoctor(doctor.id).subscribe({
          next: () => {
            Swal.close();
            Swal.fire('Unblocked!', `${doctor.name} has been unblocked.`, 'success');
            this.loadDoctors();
          },
          error: (err: unknown) => {
            Swal.close();
            this.errorMessage.set(this.extractErrorMessage(err));
          }
        });
      }
    });
  }

  protected onDeleteDoctor(doctor: DoctorTableRow): void {
    Swal.fire({
      title: 'Delete Doctor',
      text: `Are you sure you want to delete ${doctor.name}? This action cannot be undone.`,
      icon: 'warning',
      input: 'text',
      inputLabel: 'Reason for deletion',
      inputPlaceholder: 'Enter reason...',
      inputValidator: (value: string) => {
        if (!value) {
          return 'Reason is required!';
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result: any) => {
      if (result.isConfirmed && result.value) {
        // Show loading toast
        Swal.fire({
          title: 'Deleting Doctor...',
          text: `Please wait while deleting ${doctor.name}`,
          icon: 'info',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.doctorService.deleteDoctor(doctor.id, result.value).subscribe({
          next: () => {
            Swal.close();
            Swal.fire('Deleted!', `${doctor.name} has been deleted.`, 'success');
            this.loadDoctors();
          },
          error: (err: unknown) => {
            Swal.close();
            this.errorMessage.set(this.extractErrorMessage(err));
          }
        });
      }
    });
  }

  protected onRecommendDoctor(doctor: DoctorTableRow): void {
    console.log('🔍 Before recommend - Doctor:', doctor.name, 'isRecommended:', doctor.isRecommended);
    
    Swal.fire({
      title: 'Recommend Doctor',
      text: `Do you want to recommend ${doctor.name}?`,
      icon: 'question',
      input: 'text',
      inputLabel: 'Reason (optional)',
      inputPlaceholder: 'Enter reason...',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Recommend',
      cancelButtonText: 'Cancel',
    }).then((result: any) => {
      if (result.isConfirmed) {
        const reason = result.value || '';
        console.log('🔍 Sending recommend request for:', doctor.id, 'reason:', reason);
        
        // Show loading toast
        Swal.fire({
          title: 'Recommending Doctor...',
          text: `Please wait while recommending ${doctor.name}`,
          icon: 'info',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.doctorService.recommendDoctor(doctor.id, reason).subscribe({
          next: (response) => {
            console.log('🔍 Recommend response:', response);
            console.log('🔍 Updated doctor isRecommended:', response.data.isRecommended);
            
            Swal.close();
            Swal.fire('Recommended!', `${doctor.name} has been recommended.`, 'success');
            this.updateDoctorInList(response.data);
            // Reload doctors list to get fresh data from server
            this.loadDoctors();
          },
          error: (err: unknown) => {
            console.error('🔍 Recommend error:', err);
            Swal.close();
            this.errorMessage.set(this.extractErrorMessage(err));
          }
        });
      }
    });
  }

  protected onUnrecommendDoctor(doctor: DoctorTableRow): void {
    console.log('🔍 Before unrecommend - Doctor:', doctor.name, 'isRecommended:', doctor.isRecommended);
    
    Swal.fire({
      title: 'Remove Recommendation',
      text: `Are you sure you want to remove recommendation for ${doctor.name}?`,
      icon: 'warning',
      input: 'text',
      inputLabel: 'Reason (optional)',
      inputPlaceholder: 'Enter reason...',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Remove Recommendation',
      cancelButtonText: 'Cancel',
    }).then((result: any) => {
      if (result.isConfirmed) {
        const reason = result.value || '';
        console.log('🔍 Sending unrecommend request for:', doctor.id, 'reason:', reason);
        
        // Show loading toast
        Swal.fire({
          title: 'Removing Recommendation...',
          text: `Please wait while removing recommendation for ${doctor.name}`,
          icon: 'info',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.doctorService.unrecommendDoctor(doctor.id, reason).subscribe({
          next: (response) => {
            console.log('🔍 Unrecommend response:', response);
            console.log('🔍 Updated doctor isRecommended:', response.data.isRecommended);
            
            Swal.close();
            Swal.fire('Removed!', `Recommendation for ${doctor.name} has been removed.`, 'success');
            this.updateDoctorInList(response.data);
            // Reload doctors list to get fresh data from server
            this.loadDoctors();
          },
          error: (err: unknown) => {
            console.error('🔍 Unrecommend error:', err);
            Swal.close();
            this.errorMessage.set(this.extractErrorMessage(err));
          }
        });
      }
    });
  }

  private updateDoctorInList(updatedDoctor: Doctor): void {
    const currentDoctors = this.doctors();
    const index = currentDoctors.findIndex(d => d._id === updatedDoctor._id);
    
    console.log('🔍 Update Doctor In List:');
    console.log('  - Doctor ID:', updatedDoctor._id);
    console.log('  - Doctor Name:', updatedDoctor.name);
    console.log('  - New isRecommended:', updatedDoctor.isRecommended);
    console.log('  - Found index:', index);
    console.log('  - Current doctors count:', currentDoctors.length);
    
    if (index !== -1) {
      console.log('  - Old isRecommended:', currentDoctors[index].isRecommended);
      currentDoctors[index] = updatedDoctor;
      this.doctors.set([...currentDoctors]);
      console.log('  - ✅ Doctor updated successfully');
    } else {
      console.log('  - ❌ Doctor not found in list');
    }
  }

  private loadDoctors(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const params: GetDoctorsParams = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm().trim() || undefined,
      specialization: this.selectedSpecialization() || undefined,
    };

    this.doctorService
      .getDoctors(params)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (res) => {
          if (!res.success || !res.data) {
            this.doctors.set([]);
            this.errorMessage.set('Invalid response from server.');
            return;
          }

          this.doctors.set(res.data.doctors);
          this.pagination.set(res.data.pagination);
          this.currentPage.set(res.data.pagination.currentPage);
          
          // Set predefined specializations
          this.specializations.set(['doctor', 'nutritionist', 'therapist', 'coach']);
        },
        error: (err: unknown) => {
          this.doctors.set([]);
          this.errorMessage.set(this.extractErrorMessage(err));
        },
      });
  }

  private extractErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const body = (err as { error?: { message?: string } }).error;
      if (body?.message && typeof body.message === 'string') {
        return body.message;
      }
    }
    return 'Something went wrong. Please try again.';
  }

  // Bundle creation methods
  protected toggleBundleMode(): void {
    this.bundleMode.set(!this.bundleMode());
    if (!this.bundleMode()) {
      this.resetBundleForm();
    }
  }

  protected onDoctorSelect(doctorId: string): void {
    const selected = this.selectedDoctors();
    if (selected.includes(doctorId)) {
      this.selectedDoctors.set(selected.filter(id => id !== doctorId));
    } else if (selected.length < 2) {
      this.selectedDoctors.set([...selected, doctorId]);
    } else {
      this.bundleError.set('You can only select exactly 2 doctors for a bundle');
      setTimeout(() => this.bundleError.set(null), 3000);
    }
  }

  protected onCreateBundle(): void {
    if (!this.canCreateBundle()) {
      this.bundleError.set('Please fill all required fields correctly');
      setTimeout(() => this.bundleError.set(null), 3000);
      return;
    }

    this.bundleLoading.set(true);
    this.bundleError.set(null);

    const bundleData: CreateBundleRequest = {
      name: this.bundleName().trim(),
      doctors: this.selectedDoctors(),
      pricing: {
        oneMonth: parseFloat(this.bundlePricing().oneMonth),
        threeMonths: parseFloat(this.bundlePricing().threeMonths),
        sixMonths: parseFloat(this.bundlePricing().sixMonths)
      }
    };

    this.doctorService.createBundle(bundleData)
      .pipe(finalize(() => this.bundleLoading.set(false)))
      .subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Bundle Created!',
            text: `Bundle "${bundleData.name}" has been created successfully with ${this.selectedDoctorsNames().join(' + ')}`,
            confirmButtonColor: '#28a745'
          });
          this.resetBundleForm();
          this.bundleMode.set(false);
        },
        error: (err: any) => {
          const message = this.extractErrorMessage(err);
          this.bundleError.set(message);
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            text: message,
            confirmButtonColor: '#dc3545'
          });
        }
      });
  }

  protected resetBundleForm(): void {
    this.selectedDoctors.set([]);
    this.bundleName.set('');
    this.bundlePricing.set({
      oneMonth: '',
      threeMonths: '',
      sixMonths: ''
    });
    this.bundleError.set(null);
  }

  protected cancelBundleMode(): void {
    this.bundleMode.set(false);
    this.resetBundleForm();
  }

  // Helper methods for template to avoid arrow function syntax issues
  protected updateBundleName(value: string): void {
    this.bundleName.set(value);
  }

  protected updateBundleOneMonth(value: string): void {
    this.bundlePricing.update(p => ({ ...p, oneMonth: value }));
  }

  protected updateBundleThreeMonths(value: string): void {
    this.bundlePricing.update(p => ({ ...p, threeMonths: value }));
  }

  protected updateBundleSixMonths(value: string): void {
    this.bundlePricing.update(p => ({ ...p, sixMonths: value }));
  }
}
