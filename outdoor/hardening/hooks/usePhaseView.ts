import { useState, useCallback, useEffect } from 'react';

export function usePhaseView(fetchFn: (page: number, limit: number) => Promise<any>) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetchFn(page, limit);
      const data = response?.data || response;
      setRecords(Array.isArray(data) ? data : []);
      if (response?.pagination) {
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.totalPages);
        setTotal(response.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch phase records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, limit]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchRecords(page);
  };

  return { 
    records, 
    loading, 
    refetch: fetchRecords,
    pagination: {
      currentPage,
      totalPages,
      total,
      limit,
      onPageChange: handlePageChange
    }
  };
}
