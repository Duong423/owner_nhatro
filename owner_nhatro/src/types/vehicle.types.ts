// Vehicle related types

export interface Vehicle {
  vehicleId: number;
  contractId?: number;
  nameTenant?: string;
  phoneNumberTenant?: string;
  roomCode?: string;
  licensePlates: string; // comma-separated
  status?: string; // 'ACTIVE', 'INACTIVE', 'DELETED'
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVehicleDto {
  contractId?: number;
  roomCode: string;
  licensePlates: string; // comma-separated
}
