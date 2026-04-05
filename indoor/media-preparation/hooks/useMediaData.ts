import { useState, useEffect } from 'react';
import { indoorApi } from '../../indoorApi';

export function useMediaData() {
  const [mediaBatches, setMediaBatches] = useState([]);
  const [pendingMediaBatches, setPendingMediaBatches] = useState([]);
  const [completedMediaBatches, setCompletedMediaBatches] = useState([]);
  const [autoclaveCycles, setAutoclaveCycles] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mediaPage, setMediaPage] = useState(1);
  const [autoclavePage, setAutoclavePage] = useState(1);
  const [mediaPagination, setMediaPagination] = useState({ currentPage: 1, totalPages: 1, total: 0, limit: 10 });
  const [autoclavePagination, setAutoclavePagination] = useState({ currentPage: 1, totalPages: 1, total: 0, limit: 10 });

  useEffect(() => {
    fetchMediaBatches();
    fetchPendingMediaBatches();
    fetchAutoclaveCycles();
    fetchOperators();
  }, [mediaPage, autoclavePage]);

  const fetchMediaBatches = async () => {
    try {
      const res = await indoorApi.mediaPreparation.getAll({ page: mediaPage });
      const data = (res as any)?.data || [];
      setMediaBatches(data);
      const pagination = (res as any)?.pagination;
      setMediaPagination({
        currentPage: pagination?.page || (res as any)?.currentPage || 1,
        totalPages: pagination?.totalPages || (res as any)?.totalPages || 1,
        total: pagination?.total || (res as any)?.total || data.length,
        limit: 10
      });
    } catch (err) {
      console.error('Failed to fetch media batches:', err);
      setMediaBatches([]);
    }
  };

  const fetchPendingMediaBatches = async () => {
    try {
      const res = await (indoorApi.mediaPreparation.getPending() as any);
      const data = (res as any)?.data || (Array.isArray(res) ? res : []);
      setPendingMediaBatches(data);
    } catch (err) {
      console.error('Failed to fetch pending media batches:', err);
      setPendingMediaBatches([]);
    }
  };

  const fetchCompletedMediaBatches = async () => {
    try {
      const res = await (indoorApi.mediaPreparation.getCompleted() as any);
      const data = (res as any)?.data || (Array.isArray(res) ? res : []);
      setCompletedMediaBatches(data);
    } catch (err) {
      console.error('Failed to fetch completed media batches:', err);
      setCompletedMediaBatches([]);
    }
  };

  const fetchAutoclaveCycles = async () => {
    try {
      const res = await (indoorApi.autoclave.getAll() as any);
      const data = (res as any)?.data || (Array.isArray(res) ? res : []);
      setAutoclaveCycles(data);
      const pagination = (res as any)?.pagination;
      setAutoclavePagination({
        currentPage: pagination?.page || (res as any)?.currentPage || 1,
        totalPages: pagination?.totalPages || (res as any)?.totalPages || 1,
        total: pagination?.total || (res as any)?.total || data.length,
        limit: 10
      });
    } catch (err) {
      console.error('Failed to fetch autoclave cycles:', err);
      setAutoclaveCycles([]);
    }
  };

  const fetchOperators = async () => {
    try {
      const res = await (indoorApi.operators.getAll() as any);
      setOperators(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch operators:', err);
      setOperators([]);
    }
  };

  const saveMediaBatch = async (formData: any) => {
    setLoading(true);
    try {
      if (formData.id) {
        await (indoorApi.mediaPreparation.update(formData.id, formData) as any);
      } else {
        await (indoorApi.mediaPreparation.create(formData) as any);
      }
      await fetchMediaBatches();
      await fetchPendingMediaBatches();
      return true;
    } catch (err: any) {
      console.error('Failed to save media batch:', err);
      
      if (err.response?.status === 409) {
        alert('Error: Media code already exists. Please use a different media code.');
      } else if (err.response?.status === 403) {
        alert('Error: Cannot edit this media batch - it is no longer in pending status.');
      } else {
        alert('Error: Failed to save media batch. Please try again.');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveAutoclaveCycle = async (formData: any) => {
    setLoading(true);
    try {
      if (formData.id) {
        await (indoorApi.autoclave.update(formData.id, formData) as any);
      } else {
        await (indoorApi.autoclave.create(formData) as any);
      }
      await fetchAutoclaveCycles();
      await fetchMediaBatches();
      await fetchPendingMediaBatches();
      return true;
    } catch (err: any) {
      console.error('Failed to save autoclave cycle:', err);
      
      if (err.response?.status === 409) {
        alert('Error: Autoclave cycle already exists for this media code.');
      } else if (err.response?.status === 400) {
        alert('Error: ' + (err.response?.data?.message || 'Invalid data provided.'));
      } else if (err.response?.status === 404) {
        alert('Error: Media batch not found or not available for autoclave.');
      } else {
        alert('Error: Failed to save autoclave cycle. Please try again.');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMediaBatch = async (id: number) => {
    setLoading(true);
    try {
      await (indoorApi.mediaPreparation.delete(id) as any);
      await fetchMediaBatches();
      await fetchPendingMediaBatches();
      return true;
    } catch (err) {
      console.error('Failed to delete media batch:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAutoclaveCycle = async (id: number) => {
    setLoading(true);
    try {
      await (indoorApi.autoclave.delete(id) as any);
      await fetchAutoclaveCycles();
      await fetchMediaBatches();
      await fetchPendingMediaBatches();
      return true;
    } catch (err) {
      console.error('Failed to delete autoclave cycle:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    mediaBatches,
    pendingMediaBatches,
    completedMediaBatches,
    autoclaveCycles,
    operators,
    loading,
    saveMediaBatch,
    saveAutoclaveCycle,
    deleteMediaBatch,
    deleteAutoclaveCycle,
    fetchCompletedMediaBatches,
    mediaPagination: {
      ...mediaPagination,
      onPageChange: setMediaPage
    },
    autoclavePagination: {
      ...autoclavePagination,
      onPageChange: setAutoclavePage
    }
  };
}
