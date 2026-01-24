// Room API service
import { axiosInstance } from './axios.config';
import type { Room, CreateRoomDto, UpdateRoomDto, ApiResponse, PaginatedResponse, PaginationParams, Hostel, HostelDetail } from '@/types';

export const roomService = {

  // Get owner's hostels
  getMyHostels: async (): Promise<Hostel[]> => {
    const response: any = await axiosInstance.get('/hostels/owner/my-hostels');
    return response?.result || [];
  },

  // Get hostel detail
  getHostelDetail: async (hostelId: number): Promise<HostelDetail> => {
    const response: any = await axiosInstance.get(`/hostels/tenant/detailsHostel/${hostelId}`);
    return response?.result;
  },
};
