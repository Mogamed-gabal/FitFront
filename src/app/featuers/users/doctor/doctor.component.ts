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
import { Doctor, DoctorService, GetDoctorsParams } from '../../../core/services/users/doctor.service';
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

  protected readonly totalPages = computed(() => this.pagination().totalPages);
  protected readonly paginatedDoctors = computed(() => 
    this.doctors().map(this.mapToDoctorTableRow)
  );

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
        this.doctorService.blockDoctor(doctor.id, result.value).subscribe({
          next: () => {
            Swal.fire('Blocked!', `${doctor.name} has been blocked.`, 'success');
            this.loadDoctors();
          },
          error: (err: unknown) => {
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
        this.doctorService.unblockDoctor(doctor.id).subscribe({
          next: () => {
            Swal.fire('Unblocked!', `${doctor.name} has been unblocked.`, 'success');
            this.loadDoctors();
          },
          error: (err: unknown) => {
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
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.doctorService.deleteDoctor(doctor.id).subscribe({
          next: () => {
            Swal.fire('Deleted!', `${doctor.name} has been deleted.`, 'success');
            this.loadDoctors();
          },
          error: (err: unknown) => {
            this.errorMessage.set(this.extractErrorMessage(err));
          }
        });
      }
    });
  }

  protected onRecommendDoctor(doctor: DoctorTableRow): void {
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
        this.doctorService.recommendDoctor(doctor.id, reason).subscribe({
          next: (response) => {
            Swal.fire('Recommended!', `${doctor.name} has been recommended.`, 'success');
            this.updateDoctorInList(response.data);
          },
          error: (err: unknown) => {
            this.errorMessage.set(this.extractErrorMessage(err));
          }
        });
      }
    });
  }

  protected onUnrecommendDoctor(doctor: DoctorTableRow): void {
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
        this.doctorService.unrecommendDoctor(doctor.id, reason).subscribe({
          next: (response) => {
            Swal.fire('Removed!', `Recommendation for ${doctor.name} has been removed.`, 'success');
            this.updateDoctorInList(response.data);
          },
          error: (err: unknown) => {
            this.errorMessage.set(this.extractErrorMessage(err));
          }
        });
      }
    });
  }

  private updateDoctorInList(updatedDoctor: Doctor): void {
    const currentDoctors = this.doctors();
    const index = currentDoctors.findIndex(d => d._id === updatedDoctor._id);
    if (index !== -1) {
      currentDoctors[index] = updatedDoctor;
      this.doctors.set([...currentDoctors]);
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
}
