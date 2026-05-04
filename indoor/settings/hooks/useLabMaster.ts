import { useState, useEffect } from 'react';
import apiClient from '../../../shared/services/apiClient';

export interface Lab {
  id: number;
  lab_number: number;
  lab_name: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export const useLabMaster = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/indoor/settings/labs');
      console.log('Labs full response:', response);
      const labsData = response.data || response || [];
      console.log('Labs data:', labsData);
      setLabs(Array.isArray(labsData) ? labsData : []);
    } catch (error) {
      console.error('Failed to fetch labs:', error);
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const createLab = async (data: { lab_number: number; lab_name: string }) => {
    const response = await apiClient.post('/indoor/settings/labs', data);
    await fetchLabs();
    return response.data;
  };

  const updateLab = async (id: number, data: { lab_name: string; is_active: boolean }) => {
    const response = await apiClient.put(`/indoor/settings/labs/${id}`, data);
    await fetchLabs();
    return response.data;
  };

  const deleteLab = async (id: number) => {
    await apiClient.delete(`/indoor/settings/labs/${id}`);
    await fetchLabs();
  };

  return { labs, loading, createLab, updateLab, deleteLab };
};
