import { useState, useEffect, useCallback } from 'react';
import { outdoorApi } from '../../shared/services/outdoorApi';
import { useNotify } from '../../shared/hooks/useNotify';
import type { Batch, Tunnel, Worker } from '../../types/outdoor.types';

export function useBatchMaster() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [indoorBatches, setIndoorBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const notify = useNotify();

  const loadData = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const [batchesRes, tunnelsRes, workersRes] = await Promise.all([
        outdoorApi.unified.getRegistry(page, limit),
        outdoorApi.tunnels.getAll(),
        outdoorApi.workers.getAll(1, 500),
      ]);
      const batchesData = batchesRes?.data || batchesRes;
      const workersData = workersRes?.data || workersRes;
      setBatches(Array.isArray(batchesData) ? batchesData : []);
      setTunnels(Array.isArray(tunnelsRes) ? tunnelsRes : []);
      setWorkers(Array.isArray(workersData) ? workersData : []);
      if (batchesRes?.pagination) {
        setCurrentPage(batchesRes.pagination.currentPage);
        setTotalPages(batchesRes.pagination.totalPages);
        setTotal(batchesRes.pagination.total);
      }
    } catch (error: any) {
      notify.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => { loadData(); }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadData(page);
  };

  // ── Indoor bridge ────────────────────────────────────────────────────────

  const loadIndoorBatches = async () => {
    try {
      const data = await outdoorApi.batches.getIndoorAvailable();
      setIndoorBatches(Array.isArray(data) ? (data as any) : []);
      return true;
    } catch {
      setIndoorBatches([]);
      notify.error('Failed to load indoor batches');
      return false;
    }
  };

  const importFromIndoor = async (indoorBatchId: number, data: any) => {
    try {
      const operatorObjects = _mapWorkers(data.selectedWorkers, workers);
      await outdoorApi.batches.importFromIndoor({
        indoorBatchId,
        tunnel: data.newTunnel,
        plants: data.plants,
        trays: data.trays ?? [],
        operators: operatorObjects,
      });
      notify.success('Batch imported successfully');
      await loadData();
      return true;
    } catch (error: any) {
      notify.error(error.response?.data?.message || 'Failed to import batch');
      return false;
    }
  };

  // ── Movements ────────────────────────────────────────────────────────────

  const makeShift = async (batchCode: string, data: any) => {
    try {
      const operatorObjects = _mapWorkers(data.selectedWorkers, workers);
      await outdoorApi.unified.makeShift({
        batchCode,
        newTunnel: data.newTunnel,
        plants: data.plants,
        mortalityCount: data.mortalityCount,
        reason: data.reason,
        trays: data.trays ?? [],
        operators: operatorObjects,
      });
      notify.success('Shift created successfully');
      await loadData();
      return true;
    } catch (error: any) {
      notify.error(error.response?.data?.message || 'Failed to create shift');
      return false;
    }
  };

  const phaseTransition = async (batchCode: string, currentTunnel: string, data: any) => {
    try {
      const operatorObjects = _mapWorkers(data.selectedWorkers, workers);
      await outdoorApi.unified.phaseTransition({
        batchCode,
        targetPhase: data.targetPhase,
        // holding_area has no tunnel — pass current as placeholder, backend ignores it
        newTunnel: data.targetPhase === 'holding_area' ? currentTunnel : data.newTunnel,
        plants: data.plants,
        mortalityCount: data.mortalityCount,
        reason: data.reason,
        trays: data.trays ?? [],
        operators: operatorObjects,
      });
      notify.success('Phase transition completed');
      await loadData();
      return true;
    } catch (error: any) {
      notify.error(error.response?.data?.message || 'Failed to transition phase');
      return false;
    }
  };

  // ── Undo ─────────────────────────────────────────────────────────────────

  const undoLastAction = async (batchCode: string) => {
    try {
      const response = await outdoorApi.unified.undoLastAction({ batchCode });
      const data = response?.data ?? response;

      const isImportUndo = data?.undone_event?.event_type === 'IMPORT';
      notify.success(
        isImportUndo
          ? 'Batch import undone — batch removed'
          : 'Action undone successfully'
      );
      await loadData();
      return true;
    } catch (error: any) {
      notify.error(error.response?.data?.message || 'Failed to undo action');
      return false;
    }
  };

  // ── Activities ────────────────────────────────────────────────────────────

  const recordFertilization = async (batchCode: string, data: any) => {
    try {
      await outdoorApi.fertilization.create({
        batch_code: batchCode,
        fertilizer_name: data.fertilizerName,
        quantity: data.quantity,
        worker_ids: data.selectedWorkers,
      });
      notify.success('Fertilization recorded');
      return true;
    } catch {
      notify.error('Failed to record fertilization');
      return false;
    }
  };

  const submitSample = async (batchCode: string, data: any) => {
    try {
      await outdoorApi.sampling.submit({
        batch_code: batchCode,
        sample_date: data.sampleDate,
        notes: data.sampleNotes,
      });
      notify.success('Sample submitted successfully');
      await loadData();
      return true;
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Failed to submit sample');
      return false;
    }
  };

  const reportSampleResult = async (batchCode: string, data: any) => {
    try {
      // Get all submissions without pagination to find the specific batch (backend limit is 500)
      const submissions = await outdoorApi.sampling.getSubmissions(1, 500);
      const submissionData = submissions?.data || submissions;
      const submission = (Array.isArray(submissionData) ? submissionData : []).find((s: any) => s.batch_code === batchCode);
      if (!submission) {
        notify.error('Sample submission record not found');
        return false;
      }
      await outdoorApi.sampling.reportResult(submission.id, {
        received_date: data.resultDate,
        status: data.status,
        certificate_number: data.certificateNumber || null,
        government_digital_code: data.govtCode || null,
        reason: data.notes || null,
      });
      notify.success('Sample result reported successfully');
      await loadData();
      return true;
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Failed to report sample result');
      return false;
    }
  };

  // ── Derived helpers ───────────────────────────────────────────────────────

  // Tunnels with available space — uses `name` not `tunnel_name`
  const getAvailableTunnels = () => tunnels.filter(t => t.available_space > 0);

  return {
    batches,
    tunnels,
    workers,
    indoorBatches,
    loading,
    loadData,
    loadIndoorBatches,
    importFromIndoor,
    makeShift,
    phaseTransition,
    undoLastAction,
    recordFertilization,
    submitSample,
    reportSampleResult,
    getAvailableTunnels,
    pagination: {
      currentPage,
      totalPages,
      total,
      limit,
      onPageChange: handlePageChange
    }
  };
}

// ─── Private helpers ─────────────────────────────────────────────────────────

function _mapWorkers(selectedIds: number[], workers: Worker[]) {
  return selectedIds
    .map(id => workers.find(w => w.id === id))
    .filter(Boolean)
    .map((w: any) => ({
      id: w.id,
      name: w.short_name,
      short_name: w.short_name,
    }));
}
