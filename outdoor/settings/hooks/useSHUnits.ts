import { useState, useEffect } from 'react';
import apiClient from '../../../shared/services/apiClient';

export interface SHUnit {
  id: number;
  name: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
}

export const useSHUnits = () => {
  const [units, setUnits] = useState<SHUnit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/outdoor/settings/sh-units');
      setUnits(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch SH units:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const createUnit = async (data: { name: string; capacity: number }) => {
    const response = await apiClient.post('/outdoor/settings/sh-units', data);
    await fetchUnits();
    return response.data;
  };

  const updateUnit = async (id: number, data: { name: string; capacity: number; is_active: boolean }) => {
    const response = await apiClient.put(`/outdoor/settings/sh-units/${id}`, data);
    await fetchUnits();
    return response.data;
  };

  const deleteUnit = async (id: number) => {
    await apiClient.delete(`/outdoor/settings/sh-units/${id}`);
    await fetchUnits();
  };

  return { units, loading, createUnit, updateUnit, deleteUnit };
};
