import create from 'zustand';
import type { Bill } from '@/types/bill.types';
import { billService } from '@/services/api/bill.service';
import { message } from 'antd';

interface BillsStore {
  // State
  bills: Bill[];
  loading: boolean;
  selectedBill: Bill | null;
  
  // Modals state
  billsModalOpen: boolean;
  createModalOpen: boolean;
  paymentModalOpen: boolean;
  editModalOpen: boolean;
  
  // Actions
  fetchBillsByRoom: (roomCode: string) => Promise<void>;
  createBill: (dto: any) => Promise<void>;
  updateBill: (billId: number, dto: any) => Promise<void>;
  confirmPayment: (billId: number, dto: any) => Promise<void>;
  
  // Modal actions
  openBillsModal: () => void;
  closeBillsModal: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (bill: Bill) => void;
  closeEditModal: () => void;
  openPaymentModal: (bill: Bill) => void;
  closePaymentModal: () => void;
  
  // Reset
  reset: () => void;
}

export const useBillsStore = create<BillsStore>((set, get) => ({
  // Initial state
  bills: [],
  loading: false,
  selectedBill: null,
  billsModalOpen: false,
  createModalOpen: false,
  editModalOpen: false,
  paymentModalOpen: false,
  
  // Fetch bills by room
  fetchBillsByRoom: async (roomCode: string) => {
    set({ loading: true });
    try {
      const data = await billService.getBillsByRoom(roomCode);
      set({ bills: data, loading: false });
      
      if (!data || data.length === 0) {
        message.info(`Phòng ${roomCode} chưa có hóa đơn nào`);
      }
    } catch (err: any) {
      console.error('Error fetching bills:', err);
      message.error(err?.response?.data?.message || 'Không thể tải danh sách hóa đơn');
      set({ bills: [], loading: false });
    }
  },
  
  // Create bill
  createBill: async (dto: any) => {
    try {
      await billService.createBill(dto);
      message.success('Tạo hóa đơn thành công!');
      get().closeCreateModal();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Tạo hóa đơn thất bại');
      throw err;
    }
  },
  
  // Update bill
  updateBill: async (billId: number, dto: any) => {
    try {
      await billService.updateBill(billId, dto);
      message.success('Cập nhật hóa đơn thành công!');
      get().closeEditModal();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Cập nhật hóa đơn thất bại');
      throw err;
    }
  },
  
  // Confirm payment
  confirmPayment: async (billId: number, dto: any) => {
    try {
      await billService.confirmPayment(billId, dto);
      message.success('Thanh toán thành công!');
      get().closePaymentModal();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Thanh toán thất bại');
      throw err;
    }
  },
  
  // Modal actions
  openBillsModal: () => set({ billsModalOpen: true }),
  closeBillsModal: () => set({ billsModalOpen: false, bills: [] }),
  
  openCreateModal: () => set({ createModalOpen: true }),
  closeCreateModal: () => set({ createModalOpen: false }),
  
  openEditModal: (bill: Bill) => set({ selectedBill: bill, editModalOpen: true }),
  closeEditModal: () => set({ editModalOpen: false, selectedBill: null }),
  
  openPaymentModal: (bill: Bill) => set({ selectedBill: bill, paymentModalOpen: true }),
  closePaymentModal: () => set({ paymentModalOpen: false, selectedBill: null }),
  
  // Reset all state
  reset: () => set({
    bills: [],
    loading: false,
    selectedBill: null,
    billsModalOpen: false,
    createModalOpen: false,
    editModalOpen: false,
    paymentModalOpen: false,
  }),
}));
