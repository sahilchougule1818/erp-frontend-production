import { useState, useEffect } from 'react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Label } from '../../shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { ModalLayout } from '../../shared/components/ModalLayout';

interface CreateSamplingFormProps {
  initialData: any;
  batches: any[];
  onSubmit: (data: any) => void;
  onDelete?: (id: number) => void;
  onCancel: () => void;
}

export function CreateSamplingForm({ initialData, batches, onSubmit, onDelete, onCancel }: CreateSamplingFormProps) {
  const [form, setForm] = useState({
    sampleDate: '',
    batchName: '',
    cropName: '',
    stage: '',
    phase: '',
    sentDate: ''
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        sampleDate: initialData.sample_date?.split('T')[0] || '',
        batchName: initialData.batch_code || '',
        cropName: initialData.plant_name || '',
        stage: initialData.stage || '',
        phase: initialData.phase || '',
        sentDate: initialData.sent_date?.split('T')[0] || ''
      });
    }
  }, [initialData]);

  const handleSubmit = () => {
    onSubmit({ ...form, id: initialData?.id });
  };

  return (
    <ModalLayout title={initialData ? 'Edit Sampling Record' : 'Create Sampling Record'}>
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-700">Sampling Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sample Date *</Label>
              <Input type="date" value={form.sampleDate} onChange={(e) => setForm({...form, sampleDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Batch Name *</Label>
              <Select value={form.batchName} onValueChange={(v) => setForm({...form, batchName: v})}>
                <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                <SelectContent>
                  {batches.map((b: any) => (
                    <SelectItem key={b.batch_code} value={b.batch_code}>{b.batch_code} ({b.plant_name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-700">Batch Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plant Name</Label>
              <Input value={form.cropName} readOnly className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Input value={form.stage} readOnly className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Phase</Label>
              <Input value={form.phase} readOnly className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Sent Date</Label>
              <Input type="date" value={form.sentDate} onChange={(e) => setForm({...form, sentDate: e.target.value})} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          {initialData && onDelete && <Button variant="destructive" onClick={() => onDelete(initialData.id)}>Delete</Button>}
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>Save</Button>
        </div>
      </div>
    </ModalLayout>
  );
}
