import axios from 'axios';
import { useState } from 'react';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const useReportsApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (tab: string, startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/${tab}`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch report data');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchReport, loading, error };
};
