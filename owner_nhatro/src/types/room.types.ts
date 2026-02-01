
// Hostel types
export interface Hostel {
  hostelId: number;
  ownerId: number;
  ownerName: string;
  name: string;
  roomCode?: string;
  hostelRoomCode?: string;
  address: string;
  price: number;
  area: number;
  depositAmount?: number;
  status?: string; // 'available', 'occupied', 'full', 'maintenance'
  
  contactName: string;
  contactPhone: string;
  contactEmail: string;

  imageUrls: string[];
  description: string;
  amenities: string;
  createdAt: string;
}
export interface HostelDetail extends Hostel {
}
