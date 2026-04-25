export interface DoctorTableRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  status: 'approved' | 'pending' | 'rejected';
  isBlocked: boolean;
  isRecommended: boolean;
}
