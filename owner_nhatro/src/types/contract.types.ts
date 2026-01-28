// Contract related types

export interface Contract {
  contractId: number;
  bookingId: number;
  
  // Thông tin bên A (chủ nhà)
  landlordId: number;
  landlordName: string;
  landlordPhone: string;
  
  // Thông tin bên B (người thuê)
  tenantId: number;
  tenantName: string;
  tenantPhone: string;
  tenantEmail?: string;
  
  // Thông tin phòng trọ
  hostelId: number;
  hostelName: string;
  hostelAddress: string;
  
  // Thông tin tài chính
  monthlyRent: number;
  depositAmount: number;
  electricityCostPerUnit: number;
  waterCostPerUnit: number;
  serviceFee?: number;
  
  // Thời hạn hợp đồng
  startDate: string;
  endDate: string;
  
  // Điều khoản thanh toán
  paymentCycle: string;
  numberOfTenants: number;
  
  // Điều khoản khác
  terms?: string;
  notes?: string;
  
  // Trạng thái
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'PENDING';
  signedDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateContractDto {
  bookingId: number;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  electricityCostPerUnit: number;
  waterCostPerUnit: number;
  serviceFee: number;
  paymentCycle: string;
  numberOfTenants: number;
  terms?: string;
  notes?: string;
}

export interface UpdateContractDto {
  status?: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  endDate?: string;
  monthlyRent?: number;
  electricityPrice?: number;
  waterPrice?: number;
  serviceCharge?: number;
  internetFee?: number;
  parkingFee?: number;
  paymentDueDate?: number;
  terms?: string;
  notes?: string;
}
