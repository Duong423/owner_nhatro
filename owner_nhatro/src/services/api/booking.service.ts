import { axiosInstance } from './axios.config';
import type { Booking, UpdateStatusBookingResDto } from '@/types';


export const bookingService = {
    /**
     * Get all bookings for owner
     * GET /api/bookings/owner/all
     */
    getOwnerBookings: async (): Promise<Booking[]> => {
        const response: any = await axiosInstance.get('/bookings/owner/all');
        return response.result || [];
    },

    /**
     * Get booking by ID
     * GET /api/bookings/{id}
     */
    getBookingById: async (bookingId: number): Promise<Booking> => {
        const response: any = await axiosInstance.get(`/bookings/${bookingId}`);
        return response.result || response;
    },

    updateStatusBooking: async (bookingId: number, status: string): Promise<UpdateStatusBookingResDto> => {
        const response: any = await axiosInstance.put(
            `/bookings/confirm-booking/${bookingId}`,
            { status }
        );
        return response.result;
    },

    /**
     * Search bookings by phone number
     * GET /api/bookings/owner/search?phone={phone}
     */
    searchBookingsByPhone: async (phone: string): Promise<Booking[]> => {
        const response: any = await axiosInstance.get(`/bookings/owner/search`, {
            params: { phone }
        });
        return response.result || [];
    }
};
