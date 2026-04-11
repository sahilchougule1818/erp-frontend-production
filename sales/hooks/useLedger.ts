import { useState, useEffect, useCallback } from 'react';
import { ledgerApi } from '../services/salesApi';
import type { LedgerEntry } from '../types';

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
        setEntries(Array.isArray(response.data) ? response.data : []);
        const backendPage = response.pagination.currentPage || response.pagination.page || page;
        setPagination({
          ...response.pagination,
          page: backendPage,
          currentPage: backendPage
        });
      } else {
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
