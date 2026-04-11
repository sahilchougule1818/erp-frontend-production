import { useState, useEffect, useCallback } from 'react';
import { customersApi } from '../services/salesApi';
import type { Customer } from '../types';

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
