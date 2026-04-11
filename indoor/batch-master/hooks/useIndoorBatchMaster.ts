import { useState, useCallback } from 'react';
import { indoorApi } from '../../services/indoorApi';
import { Batch, Operator, UndoPreview } from '../types';

export const useIndoorBatchMaster = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchBatches = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await (indoorApi.batchOperations.getAllBatches({ page }) as any);
      if (res.data && res.pagination) {
        setBatches(res.data || []);
        const backendPage = res.pagination.currentPage || res.pagination.page || page;
        setPagination({
          ...res.pagination,
          page: backendPage,
          currentPage: backendPage
        });
      } else {
        // Fallback for non-paginated response
        setBatches(res || []);
        setPagination({
          total: (res || []).length,
          page: 1,
          currentPage: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOperators = useCallback(async () => {
    try {
      const res = await (indoorApi.operators.getAll() as any);
      const data = res.data ? res.data : res;
      if (data) {
        setOperators(data.filter((op: Operator) => op.is_active));
      }
    } catch (err: any) {
      console.error('Failed to fetch operators', err);
    }
  }, []);

  const createBatch = async (data: any) => {
    try {
      const res = await (indoorApi.batchOperations.createBatch(data) as any);
      await fetchBatches();
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const recordSubculture = async (batchCode: string, data: any) => {
    try {
      const res = await (indoorApi.batchOperations.subculture({ batchCode, ...data }) as any);
      await fetchBatches();
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const recordIncubation = async (batchCode: string, data: any) => {
    try {
      const res = await (indoorApi.batchOperations.incubate({ batchCode, ...data }) as any);
      await fetchBatches();
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const exportToOutdoor = async (batchCode: string, data: any) => {
    try {
      const res = await (indoorApi.batchOperations.exportBatch({ batchCode, ...data }) as any);
      await fetchBatches();
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const unexportFromOutdoor = async (batchCode: string) => {
    try {
      const res = await (indoorApi.batchOperations.unexportBatch({ batchCode }) as any);
      await fetchBatches();
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const previewUndo = async (batchCode: string) => {
    try {
      const res = await (indoorApi.batchOperations.getUndoPreview(batchCode) as any);
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const undoLastAction = async (batchCode: string) => {
    try {
      await (indoorApi.batchOperations.undoLastAction({ batchCode }) as any);
      await fetchBatches();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const getBatchTimeline = async (batchCode: string) => {
    try {
      const res = await (indoorApi.batchTimeline.getTimeline(batchCode) as any);
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const submitSample = async (batchCode: string, data: any) => {
    try {
      await (indoorApi.sampling.submit({
        batch_code: batchCode,
        sample_date: data.sampleDate,
        notes: data.sampleNotes
      }) as any);
      await fetchBatches();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const reportSampleResult = async (batchCode: string, data: any) => {
    try {
      await (indoorApi.sampling.reportResult(batchCode, {
        received_date: data.resultDate,
        status: data.status,
        certificate_number: data.certificateNo,
        government_digital_code: data.govtCode,
        reason: data.notes
      }) as any);
      await fetchBatches();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  return {
    batches,
    operators,
    loading,
    error,
    pagination,
    fetchBatches,
    fetchOperators,
    createBatch,
    recordSubculture,
    recordIncubation,
    exportToOutdoor,
    unexportFromOutdoor,
    previewUndo,
    undoLastAction,
    getBatchTimeline,
    submitSample,
    reportSampleResult
  };
};