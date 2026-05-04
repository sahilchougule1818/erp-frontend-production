import { useState, useEffect } from 'react';
import apiClient from '../../../shared/services/apiClient';

export interface Tunnel {
  id: number;
  name: string;
  capacity: number;
  current_occupancy?: number;
  is_active: boolean;
  created_at: string;
  display_name?: string;
}

export const usePHTunnels = () => {
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTunnels = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/outdoor/settings/ph-tunnels');
      setTunnels(response.data);
    } catch (error) {
      console.error('Failed to fetch PH tunnels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTunnels();
  }, []);

  const createTunnel = async (data: { tunnelName: string; capacity: number }) => {
    const response = await apiClient.post('/outdoor/settings/ph-tunnels', data);
    await fetchTunnels();
    return response.data;
  };

  const updateTunnel = async (data: { tunnelName: string; capacity: number }) => {
    const response = await apiClient.post('/outdoor/settings/ph-tunnels', data);
    await fetchTunnels();
    return response.data;
  };

  return { tunnels, loading, createTunnel, updateTunnel };
};
