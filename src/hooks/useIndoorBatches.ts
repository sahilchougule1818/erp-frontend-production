import { useState, useEffect } from 'react';
import { batchApi } from '../services/outdoorApi';

export const useIndoorBatches = () => {
  const [batches, setBatches] = useState<Array<{value: string; label: string; stage: string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const res = await batchApi.getIndoorBatches();
      const batchOptions = res.data.map((b: any) => ({
        value: b.batch_code,
        label: `${b.batch_code} (${b.crop_name})`,
        stage: b.subculture_stage
      }));
      console.log('Loaded batches with stages:', batchOptions);
      setBatches(batchOptions);
    } catch (error) {
      console.error('Error loading batches:', error);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  return { batches, loading, reload: loadBatches };
};
