import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupervisorService, AuditLog, GetAuditLogsResponse, Supervisor, Permission, UserPermission, AvailablePermission, GetUserPermissionsResponse, GetAllPermissionsResponse, GrantPermissionRequest, GrantPermissionResponse, RevokePermissionRequest, RevokePermissionResponse } from '../../../../../core/services/supervisor.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-supervisor-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './supervisor-details.component.html',
  styleUrl: './supervisor-details.component.scss'
})
export class SupervisorDetailsComponent implements OnInit {
  supervisorId!: string;
  activeTab: 'permissions' | 'logs' = 'permissions';
  
  // Supervisor data
  supervisor: Supervisor | null = null;
  isLoadingSupervisor = false;
  
  // Permissions data
  assignedPermissions: UserPermission[] = [];
  availablePermissions: AvailablePermission[] = [];
  isLoadingPermissions = false;
  isUpdatingPermission = false;

  // Modal properties
  showGrantModal = false;
  showRevokeModal = false;
  selectedPermission: string = '';
  selectedRevokePermission: string = '';
  grantReason: string = '';
  revokeReason: string = '';
  grantExpiry: string = '';

  // Notification system
  notification: {
    type: 'success' | 'error' | 'warning';
    message: string;
    icon: string;
  } | null = null;
  
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
    this.loadSupervisor();
    this.loadPermissions();
    this.loadLogs();
  }

  loadSupervisor(): void {
    this.isLoadingSupervisor = true;
    this.supervisorService.getSupervisor(this.supervisorId).subscribe({
      next: (response) => {
        this.supervisor = response.data;
        this.isLoadingSupervisor = false;
      },
      error: () => {
        this.isLoadingSupervisor = false;
        // Fallback mock data
        this.supervisor = {
          _id: this.supervisorId,
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    });
  }

  loadPermissions(): void {
    this.isLoadingPermissions = true;
    
    // Load user permissions and available permissions in parallel
    this.supervisorService.getUserPermissions(this.supervisorId).subscribe({
      next: (response: GetUserPermissionsResponse) => {
        this.assignedPermissions = response.data.permissions;
      },
      error: (error: any) => {
        console.error('Error loading user permissions:', error);
        this.assignedPermissions = [];
      }
    });

    this.supervisorService.getAllPermissions().subscribe({
      next: (response: GetAllPermissionsResponse) => {
        // Filter for assignable permissions only (exclude PERSONAL level)
        this.availablePermissions = response.data.permissions.filter(p => 
          p.isAssignable && p.level !== 'PERSONAL' && p.isActive
        );
        this.isLoadingPermissions = false;
      },
      error: (error: any) => {
        console.error('Error loading available permissions:', error);
        this.availablePermissions = [];
        this.isLoadingPermissions = false;
      }
    });
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

  // Permission management methods with real API calls
  onRemovePermission(permission: UserPermission): void {
    if (this.isUpdatingPermission) return;
    
    this.isUpdatingPermission = true;
    
    const request: RevokePermissionRequest = {
      userId: this.supervisorId,
      permissionName: permission.name,
      reason: 'Revoked via admin panel'
    };
    
    this.supervisorService.revokePermission(request)
      .pipe(finalize(() => this.isUpdatingPermission = false))
      .subscribe({
        next: (response: RevokePermissionResponse) => {
          // Remove from local array
          const index = this.assignedPermissions.findIndex(p => p.name === permission.name);
          if (index > -1) {
            this.assignedPermissions.splice(index, 1);
          }
          console.log('Permission revoked successfully:', response.data.message);
        },
        error: (error: any) => {
          console.error('Error revoking permission:', error);
          // Show error message to user
          alert('Failed to revoke permission. Please try again.');
        }
      });
  }

  onAssignPermission(permission: AvailablePermission): void {
    if (this.isUpdatingPermission) return;
    
    // Check if already assigned
    const alreadyAssigned = this.assignedPermissions.some(p => p.name === permission.name);
    if (alreadyAssigned) return;
    
    this.isUpdatingPermission = true;
    
    const request: GrantPermissionRequest = {
      userId: this.supervisorId,
      permissionName: permission.name,
      reason: `Grant ${permission.name} permission to supervisor - ${permission.description}`
    };
    
    this.supervisorService.grantPermission(request)
      .pipe(finalize(() => this.isUpdatingPermission = false))
      .subscribe({
        next: (response: GrantPermissionResponse) => {
          // Add to local array
          this.assignedPermissions.push(response.data.permission);
          console.log('Permission granted successfully');
        },
        error: (error: any) => {
          console.error('Error granting permission:', error);
          // Show error message to user
          alert('Failed to grant permission. Please try again.');
        }
      });
  }

  isPermissionAssigned(permissionName: string): boolean {
    return this.assignedPermissions.some(p => p.name === permissionName);
  }

  getUnassignedPermissions(): AvailablePermission[] {
    return this.availablePermissions.filter(p => !this.isPermissionAssigned(p.name));
  }

  // Modal management methods
  openGrantModal(): void {
    this.showGrantModal = true;
    this.selectedPermission = '';
    this.grantReason = '';
    this.grantExpiry = '';
  }

  closeGrantModal(): void {
    this.showGrantModal = false;
    this.selectedPermission = '';
    this.grantReason = '';
    this.grantExpiry = '';
  }

  openRevokeModal(): void {
    this.showRevokeModal = true;
    this.selectedRevokePermission = '';
    this.revokeReason = '';
  }

  closeRevokeModal(): void {
    this.showRevokeModal = false;
    this.selectedRevokePermission = '';
    this.revokeReason = '';
  }

  // Quick action methods
  quickAssignPermission(permission: AvailablePermission): void {
    console.log('quickAssignPermission called with:', permission);
    this.selectedPermission = permission.name;
    this.grantReason = `Quick assign: ${permission.description}`;
    this.grantExpiry = '';
    console.log('Setting showGrantModal to true');
    this.showGrantModal = true;
    console.log('showGrantModal is now:', this.showGrantModal);
  }

  quickRevokePermission(permission: UserPermission): void {
    this.selectedRevokePermission = permission.name;
    this.revokeReason = 'Quick revoke via permission chip';
    this.confirmRevokePermission();
  }

  // Confirmation methods
  confirmGrantPermission(): void {
    if (!this.selectedPermission || this.isUpdatingPermission) return;

    this.isUpdatingPermission = true;

    const request: GrantPermissionRequest = {
      userId: this.supervisorId,
      permissionName: this.selectedPermission,
      reason: this.grantReason || `Grant ${this.selectedPermission} permission to supervisor`,
      expiresAt: this.grantExpiry || undefined
    };

    this.supervisorService.grantPermission(request)
      .pipe(finalize(() => this.isUpdatingPermission = false))
      .subscribe({
        next: (response: GrantPermissionResponse) => {
          this.assignedPermissions.push(response.data.permission);
          this.showNotification('success', `Permission "${this.selectedPermission}" granted successfully!`, 'fa-check-circle');
          this.closeGrantModal();
        },
        error: (error: any) => {
          console.error('Error granting permission:', error);
          this.showNotification('error', 'Failed to grant permission. Please try again.', 'fa-exclamation-circle');
        }
      });
  }

  confirmRevokePermission(): void {
    if (!this.selectedRevokePermission || this.isUpdatingPermission) return;

    this.isUpdatingPermission = true;

    const request: RevokePermissionRequest = {
      userId: this.supervisorId,
      permissionName: this.selectedRevokePermission,
      reason: this.revokeReason || 'Revoked via admin panel'
    };

    this.supervisorService.revokePermission(request)
      .pipe(finalize(() => this.isUpdatingPermission = false))
      .subscribe({
        next: (response: RevokePermissionResponse) => {
          const index = this.assignedPermissions.findIndex(p => p.name === this.selectedRevokePermission);
          if (index > -1) {
            this.assignedPermissions.splice(index, 1);
          }
          this.showNotification('success', `Permission "${this.selectedRevokePermission}" revoked successfully!`, 'fa-check-circle');
          this.closeRevokeModal();
        },
        error: (error: any) => {
          console.error('Error revoking permission:', error);
          this.showNotification('error', 'Failed to revoke permission. Please try again.', 'fa-exclamation-circle');
        }
      });
  }

  // Helper methods
  getSelectedPermissionDetails(): AvailablePermission | undefined {
    return this.availablePermissions.find(p => p.name === this.selectedPermission);
  }

  getSelectedRevokePermissionDetails(): UserPermission | undefined {
    return this.assignedPermissions.find(p => p.name === this.selectedRevokePermission);
  }

  getMinExpiryDate(): string {
    const now = new Date();
    now.setHours(now.getHours() + 1); // Minimum 1 hour from now
    return now.toISOString().slice(0, 16);
  }

  // Notification system
  showNotification(type: 'success' | 'error' | 'warning', message: string, icon: string): void {
    this.notification = { type, message, icon };
    
    // Auto-clear after 5 seconds
    setTimeout(() => {
      this.clearNotification();
    }, 5000);
  }

  clearNotification(): void {
    this.notification = null;
  }
}
