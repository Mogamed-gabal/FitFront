import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-request-filter',
  imports: [CommonModule, FormsModule],
  templateUrl: './request-filter.component.html',
  styleUrl: './request-filter.component.scss'
})
export class RequestFilterComponent {
  @Output() filterChange = new EventEmitter<any>();

  filters = {
    search: '',
    specialization: ''
  };

  specializations = [
   'doctor','nutritionist','therapist','coach'
  ];

  onSearchChange(): void {
    this.emitFilters();
  }

  onSpecializationChange(): void {
    this.emitFilters();
  }

  onClearFilters(): void {
    this.filters = {
      search: '',
      specialization: ''
    };
    this.emitFilters();
  }

  private emitFilters(): void {
    this.filterChange.emit(this.filters);
  }
}
