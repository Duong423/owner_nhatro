// Bill API service
import { axiosInstance } from './axios.config';
import type { Bill, CreateBillDto, PaymentDto, UpdateBillDto } from '@/types/bill.types';
import type { PaymentHistory } from '@/types/payment.types';

export const billService = {
  /**
   * Get all bills for owner
   * GET /api/bills/owner
   */
  getOwnerBills: async (): Promise<Bill[]> => {
    const response: any = await axiosInstance.get('/bills/owner');
    return response?.result || [];
  },

  /**
   * Get payment history for owner
   * GET /api/bills/payment-history/owner
   */
  getPaymentHistory: async (): Promise<PaymentHistory[]> => {
    const response: any = await axiosInstance.get('/bills/payment-history/owner');
    const result = response?.result;
    return Array.isArray(result) ? result : [];
  },

  /**
   * Get payment history by month/year
   * GET /api/bills/payment-history/monthly?month={month}&year={year}
   */
  getPaymentHistoryByMonth: async (month: number, year: number): Promise<PaymentHistory[]> => {
    const response: any = await axiosInstance.get('/bills/payment-history/monthly', {
      params: { month, year },
    });
    const result = response?.result;
    return Array.isArray(result) ? result : [];
  },

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
