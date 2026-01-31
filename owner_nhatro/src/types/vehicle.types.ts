// Vehicle related types

export interface Vehicle {
  vehicleId: number;
  contractId?: number;
  nameTenant?: string;
  phoneNumberTenant?: string;
  roomCode?: string;
  licensePlates: string; // comma-separated
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVehicleDto {
  contractId?: number;
  roomCode: string;
  licensePlates: string; // comma-separated
}
