import { useState, useCallback, useEffect } from 'react';
import { outdoorApi } from '../../services/outdoorApi';

export const useFertilizationData = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchData = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const [response, batchesData] = await Promise.all([
        outdoorApi.fertilization.getAll(page, limit),
        outdoorApi.batches.getAll()
      ]);
      const data = response?.data || response;
      setRecords(Array.isArray(data) ? data : []);
      setBatches(Array.isArray(batchesData) ? batchesData : []);
      if (response?.pagination) {
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.totalPages);
        setTotal(response.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch fertilization data or batches:', error);
      setRecords([]);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchData();
  }, []);

  const saveRecord = async (formData: any) => {
    try {
      if (formData.id) {
        await outdoorApi.fertilization.update(formData.id, formData);
      }
      await fetchData();
      return true;
    } catch (error) {
      console.error('Failed to save fertilization record:', error);
      return false;
    }
  };

  const deleteRecord = async (id: number) => {
    try {
      await outdoorApi.fertilization.delete(id);
      await fetchData();
      return true;
    } catch (error) {
      console.error('Failed to delete fertilization record:', error);
      return false;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData(page);
  };

  return { 
    records, 
    batches, 
    loading, 
    saveRecord, 
    deleteRecord, 
    refetch: fetchData,
    pagination: {
      currentPage,
      totalPages,
      total,
      limit,
      onPageChange: handlePageChange
    }
  };
};
