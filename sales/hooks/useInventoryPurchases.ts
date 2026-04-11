import { useState, useEffect, useCallback } from 'react';
import { inventoryPurchasesApi, inventoryPaymentsApi } from '../services/salesApi';
import type { WithdrawEntry, InventoryItem, Supplier } from '../types';

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
