import apiClient from '../../../shared/services/apiClient';
import { InstantSale, CreateInstantSaleRequest, UpdateInstantSaleRequest, CancelInstantSaleRequest } from '../types/instantSale.types';

const BASE_URL = '/sales/instant-sales';

export const instantSaleApi = {
  getAll: async (limit = 50, offset = 0): Promise<InstantSale[]> => {
    return await apiClient.get(`${BASE_URL}?limit=${limit}&offset=${offset}`);
  },

  getById: async (orderId: string): Promise<InstantSale> => {
    return await apiClient.get(`${BASE_URL}/${orderId}`);
  },

  create: async (saleData: CreateInstantSaleRequest): Promise<{ order_id: string; message: string }> => {
    return await apiClient.post(BASE_URL, saleData);
  },

  update: async (orderId: string, updateData: UpdateInstantSaleRequest): Promise<InstantSale> => {
    return await apiClient.put(`${BASE_URL}/${orderId}`, updateData);
  },

  cancel: async (orderId: string, cancelData: CancelInstantSaleRequest): Promise<InstantSale> => {
    return await apiClient.post(`${BASE_URL}/${orderId}/cancel`, cancelData);
  },
};
