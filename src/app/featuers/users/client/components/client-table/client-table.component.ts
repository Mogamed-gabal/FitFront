import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Client } from '../../../../../core/models/user/client';

import { ClientTableRow } from '../../client.types';

@Component({
  selector: 'app-client-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-table.component.html',
  styleUrl: './client-table.component.scss',
})
export class ClientTableComponent {
  @Input() clients: ClientTableRow[] = [];
  @Output() viewClient = new EventEmitter<ClientTableRow>();
  @Output() blockClient = new EventEmitter<ClientTableRow>();
  @Output() unblockClient = new EventEmitter<ClientTableRow>();
  @Output() deleteClient = new EventEmitter<ClientTableRow>();

  protected onView(client: ClientTableRow): void {
    this.viewClient.emit(client);
  }

  protected onBlockClient(client: ClientTableRow): void {
    this.blockClient.emit(client);
  }

  protected onUnblockClient(client: ClientTableRow): void {
    this.unblockClient.emit(client);
  }

  protected onDeleteClient(client: ClientTableRow): void {
    this.deleteClient.emit(client);
  }
}
