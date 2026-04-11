import { Client } from '../../../core/models/user/client';

/** Row shape expected by client-table / modal (id + display status labels). */
export interface ClientTableRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
}

/** Function to map a Client to ClientTableRow */
export function mapClientToRow(client: Client): ClientTableRow {
  return {
    id: client._id,
    name: client.name,
    email: client.email,
    role: client.role,
    status: mapStatusLabel(client.status),
    createdAt: client.createdAt,
  };
}

/** Function to map status to display label */
export function mapStatusLabel(status: Client['status']): string {
  switch (status) {
    case 'approved':
      return 'Active';
    case 'pending':
      return 'Pending';
    case 'rejected':
      return 'Inactive';
    default:
      return String(status);
  }
}
