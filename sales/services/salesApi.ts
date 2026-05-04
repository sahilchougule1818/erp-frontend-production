import apiClient from '../../shared/services/apiClient';
import { PaginatedResponse } from '../../shared/types';
import type {
  BankAccount, Booking, BookingPayment, LedgerEntry, WithdrawEntry,
  Refund, RefundPayment, RefundDetail, InventoryItem, Supplier,
  DashboardStats, UpcomingDelivery, Customer
} from '../types';

export type { BankAccount, Booking, BookingPayment, LedgerEntry, WithdrawEntry, Refund, RefundDetail, Customer };

export const customersApi = {
  getAll: (params?: { page?: number }) => apiClient.get<Customer[]>('/sales/customers', { params }),
  getById: (customerId: string) => apiClient.get<Customer>(`/sales/customers/${customerId}`),
  create: (data: { name: string; phone_number?: string; address?: string }) =>
    apiClient.post<Customer>('/sales/customers', data),
  update: (customerId: string, data: Partial<Customer>) =>
    apiClient.put<Customer>(`/sales/customers/${customerId}`, data),
  delete: (customerId: string) => apiClient.delete(`/sales/customers/${customerId}`),
};

export const bankAccountsApi = {
  getAll: (params?: { all?: boolean }) => apiClient.get<BankAccount[]>('/sales/bank-accounts', { params }),
  getById: (id: number) => apiClient.get<BankAccount>(`/sales/bank-accounts/${id}`),
  create: (data: Omit<BankAccount, 'id' | 'created_at' | 'current_balance' | 'total_credits' | 'total_debits'>) =>
    apiClient.post<BankAccount>('/sales/bank-accounts', data),
  update: (id: number, data: Partial<BankAccount>) => apiClient.put<BankAccount>(`/sales/bank-accounts/${id}`, data),
  delete: (id: number) => apiClient.delete(`/sales/bank-accounts/${id}`),
};

export const customerBookingsApi = {
  getAll: async (params?: { page?: number }) => {
    // Fetch both instant-sales and pre-bookings
    const [instantSalesRes, preBookingsRes] = await Promise.all([
      apiClient.get<PaginatedResponse<Booking>>('/sales/instant-sales', { params }),
      apiClient.get<PaginatedResponse<Booking>>('/sales/pre-bookings', { params })
    ]);
    
    // Merge the data arrays
    const mergedData = [...instantSalesRes.data, ...preBookingsRes.data];
    
    // Return paginated response with merged data
    return {
      data: mergedData,
      pagination: {
        total: instantSalesRes.pagination.total + preBookingsRes.pagination.total,
        page: params?.page || 1,
        limit: instantSalesRes.pagination.limit,
        totalPages: Math.ceil((instantSalesRes.pagination.total + preBookingsRes.pagination.total) / instantSalesRes.pagination.limit),
        hasNext: instantSalesRes.pagination.hasNext || preBookingsRes.pagination.hasNext,
        hasPrev: instantSalesRes.pagination.hasPrev || preBookingsRes.pagination.hasPrev
      }
    };
  },
  getById: (orderId: string) => {
    // Try instant-sales first, fallback to pre-bookings
    return apiClient.get<Booking>(`/sales/instant-sales/${orderId}`)
      .catch(() => apiClient.get<Booking>(`/sales/pre-bookings/${orderId}`));
  },
  create: (data: any) => {
    const isInstantSell = Boolean(data.is_instant_sell);
    return isInstantSell
      ? apiClient.post<Booking>('/sales/instant-sales', data)
      : apiClient.post<Booking>('/sales/pre-bookings', data);
  },
  update: (orderId: string, data: any) => 
    apiClient.put<Booking>(`/sales/pre-bookings/${orderId}`, data),
  updateInstantSale: (orderId: string, data: any) =>
    apiClient.put<Booking>(`/sales/instant-sales/${orderId}`, data),
  updateStatus: (orderId: string, data: { delivery_status?: string }) =>
    apiClient.put<Booking>(`/sales/pre-bookings/${orderId}/status`, data),
  cancel: (orderId: string, data: { cancellation_reason?: string }, isInstantSale: boolean) => {
    return isInstantSale
      ? apiClient.post<Booking>(`/sales/instant-sales/${orderId}/cancel`, data)
      : apiClient.put<Booking>(`/sales/pre-bookings/${orderId}/cancel`, data);
  },
  delete: (orderId: string, isInstantSale: boolean) => {
    return isInstantSale
      ? apiClient.delete(`/sales/instant-sales/${orderId}`)
      : apiClient.delete(`/sales/pre-bookings/${orderId}`);
  },
};

