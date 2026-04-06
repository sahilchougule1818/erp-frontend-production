const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('token');

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: { params?: any }): Promise<T> {
    let url = endpoint;
    if (options?.params) {
      const p = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          p.append(key, String(value));
        }
      });
      const queryString = p.toString();
      if (queryString) url += (url.includes('?') ? '&' : '?') + queryString;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// ── Types ─────────────────────────────────────────────────────

export type BankAccount = {
  id: number;
  account_name: string;
  account_number: string;
  bank_name: string;
  branch: string;
  ifsc_code: string;
  is_active: boolean;
  total_credits: number;
  total_debits: number;
  created_at?: string;
  updated_at?: string;
};

export type Booking = {
  id?: number;
  booking_id: string;
  customer_name: string;
  phone_number: string;
  address: string;
  plant_name: string;
  quantity: number;
  total_amount: number;
  amount_paid_at_booking: number;
  paid_amount: number;
  remaining_amount: number;
  booking_date: string;
  expected_delivery_date?: string | null;
  fulfillment_type: 'STOCK_FROM_OUTDOOR' | 'STOCK_FROM_INDOOR';
  batch_code?: string;
  payment_status: 'Paid' | 'Partially Paid' | 'Pending';
  delivery_status: 'Pending' | 'Ready' | 'Delivered' | 'Cancelled';
  notes?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  is_instant_sell?: boolean;
  created_at?: string;
  updated_at?: string;
};

// Payments come from ledger_entries filtered by entry_type
export type BookingPayment = {
  id: number;
  transaction_number: string;
  booking_id: string;
  payment_date: string;
  amount: number;
  payment_method: 'Cash' | 'Card' | 'NEFT' | 'UPI' | 'Cheque';
  bank_account_id?: number | null;
  bank_account_name?: string | null;
  payment_reference?: string;
  notes?: string;
  entry_type: string;
  customer_name?: string;
};

export type LedgerEntry = {
  id: number;
  transaction_number: string;
  entry_date: string;
  entry_type: string;
  particulars: string;
  debit_amount: number;
  credit_amount: number;
  running_balance: number;
  bank_account_id?: number;
  bank_account_name?: string;
  customer_name?: string;
  payment_method?: string;
  payment_reference?: string;
  booking_id?: string;
  purchase_id?: string;
  term_number?: number;
};

export type WithdrawEntry = {
  id?: number;
  purchase_id: string;
  withdraw_date: string;
  amount: number;
  quantity?: number | null;
  bank_account_id: number;
  item_id: number;
  item_name?: string;
  item_unit?: string;
  supplier_id?: number;
  supplier_name?: string;
  payment_method: string;
  transaction_number?: string;
  payment_reference?: string;
  purpose: string;
  notes?: string;
  is_locked?: boolean;
};

export type Refund = {
  refund_id: string;
  booking_id: string;
  customer_name?: string;
  phone_number?: string;
  product_type?: string;
  cancelled_quantity?: number;
  refund_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  total_terms: number;
  refund_reason?: string;
  created_at?: string;
  updated_at?: string;
};

export type RefundPayment = {
  transaction_number: string;
  term_number: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  bank_account_id?: number;
  bank_account_name?: string;
  payment_reference?: string;
  notes?: string;
  created_at?: string;
};

export type RefundDetail = Refund & {
  payments: RefundPayment[];
};

export type InventoryItem = {
  id: number;
  name: string;
  unit: string;
  category: string;
};

export type Supplier = {
  id: number;
  name: string;
  contact?: string;
};

export type DashboardStats = {
  net_inflow: number;
  net_outflow: number;
  net_pending: number;
  total_indoor_bottles: number;
  total_outdoor_plants: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type UpcomingDelivery = {
  booking_id: string;
  customer_id: string;
  customer_name: string;
  plant_name: string;
  quantity: number;
  expected_delivery_date: string;
  fulfillment_type: string;
};

// ── APIs ──────────────────────────────────────────────────────

export type Customer = {
  customer_id: string;
  name: string;
  phone_number: string | null;
  address: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

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
  create: (data: Omit<BankAccount, 'id' | 'created_at' | 'updated_at' | 'current_balance' | 'total_credits' | 'total_debits'>) =>
    apiClient.post<BankAccount>('/sales/bank-accounts', data),
  update: (id: number, data: Partial<BankAccount>) => apiClient.put<BankAccount>(`/sales/bank-accounts/${id}`, data),
  delete: (id: number) => apiClient.delete(`/sales/bank-accounts/${id}`),
};

export const customerBookingsApi = {
  getAll: (params?: { page?: number }) => apiClient.get<Booking[]>('/sales/customer-bookings', { params }),
  getById: (bookingId: string) => apiClient.get<Booking>(`/sales/customer-bookings/${bookingId}`),
  create: (data: any) => apiClient.post<Booking>('/sales/customer-bookings', data),
  update: (bookingId: string, data: any) => apiClient.put<Booking>(`/sales/customer-bookings/${bookingId}`, data),
  updateStatus: (bookingId: string, data: { delivery_status?: string }) =>
    apiClient.put<Booking>(`/sales/customer-bookings/${bookingId}/status`, data),
  cancel: (bookingId: string, data: { cancellation_reason?: string }) =>
    apiClient.put<Booking>(`/sales/customer-bookings/${bookingId}/cancel`, data),
  delete: (bookingId: string) => apiClient.delete(`/sales/customer-bookings/${bookingId}`),
};

// Payments — scoped per booking, identified by transaction_number
export const bookingPaymentsApi = {
  getByBooking: (bookingId: string) =>
    apiClient.get<BookingPayment[]>(`/sales/customer-bookings/${bookingId}/payments`),
  create: (data: { booking_id: string; amount: number; payment_type?: string; payment_method: string; bank_account_id?: number | null; payment_reference?: string; notes?: string; payment_date?: string }) =>
    apiClient.post<BookingPayment>('/sales/customer-payments', data),
  delete: (transactionNumber: string) => apiClient.delete(`/sales/customer-payments/${transactionNumber}`),
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
  getAll: (params?: { page?: number }) => apiClient.get<any[]>('/sales/inventory-payments', { params }),
  getById: (id: number) => apiClient.get<any>(`/sales/inventory-payments/${id}`),
  create: (data: any) => apiClient.post<any>('/sales/inventory-purchases', data),
};

export const stockApi = {
  getIndoorStock: () => apiClient.get<any[]>('/sales/stock/indoor'),
  getOutdoorStock: () => apiClient.get<any[]>('/sales/stock/outdoor'),
  getAvailableIndoorStock: () => apiClient.get<any[]>('/sales/stock/indoor/available'),
  getAvailableOutdoorStock: () => apiClient.get<any[]>('/sales/stock/outdoor/available'),
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
};

export const notificationsApi = {
  getUpcomingDeliveries: () => apiClient.get<UpcomingDelivery[]>('/sales/notifications/upcoming-deliveries'),
};
