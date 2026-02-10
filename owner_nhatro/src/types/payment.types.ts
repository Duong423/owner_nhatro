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

export interface PaymentHistory {
  paymentHistoryId: number;
  billId: number;
  contractId: number;
  roomCode: string;
  billingMonth: number;
  billingYear: number;

  roomPrice: number;
  electricityCost: number;
  waterCost: number;
  serviceCost: number;
  totalAmount: number;

  paymentMethod: string | null;
  transactionCode: string | null;
  paymentDate: string | null;
  dueDate: string | null;

  tenantId: number;
  tenantName: string;
  tenantPhone: string;

  ownerId: number;
  ownerName: string;
  ownerPhone: string;

  note: string | null;
  createdAt: string;
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
