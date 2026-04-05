import { useState, useEffect } from 'react';
import { indoorApi } from '../../indoorApi';
import apiClient from '../../shared/services/apiClient';

export function useOperatorData() {
  const [operators, setOperators] = useState([]);
  const [batches, setBatches] = useState([]);
  const [workerLogs, setWorkerLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOperators();
    fetchBatches();
  }, []);

  const fetchOperators = async () => {
    try {
      const res = await indoorApi.operators.getAll();
      setOperators(res || []);
    } catch (err: any) {
      console.error('Failed to fetch operators:', err);
      setOperators([]);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await apiClient.get('/indoor/operator-log/batches');
      setBatches(res || []);
    } catch (err) {
      console.error('Failed to fetch batches:', err);
      setBatches([]);
    }
  };

  const fetchWorkerLog = async (batchCode: string) => {
    try {
      const res = await apiClient.get(`/indoor/operator-log/batch/${batchCode}`);
      setWorkerLogs(res || []);
    } catch (err) {
      console.error('Failed to fetch worker log:', err);
      setWorkerLogs([]);
    }
  };

  const saveOperator = async (formData: any) => {
    setLoading(true);
    try {
      if (formData.id) {
        await indoorApi.operators.update(formData.id, formData);
      } else {
        await indoorApi.operators.create(formData);
      }
      await fetchOperators();
      return true;
    } catch (err) {
      console.error('Failed to save operator:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteOperator = async (id: number) => {
    setLoading(true);
    try {
      await indoorApi.operators.delete(id);
      await fetchOperators();
      return true;
    } catch (err) {
      console.error('Failed to delete operator:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    operators, 
    batches, 
    workerLogs, 
    loading, 
    saveOperator, 
    deleteOperator, 
    fetchWorkerLog,
    refetch: fetchOperators
  };
}
