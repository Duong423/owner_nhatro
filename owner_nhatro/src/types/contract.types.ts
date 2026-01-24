// Contract related types

export interface Contract {
  id: string;
  roomId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  deposit: number;
  status: 'active' | 'expired' | 'terminated';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContractDto {
  roomId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  deposit: number;
  notes?: string;
}

export interface UpdateContractDto extends Partial<CreateContractDto> {
  status?: 'active' | 'expired' | 'terminated';
}
