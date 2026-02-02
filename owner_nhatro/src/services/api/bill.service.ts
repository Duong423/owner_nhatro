// Bill API service
import { axiosInstance } from './axios.config';
import type { Bill, CreateBillDto, PaymentDto, UpdateBillDto } from '@/types/bill.types';

export const billService = {
  /**
   * Get bills by room code
   * GET /api/bills/room/{roomCode}
   */
  getBillsByRoom: async (roomCode: string): Promise<Bill[]> => {
    const response: any = await axiosInstance.get(`/bills/room/${roomCode}`);
    return response?.result || [];
  },

  /**
   * Create new bill
   * POST /api/bills
   */
  createBill: async (dto: CreateBillDto): Promise<Bill> => {
    const response: any = await axiosInstance.post('/bills', dto);
    return response?.result || response;
  },

  /**
   * Confirm payment for bill
   * POST /api/bills/{billId}/confirm-payment
   */
  confirmPayment: async (billId: number, dto: PaymentDto): Promise<Bill> => {
    const response: any = await axiosInstance.post(`/bills/${billId}/confirm-payment`, dto);
    return response?.result || response;
  },

  /**
   * Update bill
   * PUT /api/bills/{billId}
   */
  updateBill: async (billId: number, dto: UpdateBillDto): Promise<Bill> => {
    const response: any = await axiosInstance.put(`/bills/${billId}`, dto);
    return response?.result || response;
  },

  /**
   * Print bill
   * GET /api/bills/{billId}/print
   */
  printBill: async (billId: number): Promise<Blob> => {
    // Use axios directly to bypass the response interceptor for blob responses
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${axiosInstance.defaults.baseURL}/bills/${billId}/print`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to print bill');
    }
    
    return await response.blob();
  },
};
