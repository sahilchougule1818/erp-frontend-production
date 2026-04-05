import { useState, useEffect, useCallback } from 'react';
import { outdoorApi } from '../../shared/services/outdoorApi';
import type { Worker } from '../../types/outdoor.types';

export const useWorkerMaster = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workerLogs, setWorkerLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPageWorkers, setCurrentPageWorkers] = useState(1);
  const [totalPagesWorkers, setTotalPagesWorkers] = useState(1);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [currentPageLogs, setCurrentPageLogs] = useState(1);
  const [totalPagesLogs, setTotalPagesLogs] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const limit = 10;

  const fetchWorkers = useCallback(async (pageWorkers = currentPageWorkers, pageLogs = currentPageLogs) => {
    setLoading(true);
    try {
      const [workersResponse, logsResponse] = await Promise.all([
        outdoorApi.workers.getAll(pageWorkers, limit),
        outdoorApi.workers.getLog(pageLogs, limit),
      ]);
      const workersData = workersResponse?.data || workersResponse;
      const logsData = logsResponse?.data || logsResponse;
      setWorkers(Array.isArray(workersData) ? workersData : []);
      setWorkerLogs(Array.isArray(logsData) ? logsData : []);
      if (workersResponse?.pagination) {
        setCurrentPageWorkers(workersResponse.pagination.currentPage);
        setTotalPagesWorkers(workersResponse.pagination.totalPages);
        setTotalWorkers(workersResponse.pagination.total);
      }
      if (logsResponse?.pagination) {
        setCurrentPageLogs(logsResponse.pagination.currentPage);
        setTotalPagesLogs(logsResponse.pagination.totalPages);
        setTotalLogs(logsResponse.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPageWorkers, currentPageLogs, limit]);

  useEffect(() => { fetchWorkers(); }, []);

  const createWorker = async (data: Partial<Worker>) => {
    await outdoorApi.workers.create(data);
    await fetchWorkers();
  };

  const updateWorker = async (id: number, data: Partial<Worker>) => {
    await outdoorApi.workers.update(id, data);
    await fetchWorkers();
  };

  const deleteWorker = async (id: number) => {
    await outdoorApi.workers.delete(id);
    await fetchWorkers();
  };

  const updateWorkerAssignment = async (id: number, workerId: number) => {
    await outdoorApi.workers.updateAssignment(id, workerId);
    await fetchWorkers();
  };

  const handlePageChangeWorkers = (page: number) => {
    setCurrentPageWorkers(page);
    fetchWorkers(page, currentPageLogs);
  };

  const handlePageChangeLogs = (page: number) => {
    setCurrentPageLogs(page);
    fetchWorkers(currentPageWorkers, page);
  };

  return {
    workers,
    workerLogs,
    loading,
    createWorker,
    updateWorker,
    deleteWorker,
    updateWorkerAssignment,
    refetch: fetchWorkers,
    paginationWorkers: {
      currentPage: currentPageWorkers,
      totalPages: totalPagesWorkers,
      total: totalWorkers,
      limit,
      onPageChange: handlePageChangeWorkers
    },
    paginationLogs: {
      currentPage: currentPageLogs,
      totalPages: totalPagesLogs,
      total: totalLogs,
      onPageChange: handlePageChangeLogs
    }
  };
};
