import create from 'zustand';
import type { Contract, CreateContractDto } from '@/types/contract.types';
import type { Booking } from '@/types/booking.types';
import type { HostelDetail } from '@/types/room.types';
import { contractService } from '@/services/api/contract.service';
import { bookingService } from '@/services/api/booking.service';
import { roomService } from '@/services/api/room.service';

type ContractsState = {
  contracts: Contract[];
  loading: boolean;
  error?: string;
  selectedContract: Contract | null;
  detailModalOpen: boolean;
  isCreateMode: boolean;
  selectedBooking: Booking | null;
  hostelDetail: HostelDetail | null;
  createLoading: boolean;
  fetchContracts: () => Promise<void>;
  setSelectedContract: (c: Contract | null) => void;
  setDetailModalOpen: (open: boolean) => void;
  setIsCreateMode: (v: boolean) => void;
  loadBookingData: (id: number) => Promise<{ existingContract: Contract | null; booking?: Booking; hostel?: HostelDetail }>; 
  createContract: (dto: CreateContractDto) => Promise<void>;
  updateContract: (id: number, dto: any) => Promise<void>;
  signContract: (id: number) => Promise<void>;
  terminateContract: (id: number) => Promise<void>;
};

export const useContractsStore = create<ContractsState>((set: any, get: any) => ({
  contracts: [],
  loading: false,
  error: undefined,
  selectedContract: null,
  detailModalOpen: false,
  isCreateMode: false,
  selectedBooking: null,
  hostelDetail: null,
  createLoading: false,

  fetchContracts: async () => {
    try {
      set({ loading: true, error: undefined });
      const data = await contractService.getOwnerContracts();
      set({ contracts: data });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Không thể tải danh sách hợp đồng' });
    } finally {
      set({ loading: false });
    }
  },

  setSelectedContract: (c: Contract | null) => set({ selectedContract: c }),
  setDetailModalOpen: (open: boolean) => set({ detailModalOpen: open }),
  setIsCreateMode: (v: boolean) => set({ isCreateMode: v }),

  loadBookingData: async (id: number) => {
    try {
      set({ createLoading: true });
      const existingContract = await contractService.getContractByBookingId(id);
      const booking = await bookingService.getBookingById(id);
      const hostel = await roomService.getHostelDetail(booking.hostelId);
      set({ selectedBooking: booking, hostelDetail: hostel });
      return { existingContract, booking, hostel };
    } finally {
      set({ createLoading: false });
    }
  },

  createContract: async (dto: CreateContractDto) => {
    try {
      set({ createLoading: true });
      await contractService.createContract(dto);
      await get().fetchContracts();
    } finally {
      set({ createLoading: false });
    }
  },

  updateContract: async (id: number, dto: any) => {
    await contractService.updateContract(id, dto);
    await get().fetchContracts();
  },

  signContract: async (id: number) => {
    await contractService.signContract(id);
    await get().fetchContracts();
  },

  terminateContract: async (id: number) => {
    await contractService.terminateContract(id);
    await get().fetchContracts();
  },
}));

export default useContractsStore;
