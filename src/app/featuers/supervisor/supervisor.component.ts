import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupervisorService, Supervisor, GetSupervisorsResponse } from '../../core/services/supervisor.service';
import { SupervisorTableComponent } from './components/supervisor-table/supervisor-table.component';
import { SupervisorModalComponent } from './components/supervisor-modal/supervisor-modal.component';
import { CreatSupervisorModalComponent } from './components/creat-supervisor-modal/creat-supervisor-modal.component';

@Component({
  selector: 'app-supervisor',
  imports: [CommonModule, SupervisorTableComponent, SupervisorModalComponent, CreatSupervisorModalComponent],
  templateUrl: './supervisor.component.html',
  styleUrl: './supervisor.component.scss'
})
export class SupervisorComponent implements OnInit {
  supervisors: Supervisor[] = [];
  pagination: any = {};
  isLoading = false;
  selectedSupervisor: Supervisor | null = null;
  showModal = false;
  isCreateModalOpen = false;
  currentPage = 1;
  limit = 10;

  constructor(private supervisorService: SupervisorService, private router: Router) {}

  ngOnInit(): void {
    this.loadSupervisors();
  }

  loadSupervisors(): void {
    this.isLoading = true;
    this.supervisorService.getSupervisors(this.currentPage, this.limit).subscribe({
      next: (response) => {
        this.supervisors = response.data.users;
        this.pagination = response.data.pagination;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onViewSupervisor(id: string): void {
    this.router.navigate(['/supervisor', id]);
  }

  onDeleteSupervisor(supervisor: Supervisor): void {
    if (confirm(`Are you sure you want to delete supervisor ${supervisor.name}?`)) {
      this.supervisorService.deleteSupervisor(supervisor._id).subscribe({
        next: () => {
          this.loadSupervisors();
        }
      });
    }
  }

  onCloseModal(): void {
    this.showModal = false;
    this.selectedSupervisor = null;
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  onCreateSupervisor(data: any): void {
    this.supervisorService.createSupervisor(data).subscribe({
      next: () => {
        this.isCreateModalOpen = false;
        this.loadSupervisors();
      },
      error: (error) => {
        console.error('Error creating supervisor:', error);
      }
    });
  }

  onNextPage(): void {
    if (this.currentPage < this.pagination.pages) {
      this.currentPage++;
      this.loadSupervisors();
    }
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSupervisors();
    }
  }
}
