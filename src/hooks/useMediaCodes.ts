import { useState, useEffect } from 'react';
import * as indoorApi from '../services/indoorApi';

export const useMediaCodes = () => {
  const [mediaCodes, setMediaCodes] = useState<Array<{value: string; label: string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMediaCodes();
  }, []);

  const loadMediaCodes = async () => {
    try {
      const res = await indoorApi.getMediaBatches();
      const uniqueCodes = Array.from(new Set(res.data.map((m: any) => m.media_code).filter(Boolean)));
      const options = uniqueCodes.map((code: string) => ({
        value: code,
        label: code
      }));
      setMediaCodes(options);
    } catch (error) {
      console.error('Error loading media codes:', error);
      setMediaCodes([]);
    } finally {
      setLoading(false);
    }
  };

  return { mediaCodes, loading, reload: loadMediaCodes };
};
