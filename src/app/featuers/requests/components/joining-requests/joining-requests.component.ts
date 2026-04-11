import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorService, Doctor, GetDoctorsResponse } from '../../../../core/services/users/doctor.service';
import { Observable, map } from 'rxjs';
import { RequestFilterComponent } from './components/request-filter/request-filter.component';
import { RequestTableComponent } from './components/request-table/request-table.component';
import { RequestModelComponent } from './components/request-model/request-model.component';

@Component({
  selector: 'app-joining-requests',
  imports: [CommonModule, RequestFilterComponent, RequestTableComponent, RequestModelComponent],
  templateUrl: './joining-requests.component.html',
  styleUrl: './joining-requests.component.scss'
})
export class JoiningRequestsComponent implements OnInit {
  doctors$: Observable<GetDoctorsResponse> | null = null;
  isLoading = false;
  selectedDoctor: Doctor | null = null;
  showModal = false;

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.loadPendingDoctors();
  }

  loadPendingDoctors(): void {
    this.isLoading = true;
    this.doctors$ = this.doctorService.getDoctors({ 
      page: 1, 
      limit: 50
    }).pipe(
      map(response => {
        const filteredDoctors = response.data?.doctors?.filter(doctor => doctor.status === 'pending') || [];
        return {
          ...response,
          data: {
            ...response.data,
            doctors: filteredDoctors
          }
        };
      })
    );
  }

  onRefresh(): void {
    this.loadPendingDoctors();
  }

  onFilterChange(filters: any): void {
    const params: any = {
      page: 1,
      limit: 50
    };

    if (filters.search) {
      params.search = filters.search;
    }

    if (filters.specialization) {
      params.specialization = filters.specialization;
    }

    this.isLoading = true;
    this.doctors$ = this.doctorService.getDoctors(params);
  }

  onApproveDoctor(doctor: Doctor): void {
    this.doctorService.approveDoctor(doctor._id).subscribe({
      next: (response) => {
        console.log('Doctor approved:', response);
        this.loadPendingDoctors();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error approving doctor:', error);
      }
    });
  }

  onRejectDoctor(doctor: Doctor): void {
    this.doctorService.rejectDoctor(doctor._id, 'Rejected by admin').subscribe({
      next: (response) => {
        console.log('Doctor rejected:', response);
        this.loadPendingDoctors();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error rejecting doctor:', error);
      }
    });
  }

  onViewDoctor(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedDoctor = null;
  }
}
