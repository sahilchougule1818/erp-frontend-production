import { useState, useEffect } from 'react';
import apiClient from '../../../shared/services/apiClient';

export interface Plant {
  id: number;
  plant_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePlantMaster() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/indoor/settings/plants');
      const plantsData = response.data || response || [];
      setPlants(Array.isArray(plantsData) ? plantsData : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch plants');
      console.error('Failed to fetch plants:', err);
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const createPlant = async (plantData: { plant_name: string }) => {
    const response = await apiClient.post('/indoor/settings/plants', plantData);
    await fetchPlants();
    return response.data;
  };

  const updatePlant = async (id: number, plantData: { plant_name: string; is_active: boolean }) => {
    const response = await apiClient.put(`/indoor/settings/plants/${id}`, plantData);
    await fetchPlants();
    return response.data;
  };

  const deletePlant = async (id: number) => {
    await apiClient.delete(`/indoor/settings/plants/${id}`);
    await fetchPlants();
  };

  return {
    plants,
    loading,
    error,
    createPlant,
    updatePlant,
    deletePlant,
    refetch: fetchPlants,
  };
}
