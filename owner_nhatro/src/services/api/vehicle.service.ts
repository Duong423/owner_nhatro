import { axiosInstance } from './axios.config';
import type { Vehicle, CreateVehicleDto } from '@/types/vehicle.types';

export const vehicleService = {
  // Create new vehicle
  createVehicle: async (data: CreateVehicleDto): Promise<Vehicle> => {
    const response: any = await axiosInstance.post('/vehicles', data);
    return response.result || response;
  },

  // Get vehicle(s) by room id or room code (accepts numeric id or string code like '004')
  getVehicleByRoomId: async (roomId: string | number): Promise<Vehicle | null> => {
    try {
      const response: any = await axiosInstance.get(`/vehicles/room/${roomId}`);
      const result = response.result || response;
      return result || null;
    } catch (err: any) {
      console.log('No vehicle found for room:', roomId);
      return null;
    }
  },

  // Get all vehicles for owner
  getOwnerVehicles: async (): Promise<Vehicle[]> => {
    const response: any = await axiosInstance.get('/vehicles');
    return response.result || [];
  },

  // Update vehicle
  updateVehicle: async (vehicleId: number, data: any): Promise<Vehicle> => {
    const response: any = await axiosInstance.put(`/vehicles/${vehicleId}`, data);
    return response.result || response;
  }
};
