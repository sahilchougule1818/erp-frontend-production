import { useState, useCallback, useEffect } from 'react';
import { indoorApi } from '../../services/indoorApi';
import { ContaminationRecord } from '../types';

export const useIndoorContaminationData = () => {
  const [records, setRecords] = useState<ContaminationRecord[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });

  const fetchRecords = useCallback(async (batchCode?: string, page?: number) => {
    try {
      setIsLoading(true);
      const res = batchCode 
        ? await indoorApi.contamination.getByBatch(batchCode)
        : await indoorApi.contamination.getAll({ page: page || currentPage });
      const data = (res as any)?.data || (Array.isArray(res) ? res : []);
      setRecords(data);
      const paginationData = (res as any)?.pagination;
      setPagination({
        currentPage: paginationData?.currentPage || paginationData?.page || (res as any)?.currentPage || page || currentPage,
        totalPages: paginationData?.totalPages || (res as any)?.totalPages || 1,
        total: paginationData?.total || (res as any)?.total || data.length,
        limit: 10
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load records');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await indoorApi.contamination.getSummary();
      setSummary(res as any);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const updateContamination = async (id: number | string, count: number) => {
    await indoorApi.contamination.update(id, { contamination_count: count });
    await fetchRecords();
    if (fetchSummary) await fetchSummary();
  };

  useEffect(() => {
    fetchRecords(undefined, currentPage);
  }, [currentPage]);

  return {
    records,
    summary,
    isLoading,
    error,
    fetchRecords,
    fetchSummary,
    updateContamination,
    pagination: {
      ...pagination,
      onPageChange: setCurrentPage
    }
  };
};
