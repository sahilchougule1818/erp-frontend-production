import apiClient from '../../../shared/services/apiClient';
import { PreBooking, CreatePreBookingRequest, UpdatePreBookingRequest, DeliverPreBookingRequest, CancelPreBookingRequest } from '../types/preBooking.types';

const BASE_URL = '/sales/pre-bookings';

export const preBookingApi = {
  getAll: async (limit = 50, offset = 0): Promise<PreBooking[]> => {
    return await apiClient.get(`${BASE_URL}?limit=${limit}&offset=${offset}`);
  },

  getById: async (orderId: string): Promise<PreBooking> => {
    return await apiClient.get(`${BASE_URL}/${orderId}`);
  },

  create: async (bookingData: CreatePreBookingRequest): Promise<{ order_id: string; message: string }> => {
    return await apiClient.post(BASE_URL, bookingData);
  },

  update: async (orderId: string, updateData: UpdatePreBookingRequest): Promise<PreBooking> => {
    return await apiClient.put(`${BASE_URL}/${orderId}`, updateData);
  },

  deliver: async (orderId: string, deliveryData: DeliverPreBookingRequest): Promise<PreBooking> => {
    return await apiClient.post(`${BASE_URL}/${orderId}/deliver`, deliveryData);
  },

  undeliver: async (orderId: string): Promise<PreBooking> => {
    return await apiClient.post(`${BASE_URL}/${orderId}/undeliver`, {});
  },

  cancel: async (orderId: string, cancelData: CancelPreBookingRequest): Promise<PreBooking> => {
    return await apiClient.post(`${BASE_URL}/${orderId}/cancel`, cancelData);
  },
};
