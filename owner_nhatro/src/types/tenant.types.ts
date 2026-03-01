// Tenant related types

export interface Tenant {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  idCard: string;
  dateOfBirth: Date;
  address: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantDto {
  fullName: string;
  phone: string;
  email?: string;
  idCard: string;
  dateOfBirth: Date;
  address: string;
  avatarUrl?: string;
}

export interface UpdateTenantDto extends Partial<CreateTenantDto> {}

export interface TenantInfoDTO {
  tenantId: number;
  name: string;
  phone: string;
  email?: string;
  cccd?: string;
  contractId: number;
  hostelName?: string;
  roomCode?: string;
}
