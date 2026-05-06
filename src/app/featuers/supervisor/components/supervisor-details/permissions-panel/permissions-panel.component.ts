import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupervisorService, Permission, UserPermission, AvailablePermission, GrantPermissionRequest, RevokePermissionRequest } from '../../../../../core/services/supervisor.service';
import { Subject, takeUntil } from 'rxjs';
import { PermissionModalComponent } from './permission-modal/permission-modal.component';

@Component({
  selector: 'app-permissions-panel',
  imports: [CommonModule, ReactiveFormsModule, PermissionModalComponent],
  templateUrl: './permissions-panel.component.html',
  styleUrl: './permissions-panel.component.scss'
})
export class PermissionsPanelComponent implements OnInit, OnDestroy {
  @Input() userId: string = '';

  // Data
  allPermissions: AvailablePermission[] = [];
  assignedPermissions: UserPermission[] = [];
  availablePermissions: AvailablePermission[] = [];
  permissionCategories: string[] = [];

  // UI State - Loading and modal states
  isLoading = false;
  showGrantModal = false;
  showDetailsPopup = false;
  showConfirmation = false;

  // Selected Items
  selectedPermission: AvailablePermission | null = null;
  selectedPermissionDetails: AvailablePermission | UserPermission | null = null;
  permissionToRevoke: UserPermission | null = null;

  private destroy$ = new Subject<void>();
  
  // Debug property to force recompilation
  debugVersion = '1.0.0';

  constructor(
    private supervisorService: SupervisorService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get userId from parent route parameters
    if (this.route.parent) {
      this.route.parent.paramMap.subscribe(params => {
        this.userId = params.get('id') || '';
        console.log('PermissionsPanel initialized with userId:', this.userId);
        console.log('Parent route params:', params);
        
        if (!this.userId) {
          console.error('No userId provided to PermissionsPanel');
          return;
        }
        this.loadPermissions();
      });
    } else {
      console.error('No parent route available');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data Loading
  private loadPermissions(): void {
    console.log('Loading permissions for userId:', this.userId);
    this.isLoading = true;

    // Load both assigned and available permissions in parallel
    this.supervisorService.getUserPermissions(this.userId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('User permissions response:', response);
        this.assignedPermissions = response.data.permissions;
        console.log('Assigned permissions loaded:', this.assignedPermissions.length);
        this.loadAllPermissions();
      },
      error: (error) => {
        console.error('Error loading user permissions:', error);
        this.isLoading = false;
      }
    });
  }

  private loadAllPermissions(): void {
    console.log('Loading all available permissions...');
    this.supervisorService.getAllPermissions().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('All permissions response:', response);
        this.allPermissions = response.data.permissions;
        console.log('All permissions loaded:', this.allPermissions.length);
        this.processAvailablePermissions();
        this.extractCategories();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading all permissions:', error);
        this.isLoading = false;
      }
    });
  }

  private processAvailablePermissions(): void {
    // Filter out already assigned permissions
    const assignedPermissionNames = this.assignedPermissions.map(p => p.name);
    this.availablePermissions = this.allPermissions.filter(
      permission => !assignedPermissionNames.includes(permission.name)
    );
  }

  private extractCategories(): void {
    this.permissionCategories = [...new Set(this.allPermissions.map(p => p.category))];
  }

  // Permission Management
  grantPermission(event: Event, permission: AvailablePermission): void {
    event.stopPropagation(); // Prevent card click
    this.selectedPermission = permission;
    this.showGrantModal = true;
  }

  revokePermission(event: Event, permission: UserPermission): void {
    event.stopPropagation(); // Prevent card click
    this.permissionToRevoke = permission;
    this.showConfirmation = true;
  }

  confirmRevoke(): void {
    if (!this.permissionToRevoke) return;

    const request: RevokePermissionRequest = {
      userId: this.userId,
      permissionName: this.permissionToRevoke.name
    };

    this.supervisorService.revokePermission(request).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('Permission revoked:', response.data.message);
        this.removePermissionFromAssigned(this.permissionToRevoke!.name);
        this.closeConfirmation();
      },
      error: (error) => {
        console.error('Error revoking permission:', error);
        this.closeConfirmation();
      }
    });
  }

  cancelRevoke(): void {
    this.closeConfirmation();
  }

  private removePermissionFromAssigned(permissionName: string): void {
    this.assignedPermissions = this.assignedPermissions.filter(p => p.name !== permissionName);
    // Add back to available permissions
    const permission = this.allPermissions.find(p => p.name === permissionName);
    if (permission) {
      this.availablePermissions.push(permission);
      this.availablePermissions.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  // Modal Management
  closeGrantModal(): void {
    this.showGrantModal = false;
    this.selectedPermission = null;
  }

  onPermissionGranted(grantData: {reason: string, expiresAt: string | null}): void {
    if (!this.selectedPermission) return;

    const request: GrantPermissionRequest = {
      userId: this.userId,
      permissionName: this.selectedPermission.name,
      reason: grantData.reason,
      expiresAt: grantData.expiresAt || undefined
    };

    this.supervisorService.grantPermission(request).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        // Add to assigned permissions
        const newPermission: UserPermission = response.data.permission;
        this.assignedPermissions.push(newPermission);
        // Remove from available permissions
        this.availablePermissions = this.availablePermissions.filter(
          p => p.name !== newPermission.name
        );
        this.closeGrantModal();
      },
      error: (error) => {
        console.error('Error granting permission:', error);
        this.closeGrantModal();
      }
    });
  }

  // Permission Details
  showPermissionDetails(permission: AvailablePermission | UserPermission): void {
    this.selectedPermissionDetails = permission;
    this.showDetailsPopup = true;
  }

  closeDetailsPopup(): void {
    this.showDetailsPopup = false;
    this.selectedPermissionDetails = null;
  }

  // Confirmation Management
  closeConfirmation(): void {
    this.showConfirmation = false;
    this.permissionToRevoke = null;
  }

  // Helper Methods
  isPermissionAssigned(permissionName: string): boolean {
    return this.assignedPermissions.some(assigned => assigned.name === permissionName);
  }

  getPermissionsByCategory(category: string): AvailablePermission[] {
    return this.availablePermissions.filter(p => p.category === category);
  }

  getPermissionDetails(permissionName: string): AvailablePermission | undefined {
    return this.allPermissions.find(p => p.name === permissionName);
  }

  // Helper methods for type-safe property access
  hasDescription(permission: AvailablePermission | UserPermission): boolean {
    return 'description' in permission;
  }

  hasCategory(permission: AvailablePermission | UserPermission): boolean {
    return 'category' in permission;
  }

  hasLevel(permission: AvailablePermission | UserPermission): boolean {
    return 'level' in permission;
  }

  hasAssignedAt(permission: AvailablePermission | UserPermission): boolean {
    return 'assignedAt' in permission;
  }

  hasExpiresAt(permission: AvailablePermission | UserPermission): boolean {
    return 'expiresAt' in permission;
  }

  hasReason(permission: AvailablePermission | UserPermission): boolean {
    return 'reason' in permission;
  }
}
