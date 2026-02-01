import create from 'zustand';
import { message } from 'antd';
import type { Vehicle, CreateVehicleDto } from '@/types/vehicle.types';
import { vehicleService } from '@/services/api/vehicle.service';

interface VehiclesStore {
  // State
  vehicles: Vehicle[];
  loading: boolean;
  roomId: string;
  
  // Create Modal
  createOpen: boolean;
  createLoading: boolean;
  
  // Edit Modal
  editOpen: boolean;
  editLoading: boolean;
  selectedVehicle: Vehicle | null;
  
  // Actions
  setRoomId: (roomId: string) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  
  // Create Modal Actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  createVehicle: (dto: CreateVehicleDto) => Promise<Vehicle | null>;
  
  // Edit Modal Actions
  openEditModal: (vehicle: Vehicle) => void;
  closeEditModal: () => void;
  updateVehicle: (vehicleId: number, dto: CreateVehicleDto) => Promise<boolean>;
  
  // Fetch Actions
  fetchVehicles: () => Promise<void>;
  fetchByRoom: () => Promise<void>;
}

export const useVehiclesStore = create<VehiclesStore>((set, get) => ({
  // Initial State
  vehicles: [],
  loading: false,
  roomId: '',
  createOpen: false,
  createLoading: false,
  editOpen: false,
  editLoading: false,
  selectedVehicle: null,
  
  // Actions
  setRoomId: (roomId: string) => set({ roomId }),
  setVehicles: (vehicles: Vehicle[]) => set({ vehicles }),
  
  // Create Modal Actions
  openCreateModal: () => set({ createOpen: true }),
  closeCreateModal: () => set({ createOpen: false }),
  
  createVehicle: async (dto: CreateVehicleDto) => {
    try {
      set({ createLoading: true });
      const created = await vehicleService.createVehicle(dto);
      message.success('Tạo phương tiện thành công!');
      set({ createOpen: false });
      
      const { roomId, vehicles } = get();
      
      // Nếu đang hiển thị theo roomId và room code khớp, refresh
      if (roomId && created.roomCode && created.roomCode === String(dto.roomCode)) {
        await get().fetchByRoom();
      } else {
        // nếu không, thêm tạm vào danh sách hiển thị
        set({ vehicles: [created, ...vehicles] });
      }
      
      return created;
    } catch (err: any) {
      if (err.errorFields) {
        message.error('Vui lòng kiểm tra lại thông tin');
      } else {
        message.error(err?.response?.data?.message || 'Tạo phương tiện thất bại');
      }
      return null;
    } finally {
      set({ createLoading: false });
    }
  },
  
  // Edit Modal Actions
  openEditModal: (vehicle: Vehicle) => set({ editOpen: true, selectedVehicle: vehicle }),
  closeEditModal: () => set({ editOpen: false, selectedVehicle: null }),
  
  updateVehicle: async (vehicleId: number, dto: CreateVehicleDto) => {
    try {
      set({ editLoading: true });
      await vehicleService.updateVehicle(vehicleId, dto);
      message.success('Cập nhật phương tiện thành công!');
      set({ editOpen: false, selectedVehicle: null });
      await get().fetchVehicles();
      return true;
    } catch (err: any) {
      if (err.errorFields) {
        message.error('Vui lòng kiểm tra lại thông tin');
      } else {
        message.error(err?.response?.data?.message || 'Cập nhật thất bại');
      }
      return false;
    } finally {
      set({ editLoading: false });
    }
  },
  
  // Fetch Actions
  fetchVehicles: async () => {
    try {
      set({ loading: true });
      const data = await vehicleService.getOwnerVehicles();
      set({ vehicles: data });
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tải danh sách phương tiện');
    } finally {
      set({ loading: false });
    }
  },
  
  fetchByRoom: async () => {
    const { roomId } = get();
    
    if (!roomId || roomId.toString().trim() === '') {
      message.warning('Vui lòng nhập roomId để tìm kiếm');
      return;
    }

    // Validate that input is digits only (allow leading zeros)
    if (!/^\d+$/.test(roomId)) {
      message.warning('roomId phải là một chuỗi số (ví dụ: 004 hoặc 123)');
      return;
    }

    try {
      set({ loading: true });
      // Keep original format (e.g., '004') so backend can match roomCode exactly
      const res = await vehicleService.getVehicleByRoomId(roomId);
      set({ vehicles: res ? [res] : [] });
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi khi tải phương tiện');
    } finally {
      set({ loading: false });
    }
  },
}));
