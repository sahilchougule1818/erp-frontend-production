import { useMemo } from 'react';
import { useToast } from '../ui/use-toast';

export const useNotify = () => {
  const { toast } = useToast();
  return useMemo(() => ({
    success: (msg: string) => toast({ title: msg }),
    error: (msg: string) => toast({ title: msg, variant: 'destructive' }),
    warn: (msg: string) => toast({ title: msg })
  }), [toast]);
};