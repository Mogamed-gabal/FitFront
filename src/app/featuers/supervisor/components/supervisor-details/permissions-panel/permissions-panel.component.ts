import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SupervisorService, Permission, UserPermission } from '../../../../../core/services/supervisor.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-permissions-panel',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './permissions-panel.component.html',
  styleUrl: './permissions-panel.component.scss'
})
export class PermissionsPanelComponent implements OnInit, OnDestroy {
  @Input() userId: string = '';

  allPermissions: Permission[] = [];
  userPermissions: UserPermission[] = [];
  filteredAllPermissions: Permission[] = [];
  filteredUserPermissions: UserPermission[] = [];

  isLoading = false;
  searchTerm = '';
  selectedCategory = '';

  categories: string[] = [];

  searchForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private supervisorService: SupervisorService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search: [''],
      category: ['']
    });
  }

  ngOnInit(): void {
    if (!this.userId) return;

    this.loadPermissions();
    this.setupSearchListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchListeners(): void {
    this.searchForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchTerm = value.toLowerCase();
        this.filterPermissions();
      });

    this.searchForm.get('category')?.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.selectedCategory = value;
        this.filterPermissions();
      });
  }

  private loadPermissions(): void {
    this.isLoading = true;

    this.supervisorService.getAllPermissions().subscribe({
      next: (response) => {
        this.allPermissions = response.data.permissions;
        this.extractCategories();
        this.loadUserPermissions();
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.isLoading = false;
      }
    });
  }

  private loadUserPermissions(): void {
    this.supervisorService.getUserPermissions(this.userId).subscribe({
      next: (response) => {
        this.userPermissions = response.data.permissions;
        this.filterPermissions();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user permissions:', error);
        this.isLoading = false;
      }
    });
  }

  private extractCategories(): void {
    this.categories = [...new Set(this.allPermissions.map(p => p.category))];
  }

  private filterPermissions(): void {
    this.filteredAllPermissions = this.allPermissions.filter(permission => {
      const matchesSearch = !this.searchTerm || 
        permission.name.toLowerCase().includes(this.searchTerm) ||
        permission.description.toLowerCase().includes(this.searchTerm);
      
      const matchesCategory = !this.selectedCategory || permission.category === this.selectedCategory;
      
      const notAssigned = !this.userPermissions.some(up => up.name === permission.name);

      return matchesSearch && matchesCategory && notAssigned;
    });

    this.filteredUserPermissions = this.userPermissions.filter(permission => {
      const matchesSearch = !this.searchTerm || 
        permission.name.toLowerCase().includes(this.searchTerm);
      
      const matchesCategory = !this.selectedCategory || 
        this.allPermissions.find(p => p.name === permission.name)?.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  grantPermission(permission: Permission): void {
    this.supervisorService.grantPermission(this.userId, permission.name).subscribe({
      next: (response) => {
        console.log('Permission granted:', response.message);
        this.loadUserPermissions();
      },
      error: (error) => {
        console.error('Error granting permission:', error);
      }
    });
  }

  revokePermission(permission: UserPermission): void {
    if (!confirm(`Are you sure you want to revoke the "${permission.name}" permission?`)) {
      return;
    }

    this.supervisorService.revokePermission(this.userId, permission.name).subscribe({
      next: (response) => {
        console.log('Permission revoked:', response.message);
        this.loadUserPermissions();
      },
      error: (error) => {
        console.error('Error revoking permission:', error);
      }
    });
  }

  isPermissionAssigned(permissionName: string): boolean {
    return this.userPermissions.some(p => p.name === permissionName);
  }

  getPermissionDetails(permissionName: string): Permission | undefined {
    return this.allPermissions.find(p => p.name === permissionName);
  }
}
