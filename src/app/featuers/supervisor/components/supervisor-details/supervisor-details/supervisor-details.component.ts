import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PermissionsPanelComponent } from '../permissions-panel/permissions-panel.component';
import { SupervisorService, AuditLog, GetAuditLogsResponse } from '../../../../../core/services/supervisor.service';

@Component({
  selector: 'app-supervisor-details',
  imports: [CommonModule, FormsModule, PermissionsPanelComponent],
  templateUrl: './supervisor-details.component.html',
  styleUrl: './supervisor-details.component.scss'
})
export class SupervisorDetailsComponent implements OnInit {
  supervisorId!: string;
  activeTab: 'permissions' | 'logs' = 'permissions';
  
  logs: AuditLog[] = [];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  } = {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  };
  isLoading = false;
  selectedLog: AuditLog | null = null;
  
  filters = {
    page: 1,
    limit: 10,
    supervisorId: '',
    action: '',
    module: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  };

  constructor(
    private route: ActivatedRoute,
    private supervisorService: SupervisorService
  ) {}

  ngOnInit(): void {
    this.supervisorId = this.route.snapshot.paramMap.get('id')!;
    this.filters.supervisorId = this.supervisorId;
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    
    this.supervisorService.getAuditLogs(this.filters).subscribe({
      next: (response: GetAuditLogsResponse) => {
        this.logs = response.data.logs;
        this.pagination = response.data.pagination;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.loadLogs();
  }

  previousPage(): void {
    if (this.pagination.currentPage > 1) {
      this.filters.page = this.pagination.currentPage - 1;
      this.loadLogs();
    }
  }

  nextPage(): void {
    if (this.pagination.currentPage < this.pagination.totalPages) {
      this.filters.page = this.pagination.currentPage + 1;
      this.loadLogs();
    }
  }

  viewLogDetails(log: AuditLog): void {
    this.selectedLog = log;
  }

  closeLogDetails(): void {
    this.selectedLog = null;
  }
}