// Payments — scoped per booking, identified by transaction_number
export const bookingPaymentsApi = {
  getByBooking: (orderId: string) => {
    return apiClient.get<BookingPayment[]>(`/sales/customer-payments/order/${orderId}`);
  },
  create: (data: { order_id: string; amount: number; payment_type?: string; payment_method: string; bank_account_id?: number | null; payment_reference?: string; notes?: string; payment_date?: string }) =>
    apiClient.post<BookingPayment>('/sales/customer-payments', data),
  delete: (transactionNumber: string) => apiClient.delete(`/sales/customer-payments/${transactionNumber}`, {
    data: { deleted_by: 'system', reason: 'Payment undone' }
  }),
};

export const inventoryPurchasesApi = {
  getAll: () => apiClient.get<WithdrawEntry[]>('/sales/inventory-purchases'),
  getInventoryItems: () => apiClient.get<InventoryItem[]>('/sales/inventory-purchases/inventory-items'),
  getSuppliers: () => apiClient.get<Supplier[]>('/sales/inventory-purchases/suppliers'),
  create: (data: any) => apiClient.post<WithdrawEntry>('/sales/inventory-purchases', data),
  update: (id: string, data: any) => apiClient.put<WithdrawEntry>(`/sales/inventory-purchases/${id}`, data),
  delete: (id: string) => apiClient.delete(`/sales/inventory-purchases/${id}`),
};

export const inventoryPaymentsApi = {
  getAll: (params?: { page?: number }) => apiClient.get<any[]>('/sales/stock/inventory-payments', { params }),
  getById: (id: number) => apiClient.get<any>(`/sales/stock/inventory-payments/${id}`),
  create: (data: any) => apiClient.post<any>('/sales/inventory-purchases', data),
};

export const stockApi = {
  getIndoorStock: (params?: { phase?: string }) => apiClient.get<any[]>('/sales/dashboard/indoor-stock', { params }),
  getOutdoorStock: () => apiClient.get<any[]>('/sales/dashboard/outdoor-stock'),
};

export const ledgerApi = {
  getLedgerEntries: (params: {
    bank_account_id?: string;
    cash_only?: boolean;
    type?: 'credit' | 'debit';
    from_date?: string;
    to_date?: string;
    search?: string;
  }) => apiClient.get<LedgerEntry[]>('/sales/ledger', { params }),
  getBankSummary: () => apiClient.get<BankAccount[]>('/sales/ledger/bank-summary'),
};

export const refundDisbursementsApi = {
  getAll: (params?: { status?: string; page?: number }) => apiClient.get<Refund[]>('/sales/refund-disbursements', { params }),
  getById: (refundId: string) => apiClient.get<RefundDetail>(`/sales/refund-disbursements/${refundId}`),
  createTerm: (refundId: string, data: {
    amount: number; payment_date?: string; payment_method: string;
    bank_account_id?: number | null; payment_reference?: string; notes?: string;
  }) => apiClient.post<RefundDetail>(`/sales/refund-disbursements/${refundId}/terms`, data),
  deleteTerm: (refundId: string, termNumber: number) =>
    apiClient.delete(`/sales/refund-disbursements/${refundId}/terms/${termNumber}`),
};

export const dashboardApi = {
  getStats: () => apiClient.get<DashboardStats>('/sales/dashboard/stats'),
  getPreBookingStats: () => apiClient.get<{ pending_deliveries: number; outstanding_amount: number }>('/sales/dashboard/prebooking-stats'),
  getInstantSaleStats: () => apiClient.get<{ total_sales: number; outstanding_amount: number }>('/sales/dashboard/instantsale-stats'),
};

export const notificationsApi = {
  getUpcomingDeliveries: () => apiClient.get<UpcomingDelivery[]>('/sales/notifications/upcoming-deliveries'),
};

export const salesApi = {
  dashboard: dashboardApi,
};

export const billingApi = {
  downloadBill: async (orderId: string) => {
    try {
      const blob = await apiClient.get(`/sales/billing/orders/${orderId}/bill`, {
        responseType: 'blob'
      }) as unknown as Blob;
      
      if (!(blob instanceof Blob)) {
        throw new Error('Invalid response format');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Download bill error:', error);
      throw new Error(error?.message || 'Failed to download invoice');
    }
  },
};
