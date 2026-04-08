import { useState } from 'react';
import apiClient from './shared/services/apiClient';

export const useReportsApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (tab: string, startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/reports/${tab}`, {
        params: { startDate, endDate }
      });
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch report data';
      console.error('Reports API Error:', {
        tab,
        error: errorMessage,
        status: err.response?.status
      });
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchReport, loading, error };
};
