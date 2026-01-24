// Room related types

export interface Room {
  id: string;
  name: string;
  floor: number;
  area: number; // m2
  price: number;
  status: 'available' | 'occupied' | 'maintenance';
  amenities: string[];
  images: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomDto {
  name: string;
  floor: number;
  area: number;
  price: number;
  amenities: string[];
  images?: string[];
  description?: string;
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {
  status?: 'available' | 'occupied' | 'maintenance';
}

// Hostel types
export interface Hostel {
  hostelId: number;
  ownerId: number;
  ownerName: string;
  name: string;
  address: string;
  district: string;
  city: string;
  price: number;
  area: number;
  roomType: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  roomCount: number;
  maxOccupancy: number;
  imageUrls: string[];
  description: string;
  amenities: string;
  elecUnitPrice: number;
  waterUnitPrice: number;
  createdAt: string;
}

export interface HostelService {
  serviceId: number;
  serviceName: string;
  price: number;
  unit: string;
}

export interface HostelDetail extends Hostel {
  services: HostelService[];
}
