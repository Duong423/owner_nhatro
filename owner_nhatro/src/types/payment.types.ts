// Payment related types

export interface Payment {
  id: string;
  contractId: string;
  month: string; // Format: YYYY-MM
  amount: number;
  electricityUsage: number; // kWh
  waterUsage: number; // m3
  otherFees?: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDto {
  contractId: string;
  month: string;
  amount: number;
  electricityUsage: number;
  waterUsage: number;
  otherFees?: number;
  notes?: string;
}

export interface UpdatePaymentDto extends Partial<CreatePaymentDto> {
  status?: 'pending' | 'paid' | 'overdue';
  paidDate?: Date;
}
