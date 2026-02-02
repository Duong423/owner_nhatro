// Bill related types based on actual API response

export interface Bill {
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
  
  status: 'PAID' | 'UNPAID' | 'PENDING' | 'OVERDUE';
  dueDate: string;
  paymentDate: string | null;
  note: string | null;
  paymentMethod: string | null; // 'CASH', 'ZALO_PAY', 'MOMO', 'BANK_TRANSFER'
  transactionCode: string | null;
  
  tenantId: number;
  tenantName: string;
  tenantPhone: string;
  
  ownerId: number;
  ownerName: string;
  ownerPhone: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillDto {
  roomCode: string;
  billingMonth: string | number;
  billingYear: string | number;
  electricityCost?: number;
  waterCost?: number;
  serviceCost?: number;
  note?: string;
}

export interface PaymentDto {
  paymentMethod: string;
  note?: string;
}

export interface UpdateBillDto {
  electricityCost?: number;
  waterCost?: number;
  serviceCost?: number;
  note?: string;
}
