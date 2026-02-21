import { useState, useEffect } from 'react';
import { batchApi } from '../services/outdoorApi';

export const useOutdoorBatches = () => {
  const [batches, setBatches] = useState<Array<{value: string; label: string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const res = await batchApi.getOutdoorReadyBatches();
      const batchOptions = res.data.map((b: any) => ({
        value: b.batch_code,
        label: `${b.batch_code} (${b.crop_name})`
      }));
      setBatches(batchOptions);
    } catch (error) {
      console.error('Error loading outdoor-ready batches:', error);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  return { batches, loading, reload: loadBatches };
};