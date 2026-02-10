// Room API service
import { axiosInstance } from './axios.config';
import type {Hostel, HostelDetail } from '@/types';

interface HostelsStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  hostels: Hostel[];
}

export const roomService = {

  // Get owner's hostels
  getMyHostels: async (): Promise<Hostel[]> => {
    const response: any = await axiosInstance.get('/hostels/owner/my-hostels');
    const hostels = response?.result?.hostels;
    return Array.isArray(hostels) ? hostels : [];
  },

  // Get owner's hostels with statistics
  getMyHostelsWithStats: async (): Promise<HostelsStats> => {
    const response: any = await axiosInstance.get('/hostels/owner/my-hostels');
    return {
      totalRooms: response?.result?.totalRooms || 0,
      availableRooms: response?.result?.availableRooms || 0,
      occupiedRooms: response?.result?.occupiedRooms || 0,
      hostels: Array.isArray(response?.result?.hostels) ? response.result.hostels : [],
    };
  },

  // Get hostel detail
  getHostelDetail: async (hostelId: number): Promise<HostelDetail> => {
    const response: any = await axiosInstance.get(`/hostels/tenant/detailsHostel/${hostelId}`);
    return response?.result;
  },

  // Delete hostel
  deleteHostel: async (hostelId: number): Promise<any> => {
    return axiosInstance.delete(`/hostels/${hostelId}`);
  },

  // Create hostel with images
  createHostel: async (formData: FormData): Promise<any> => {
    return axiosInstance.post('/hostels/create-with-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update hostel images
  updateHostelImages: async (hostelId: number, formData: FormData): Promise<any> => {
    return axiosInstance.put(`/hostels/${hostelId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update hostel info
  updateHostel: async (hostelId: number, data: any): Promise<any> => {
    return axiosInstance.put(`/hostels/${hostelId}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};
