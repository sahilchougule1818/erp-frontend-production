import { useState, useEffect } from 'react';
import { indoorApi } from '../../indoorApi';

export function useIndoorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [stageDistribution, setStageDistribution] = useState<any[]>([]);
  const [readyForExport, setReadyForExport] = useState<any[]>([]);
  const [mediaPreparation, setMediaPreparation] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, stageRes, exportRes, mediaRes] = await Promise.all([
        indoorApi.unified.getDashboardStats(),
        indoorApi.unified.getStageDistribution(),
        indoorApi.unified.getReadyForExport(),
        indoorApi.unified.getMediaPreparationSummary()
      ]);

      setStats(statsRes || {});
      setStageDistribution(stageRes || []);
      setReadyForExport(exportRes || []);
      setMediaPreparation(mediaRes || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    stageDistribution,
    readyForExport,
    mediaPreparation,
    loading,
    refetch: fetchDashboardData
  };
}
