import { useState, useEffect, useCallback } from 'react';
import { useNotify } from '../shared/hooks/useNotify';
import apiClient from '../../../shared/services/apiClient';
import { useNotify } from '../shared/hooks/useNotify';

export const useBatchTimeline = () => {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batches, setBatches] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ status: '', shoots: 0, stage: '', readyForOutdoor: false });
  const [isAvailableForOutdoor, setIsAvailableForOutdoor] = useState(false);

  const loadBatches = useCallback(async () => {
    try {
      const response = await apiClient.get('/indoor/batch-timeline/batches');
      const batchList = response.map((batch: any) => batch.batch_code).sort();
      setBatches(batchList);
      if (batchList.length > 0) setSelectedBatch(batchList[0]);
    } catch (error) {
      console.error('Error loading batches:', error);
    }
  }, []);

  const getContaminationData = useCallback(async (batchCode: string, sourceTable: string, sourceId: number) => {
    try {
      const data = await apiClient.get(`/indoor/contamination?batch_code=${batchCode}&source_table=${sourceTable}&source_id=${sourceId}`);
      return data.find((m: any) => m.source_table === sourceTable && m.source_id === sourceId);
    } catch (error) {
      console.error('Error fetching contamination data:', error);
      return null;
    }
  }, []);

  const loadTimeline = useCallback(async () => {
    if (!selectedBatch) return;
    
    setLoading(true);
    try {
      const ledgerEvents = await apiClient.get(`/indoor/batch-timeline/${selectedBatch}`);
      const events: any[] = [];

      for (const event of ledgerEvents) {
        const contamination = await getContaminationData(selectedBatch, event.source_table, event.source_id);
        const contaminationText = contamination ? `, Contamination: ${contamination.contamination_count}` : '';
        
        events.push({
          type: event.source_table,
          date: event.created_at,
          title: `${event.source_table === 'subculturing' ? 'Subculturing' : 'Incubation'} - ${event.stage}`,
          details: `${event.current_bottles_count || 0} bottles${contaminationText}`,
          status: 'completed',
          stage: event.stage,
          bottles: event.current_bottles_count || 0
        });
      }

      const batchData = await apiClient.get(`/indoor/batch-timeline/${selectedBatch}/details`);
      const isMarkedForOutdoor = batchData.state === 'AO' || batchData.state === 'TO';

      setIsAvailableForOutdoor(isMarkedForOutdoor);

      if (isMarkedForOutdoor) {
        events.push({
          type: 'completed',
          date: batchData.updated_at,
          title: batchData.state === 'TO' ? 'Batch Imported by Outdoor Module' : 'Batch Transferred to Outdoor',
          details: `Batch ${selectedBatch} has been transferred to outdoor operations`,
          status: 'completed'
        });
      }

      const latestEvent = events[events.length - 1];
      const currentStage = latestEvent?.stage || 'Stage-1';
      const currentBottles = latestEvent?.bottles || 0;
      const isStage8 = currentStage === 'Stage-8';

      setTimeline(events);
      setStats({
        status: `${latestEvent?.type === 'subculturing' ? 'Subculturing' : 'Incubation'} - ${currentStage}`,
        shoots: currentBottles,
        stage: currentStage,
        readyForOutdoor: isStage8
      });

    } catch (error) {
      console.error('Error loading timeline:', error);
    }
    setLoading(false);
  }, [selectedBatch, getContaminationData]);

  const transferToOutdoor = useCallback(async (batchCode: string) => {
    try {
      await apiClient.post(`/indoor/batch-timeline/${batchCode}/transfer-to-outdoor`, {});
      notify.error('Batch marked as available for outdoor!');
      loadTimeline();
    } catch (error) {
      console.error('Error marking batch for outdoor:', error);
      notify.error('Error marking batch for outdoor');
    }
  }, [loadTimeline]);

  const undoOutdoorTransfer = useCallback(async (batchCode: string) => {
    try {
      await apiClient.post(`/indoor/batch-timeline/${batchCode}/undo-outdoor-transfer`, {});
      notify.error('Outdoor availability removed!');
      loadTimeline();
    } catch (error) {
      console.error('Error undoing outdoor transfer:', error);
      notify.error('Error undoing outdoor transfer');
    }
  }, [loadTimeline]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  useEffect(() => {
    if (selectedBatch) {
      loadTimeline();
    }
  }, [selectedBatch, loadTimeline]);

  return {
    selectedBatch,
    setSelectedBatch,
    batches,
    timeline,
    loading,
    stats,
    isAvailableForOutdoor,
    transferToOutdoor,
    undoOutdoorTransfer,
    refetch: loadTimeline
  };
};