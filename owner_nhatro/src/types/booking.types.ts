// Booking related types - Based on API documentation

export interface PaymentResponseDTO {
  paymentId: number;
  amount: number;
  paymentMethod: string; // 'CASH', 'BANKING', 'MOMO', 'VNPAY'
  status: string; // 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'
  transactionId?: string;
  note?: string;
  paidAt: string; // DateTime
}

export interface Booking {
  bookingId: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  
  hostelId: number;
  hostelName: string;
  roomCode?: string;
  hostelAddress: string;
  
  bookingDate: string; // DateTime
  checkInDate: string; // DateTime
  
  depositAmount: number;
  status: string; // 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
  
  notes?: string;
  
  payment?: PaymentResponseDTO;
  
  createdAt: string; // DateTime
}

export interface UpdateStatusBookingResDto{
    bookingId: number;
    status: string; // 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
}
export interface BookingApiResponse {
  code: number;
  message: string;
  result: Booking[] | Booking | null;
}
