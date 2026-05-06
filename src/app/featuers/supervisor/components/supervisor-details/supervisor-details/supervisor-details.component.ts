import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SupervisorService, Supervisor } from '../../../../../core/services/supervisor.service';

@Component({
  selector: 'app-supervisor-details',
  imports: [CommonModule, RouterLink, RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './supervisor-details.component.html',
  styleUrl: './supervisor-details.component.scss'
})
export class SupervisorDetailsComponent implements OnInit {
  supervisorId!: string;
  supervisor: Supervisor | null = null;
  isLoadingSupervisor = false;

  constructor(
    private route: ActivatedRoute,
    private supervisorService: SupervisorService
  ) {}

  ngOnInit(): void {
    this.supervisorId = this.route.snapshot.paramMap.get('id')!;
    this.loadSupervisor();
  }

  loadSupervisor(): void {
    this.isLoadingSupervisor = true;
    this.supervisorService.getSupervisor(this.supervisorId).subscribe({
      next: (response) => {
        this.supervisor = response.data.user;
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
          updatedAt: new Date().toISOString(),
          isActive: true
        };
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
}
