import { useState, useEffect } from 'react';

export function useOutdoorData(apiEndpoint: any) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchRecords();
  }, [currentPage]);

  const fetchRecords = async (page = currentPage) => {
    setLoading(true);
    try {
      const response = await apiEndpoint.getAll(page, limit);
      const data = response?.data || response;
      setRecords(Array.isArray(data) ? data : []);
      if (response?.pagination) {
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.totalPages);
        setTotal(response.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
