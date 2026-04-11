import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blocked-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blocked-filter.component.html',
  styleUrls: ['./blocked-filter.component.scss']
})
export class BlockedFilterComponent {
  @Input() searchTerm: string = '';
  @Input() selectedRole: 'all' | 'client' | 'doctor' = 'all';
  @Output() searchChange = new EventEmitter<string>();
  @Output() roleChange = new EventEmitter<'all' | 'client' | 'doctor'>();

  protected onSearch(searchTerm: string): void {
    this.searchChange.emit(searchTerm);
  }

  protected onRoleChange(role: 'all' | 'client' | 'doctor'): void {
    this.roleChange.emit(role);
  }
}
