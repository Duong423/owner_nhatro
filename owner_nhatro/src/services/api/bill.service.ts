// Bill API service
import { axiosInstance } from './axios.config';
import type { Bill, CreateBillDto, PaymentDto } from '@/types/bill.types';

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
};
