import { useState, useCallback, useEffect } from 'react';
import { outdoorApi } from '../../shared/services/outdoorApi';

export const useMortalityData = () => {
  const [log, setLog] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPageLog, setCurrentPageLog] = useState(1);
  const [totalPagesLog, setTotalPagesLog] = useState(1);
  const [totalLog, setTotalLog] = useState(0);
  const [currentPageSummary, setCurrentPageSummary] = useState(1);
  const [totalPagesSummary, setTotalPagesSummary] = useState(1);
  const [totalSummary, setTotalSummary] = useState(0);
  const limit = 10;

  const fetchData = useCallback(async (pageLog = currentPageLog, pageSummary = currentPageSummary) => {
    setLoading(true);
    try {
      const [logResponse, summaryResponse] = await Promise.all([
        outdoorApi.mortality.getLog(pageLog, limit),
        outdoorApi.mortality.getSummary(pageSummary, limit),
      ]);
      const logData = logResponse?.data || logResponse;
      const summaryData = summaryResponse?.data || summaryResponse;
      setLog(Array.isArray(logData) ? logData : []);
      setSummary(Array.isArray(summaryData) ? summaryData : []);
      if (logResponse?.pagination) {
        setCurrentPageLog(logResponse.pagination.currentPage);
        setTotalPagesLog(logResponse.pagination.totalPages);
        setTotalLog(logResponse.pagination.total);
      }
      if (summaryResponse?.pagination) {
        setCurrentPageSummary(summaryResponse.pagination.currentPage);
        setTotalPagesSummary(summaryResponse.pagination.totalPages);
        setTotalSummary(summaryResponse.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch mortality data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPageLog, currentPageSummary, limit]);

  useEffect(() => {
    fetchData();
  }, []);

  const handlePageChangeLog = (page: number) => {
    setCurrentPageLog(page);
    fetchData(page, currentPageSummary);
  };

  const handlePageChangeSummary = (page: number) => {
    setCurrentPageSummary(page);
    fetchData(currentPageLog, page);
  };

  return { 
    log, 
    summary, 
    loading, 
    refetch: fetchData,
    paginationLog: {
      currentPage: currentPageLog,
      totalPages: totalPagesLog,
      total: totalLog,
      limit,
      onPageChange: handlePageChangeLog
    },
    paginationSummary: {
      currentPage: currentPageSummary,
      totalPages: totalPagesSummary,
      total: totalSummary,
      limit,
      onPageChange: handlePageChangeSummary
    }
  };
};
