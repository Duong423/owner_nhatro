
// Hostel types
export interface Hostel {
  hostelId: number;
  ownerId: number;
  ownerName: string;
  name: string;
  address: string;
  price: number;
  area: number;
  
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
