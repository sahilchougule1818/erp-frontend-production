import { useState } from 'react';
import { useNotify } from '../shared/hooks/useNotify';
import { Label } from '../../../shared/ui/label';
import { useNotify } from '../shared/hooks/useNotify';
import { Input } from '../../../shared/ui/input';
import { useNotify } from '../shared/hooks/useNotify';
import { Button } from '../../../shared/ui/button';
import { useNotify } from '../shared/hooks/useNotify';

interface CreateBatchFormProps {
  mediaCodes?: string[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function CreateBatchForm({ mediaCodes = [], onSubmit, onCancel }: CreateBatchFormProps) {
  const [form, setForm] = useState({
    batchCode: '',
    plantName: ''
  });

  const handleSubmit = () => {
    if (!form.batchCode || !form.plantName) {
      notify.error('Please fill all required fields');
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Batch Code *</Label>
          <Input
            value={form.batchCode}
            onChange={(e) => setForm({...form, batchCode: e.target.value})}
            placeholder="Enter batch code"
          />
        </div>
        <div className="space-y-2">
          <Label>Plant Name *</Label>
          <Input
            value={form.plantName}
            onChange={(e) => setForm({...form, plantName: e.target.value})}
            placeholder="Enter plant name"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>Create Batch</Button>
      </div>
    </div>
  );
}