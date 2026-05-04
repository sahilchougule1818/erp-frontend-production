import { useState, useEffect } from 'react';
import { useNotify } from '../../../shared/hooks/useNotify';
import { indoorApi } from '../../services/indoorApi';
import { useLabContext } from '../../contexts/LabContext';
import type { Operator } from '../../types';

export function useMediaData() {
  const notify = useNotify();
  const { labNumber } = useLabContext();
  const [mediaBatches, setMediaBatches] = useState<any[]>([]);
  const [pendingMediaBatches, setPendingMediaBatches] = useState<any[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0, limit: 10 });

  useEffect(() => {
    fetchMediaBatches();
    fetchPendingMediaBatches();
    fetchOperators();
  }, [page, labNumber]);

  const fetchMediaBatches = async () => {
    try {
      const res = await indoorApi.autoclave.getAll({ page, lab_number: labNumber || undefined });
      const data = (res as any)?.data || [];
      setMediaBatches(data);
      const p = (res as any)?.pagination;
      setPagination({
        currentPage: p?.page || 1,
        totalPages: p?.totalPages || 1,
        total: p?.total || data.length,
        limit: 10
      });
    } catch {
      setMediaBatches([]);
    }
  };

  const fetchPendingMediaBatches = async () => {
    try {
      const res = await indoorApi.autoclave.getPending({ lab_number: labNumber || undefined });
      setPendingMediaBatches(Array.isArray(res) ? res : (res as any)?.data || []);
    } catch {
      setPendingMediaBatches([]);
    }
  };

  const fetchOperators = async () => {
    try {
      const res = await (indoorApi.operators.getAll() as any);
      setOperators(res?.data || []);
    } catch {
      setOperators([]);
    }
  };

  const saveMediaBatch = async (formData: any) => {
    setLoading(true);
    try {
      if (formData.id) {
        await indoorApi.autoclave.update(formData.id, formData);
      } else {
        await indoorApi.autoclave.create(formData);
      }
      await fetchMediaBatches();
      await fetchPendingMediaBatches();
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Please try again';
      if (err.response?.status === 409) {
        notify.error('Media code already exists. Please use a different media code.');
      } else if (err.response?.status === 403) {
        notify.error('Cannot edit this record in its current status.');
      } else {
        notify.error('Failed to save: ' + msg);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMediaBatch = async (id: number) => {
    setLoading(true);
    try {
      await indoorApi.autoclave.delete(id);
      await fetchMediaBatches();
      await fetchPendingMediaBatches();
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    mediaBatches,
    pendingMediaBatches,
    operators,
    loading,
    saveMediaBatch,
    deleteMediaBatch,
    pagination: { ...pagination, onPageChange: setPage }
  };
}
