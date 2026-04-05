import { useState, useEffect, useCallback } from 'react';
import {
  bankAccountsApi, customerBookingsApi, bookingPaymentsApi, customersApi,
  inventoryPurchasesApi, inventoryPaymentsApi, ledgerApi, dashboardApi, stockApi, refundDisbursementsApi,
  BankAccount, Booking, BookingPayment, WithdrawEntry, LedgerEntry,
  InventoryItem, Supplier, DashboardStats, Refund, RefundDetail, Customer
} from '../services/salesApi';

// Customers Hook
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchCustomers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await customersApi.getAll({ page });
      if (response.data) {
        setCustomers(Array.isArray(response.data) ? response.data : []);
        const backendPage = response.pagination.currentPage || response.pagination.page || page;
        setPagination({
          ...response.pagination,
          page: backendPage,
          currentPage: backendPage
        });
      } else {
        setCustomers(Array.isArray(response) ? response : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  return {
    customers,
    loading,
    pagination,
    refetch: fetchCustomers,
    createCustomer: customersApi.create,
  };
};

// Bank Account Hooks
export const useBankAccounts = (all = false) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bankAccountsApi.getAll({ all });
      const data = response.data ? response.data : response;
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [all]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  return { accounts, loading, error, refetch: fetchAccounts };
};

// Inventory & Supplier Hooks
export const useInventoryItems = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inventoryPurchasesApi.getInventoryItems()
      .then(data => setItems(data))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
};

export const useWithdrawSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inventoryPurchasesApi.getSuppliers()
      .then(data => setSuppliers(data))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { suppliers, loading, error };
};

// Ledger Hooks
export const useLedger = (params: any) => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchLedger = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await ledgerApi.getLedgerEntries({ ...params, page });
      if (response.data) {
        // Paginated response
        setEntries(Array.isArray(response.data) ? response.data : []);
        const backendPage = response.pagination.currentPage || response.pagination.page || page;
        setPagination({
          ...response.pagination,
          page: backendPage,
          currentPage: backendPage
        });
      } else {
        // Non-paginated response
        setEntries(Array.isArray(response) ? response : []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchLedger(); }, [fetchLedger]);

  return { entries, loading, error, pagination, refetch: fetchLedger };
};

export const useBankSummary = () => {
  const [summary, setSummary] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ledgerApi.getBankSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
};

// Booking Hooks
export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchBookings = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await customerBookingsApi.getAll({ page });
      if (response.data) {
        setBookings(Array.isArray(response.data) ? response.data : []);
        const backendPage = response.pagination.currentPage || response.pagination.page || page;
        setPagination({
          ...response.pagination,
          page: backendPage,
          currentPage: backendPage
        });
      } else {
        setBookings(Array.isArray(response) ? response : []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  return {
    bookings, loading, error, pagination,
    refetch: fetchBookings,
    createBooking: customerBookingsApi.create,
    updateBooking: customerBookingsApi.update,
    updateStatus: customerBookingsApi.updateStatus,
    cancelBooking: customerBookingsApi.cancel,
    deleteBooking: customerBookingsApi.delete,
  };
};

export const useCustomerBookings = useBookings;

// Booking Payments Hook
export const useBookingPayments = (bookingId: string | null | undefined) => {
  const [payments, setPayments] = useState<BookingPayment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!bookingId) { setPayments([]); return; }
    try {
      setLoading(true);
      const data = await bookingPaymentsApi.getByBooking(bookingId);
      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  return {
    payments,
    loading,
    createPayment: bookingPaymentsApi.create,
    deletePayment: bookingPaymentsApi.delete,
    refetch: fetchPayments
  };
};

// Inventory Purchase Hooks
export const useInventoryPurchases = () => {
  const [purchases, setPurchases] = useState<WithdrawEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const data = await inventoryPurchasesApi.getAll();
      setPurchases(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  return { purchases, loading, error, refetch: fetchPurchases };
};

export const useInventoryPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchPayments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await inventoryPaymentsApi.getAll({ page });
      if (response.data) {
        setPayments(Array.isArray(response.data) ? response.data : []);
        const backendPage = response.pagination.currentPage || response.pagination.page || page;
        setPagination({
          ...response.pagination,
          page: backendPage,
          currentPage: backendPage
        });
      } else {
        setPayments(Array.isArray(response) ? response : []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  return { payments, loading, error, pagination, refetch: fetchPayments };
};

// Stock Hooks
export const useIndoorStock = () => {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true);
      const res = await stockApi.getIndoorStock();
      setStock(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  return { stock, loading, refetch: fetchStock };
};

export const useOutdoorStock = () => {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true);
      const res = await stockApi.getOutdoorStock();
      setStock(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  return { stock, loading, refetch: fetchStock };
};

export const useAvailableIndoorBatches = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await stockApi.getAvailableIndoorStock();
      setBatches(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  return { batches, loading, refetch: fetchBatches };
};

export const useAvailableOutdoorBatches = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await stockApi.getAvailableOutdoorStock();
      setBatches(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  return { batches, loading, refetch: fetchBatches };
};

// Refund Disbursement Hooks
export const useRefunds = (statusFilter?: string) => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchRefunds = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await refundDisbursementsApi.getAll(statusFilter ? { status: statusFilter, page } : { page });
      if (response.data) {
        setRefunds(Array.isArray(response.data) ? response.data : []);
        const backendPage = response.pagination.currentPage || response.pagination.page || page;
        setPagination({
          ...response.pagination,
          page: backendPage,
          currentPage: backendPage
        });
      } else {
        setRefunds(Array.isArray(response) ? response : []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);

  return { refunds, loading, error, pagination, refetch: fetchRefunds };
};

export const useRefundDetail = (refundId: string | null) => {
  const [refund, setRefund] = useState<RefundDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRefund = useCallback(async () => {
    if (!refundId) { setRefund(null); return; }
    try {
      setLoading(true);
      const data = await refundDisbursementsApi.getById(refundId);
      setRefund(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [refundId]);

  useEffect(() => { fetchRefund(); }, [fetchRefund]);

  return {
    refund, loading,
    createTerm: (data: any) => refundDisbursementsApi.createTerm(refundId!, data),
    deleteTerm: (termNumber: number) => refundDisbursementsApi.deleteTerm(refundId!, termNumber),
    refetch: fetchRefund
  };
};

// Dashboard Hooks
export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi.getStats()
      .then(data => setStats(data))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
};
