import { useState, useEffect } from 'react';
import { indoorApi } from '../../indoorApi';

export function useSamplingData() {
  const [records, setRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
    fetchBatches();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await indoorApi.sampling.getAll();
      setRecords(res || []);
    } catch (err) {
      console.error('Failed to fetch sampling records:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await indoorApi.sampling.getBatches();
      setBatches(res || []);
    } catch (err) {
      console.error('Failed to fetch batches:', err);
      setBatches([]);
    }
  };

  const saveSampling = async (formData: any) => {
    setLoading(true);
    try {
      if (formData.id) {
        await indoorApi.sampling.update(formData.id, formData);
      } else {
        await indoorApi.sampling.create(formData);
      }
      await fetchRecords();
      return true;
    } catch (err) {
      console.error('Failed to save sampling:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSampling = async (id: number) => {
    setLoading(true);
    try {
      await indoorApi.sampling.delete(id);
      await fetchRecords();
      return true;
    } catch (err) {
      console.error('Failed to delete sampling:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    records,
    batches,
    loading,
    saveSampling,
    deleteSampling,
    refetch: fetchRecords
  };
}
