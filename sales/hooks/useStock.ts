import { useState, useEffect, useCallback } from 'react';
import { stockApi } from '../services/salesApi';

export const useIndoorStock = () => {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true);
      const res = await stockApi.getIndoorStock();
      setStock(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  return { stock, loading, refetch: fetchStock };
};

export const useOutdoorStock = () => {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true);
      const res = await stockApi.getOutdoorStock();
      setStock(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  return { stock, loading, refetch: fetchStock };
};

export const useAvailableIndoorBatches = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await stockApi.getAvailableIndoorStock();
      setBatches(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  return { batches, loading, refetch: fetchBatches };
};

export const useAvailableOutdoorBatches = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await stockApi.getAvailableOutdoorStock();
      setBatches(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  return { batches, loading, refetch: fetchBatches };
};
