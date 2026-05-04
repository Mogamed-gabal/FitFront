import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorService, Doctor, GetDoctorsResponse } from '../../../../core/services/users/doctor.service';
import { Observable, map } from 'rxjs';
import { RequestFilterComponent } from './components/request-filter/request-filter.component';
import { RequestTableComponent } from './components/request-table/request-table.component';
import { RequestModelComponent } from './components/request-model/request-model.component';
import Swal from 'sweetalert2';

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
    // Show confirmation dialog
    Swal.fire({
      title: 'Approve Doctor Request?',
      html: `
        <div class="approval-confirmation">
          <p>Are you sure you want to approve this doctor's registration request?</p>
          <div class="doctor-info">
            <strong>${doctor.name}</strong><br>
            <small>${doctor.email}</small><br>
            <small>${doctor.specialization}</small>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        // Show loading spinner while processing
        return this.doctorService.approveDoctor(doctor._id).toPromise();
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        // Success toast
        Swal.fire({
          icon: 'success',
          title: 'Approved Successfully!',
          html: `
            <div class="success-message">
              <p>Doctor <strong>${doctor.name}</strong> has been approved successfully.</p>
              <p>The doctor will receive a notification about the approval.</p>
            </div>
          `,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          position: 'top-end',
          toast: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });
        
        // Refresh the list
        this.loadPendingDoctors();
        this.closeModal();
      }
    }).catch((error) => {
      // Error handling
      Swal.fire({
        icon: 'error',
        title: 'Approval Failed',
        html: `
          <div class="error-message">
            <p>Failed to approve doctor <strong>${doctor.name}</strong>.</p>
            <p>Please try again later.</p>
            <small>Error: ${error.message || 'Unknown error'}</small>
          </div>
        `,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
      console.error('Error approving doctor:', error);
    });
  }

  onRejectDoctor(doctor: Doctor): void {
    // Show confirmation dialog with reason input
    Swal.fire({
      title: 'Reject Doctor Request?',
      html: `
        <div class="rejection-confirmation">
          <p>Are you sure you want to reject this doctor's registration request?</p>
          <div class="doctor-info">
            <strong>${doctor.name}</strong><br>
            <small>${doctor.email}</small><br>
            <small>${doctor.specialization}</small>
          </div>
          <div class="reason-section">
            <label for="rejection-reason">Rejection Reason:</label>
            <textarea id="rejection-reason" class="swal2-textarea" placeholder="Please provide a reason for rejection..."></textarea>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Reject',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const reason = (document.getElementById('rejection-reason') as HTMLTextAreaElement).value || 'Rejected by admin';
        return this.doctorService.rejectDoctor(doctor._id, reason).toPromise();
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        // Success toast
        Swal.fire({
          icon: 'success',
          title: 'Rejected Successfully!',
          html: `
            <div class="success-message">
              <p>Doctor <strong>${doctor.name}</strong> has been rejected.</p>
              <p>The doctor will be notified about the rejection.</p>
            </div>
          `,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          position: 'top-end',
          toast: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });
        
        // Refresh the list
        this.loadPendingDoctors();
        this.closeModal();
      }
    }).catch((error) => {
      // Error handling
      Swal.fire({
        icon: 'error',
        title: 'Rejection Failed',
        html: `
          <div class="error-message">
            <p>Failed to reject doctor <strong>${doctor.name}</strong>.</p>
            <p>Please try again later.</p>
            <small>Error: ${error.message || 'Unknown error'}</small>
          </div>
        `,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
      console.error('Error rejecting doctor:', error);
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
