import { axiosInstance } from './axios.config';
import type { Contract, CreateContractDto, UpdateContractDto } from '@/types';

export const contractService = {
    /**
     * Get all contracts for owner
     * GET /api/contracts/owner/all
     */
    getOwnerContracts: async (): Promise<Contract[]> => {
        const response: any = await axiosInstance.get('/contracts/owner/all');
        return response.result || [];
    },

    /**
     * Get detail contract by ID
     * GET /api/contracts/{id}
     */
    getContractById: async (contractId: number): Promise<Contract> => {
        const response: any = await axiosInstance.get(`/contracts/${contractId}`);
        return response.result || response;
    },

    /**
     * Create new contract
     * POST /api/contracts
     */
    createContract: async (data: CreateContractDto): Promise<Contract> => {
        const response: any = await axiosInstance.post('/contracts/create', data);
        return response.result || response;
    },

    /**
     * Update contract
     * PUT /api/contracts/{id}/update
     */
    updateContract: async (contractId: number, data: UpdateContractDto): Promise<Contract> => {
        const response: any = await axiosInstance.put(`/contracts/${contractId}/update`, data);
        return response.result || response;
    },

    /**
     * Sign contract
     * PUT /api/contracts/{id}/sign
     */
    signContract: async (contractId: number): Promise<Contract> => {
        const response: any = await axiosInstance.put(`/contracts/${contractId}/sign`);
        return response.result || response;
    },

    /**
     * Terminate contract
     * PUT /api/contracts/{id}/terminate
     */
    terminateContract: async (contractId: number, reason?: string): Promise<Contract> => {
        const response: any = await axiosInstance.put(`/contracts/${contractId}/terminate`, { reason });
        return response.result || response;
    },

    /**
     * Get contract by booking ID
     * GET /api/contracts/booking/{bookingId}
     */
    getContractByBookingId: async (bookingId: number): Promise<Contract | null> => {
        try {
            const response: any = await axiosInstance.get(`/contracts/booking/${bookingId}`);
            const contract = response.result || response;
            
            // Check if contract exists and has contractId
            if (contract && contract.contractId) {
                return contract;
            }
            
            return null;
        } catch (error: any) {
            // Return null for 404 or any error
            console.log('No contract found for booking:', bookingId);
            return null;
        }
    }
};
