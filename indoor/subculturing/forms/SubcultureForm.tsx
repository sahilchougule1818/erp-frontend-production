import { useState, useEffect } from 'react';
import { useNotify } from '../shared/hooks/useNotify';
import { Label } from '../../../shared/ui/label';
import { useNotify } from '../shared/hooks/useNotify';
import { Input } from '../../../shared/ui/input';
import { useNotify } from '../shared/hooks/useNotify';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { useNotify } from '../shared/hooks/useNotify';
import { Textarea } from '../../../shared/ui/textarea';
import { useNotify } from '../shared/hooks/useNotify';
import { Button } from '../../../shared/ui/button';
import { useNotify } from '../shared/hooks/useNotify';
import { Trash2, ArrowRight } from 'lucide-react';
import { useNotify } from '../shared/hooks/useNotify';
import { OperatorSelector } from '../../operators/components/OperatorSelector';
import { useNotify } from '../shared/hooks/useNotify';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { useNotify } from '../shared/hooks/useNotify';
import apiClient from '../../../shared/services/apiClient';
import { useNotify } from '../shared/hooks/useNotify';

interface SubcultureFormProps {
  initialData: any;
  selectedBatch: any; // Change to selectedBatch to avoid conflicts
  operators: any[];
  records: any[];
  onSubmit: (data: any) => void;
  onDelete?: (id: number) => void;
  onCancel: () => void;
}

const emptyForm = {
  batchCode: '',
  mediaCode: '',
  plantName: '',
  currentQuantity: '',
  noOfBottles: '',
  contamination: '0',
  remainingBottles: '',
  operatorIds: [],
  notes: ''
};

const stageOptions = Array.from({ length: 8 }, (_, i) => ({ 
  value: `Stage-${i + 1}`, 
  label: `Stage-${i + 1}` 
}));

export function SubcultureForm({ initialData, selectedBatch, operators, records, onSubmit, onDelete, onCancel }: SubcultureFormProps) {
  const allMediaCodes = Array.from(new Set([...records.map((r: any) => r.media_code), initialData?.media_code].filter(Boolean)));
  const [form, setForm] = useState<any>(emptyForm);
  
  // Get next stage for selected batch
  const getNextStage = (currentStage: string) => {
    const stageNumber = parseInt(currentStage?.split('-')[1] || '0');
    return `Stage-${stageNumber + 1}`;
  };
  
  const updateForm = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  useEffect(() => {
    // Initialize form with batch data - all from selectedBatch
    setForm({
      ...emptyForm,
      batchCode: selectedBatch?.batch_code || '',
      plantName: selectedBatch?.plant_name || '',
      currentQuantity: selectedBatch?.available_bottles ?? selectedBatch?.current_bottles_count ?? '',
      ...initialData
    });
    if (initialData?.id) fetchOperatorIds(initialData.id);
  }, [initialData, selectedBatch]);

const fetchOperatorIds = async (recordId: number) => {
    try {
      // Since operators are now included in the main record response,
      // we can get them from the record data instead of a separate API call
      const record = records.find((r: any) => r.id === recordId);
      if (record && record.operators) {
        const operatorIds = record.operators.map((op: any) => parseInt(op.operator_id));
        setForm((prev: any) => ({ ...prev, operatorIds }));
      } else {
        // Fallback to API call if operators not in record
        const data = await apiClient.get(`/form-data/subculturing/${recordId}/operators`);
        setForm((prev: any) => ({ ...prev, operatorIds: data.map(id => parseInt(id)) }));
      }
    } catch (err) {
      console.error('Failed to fetch operator IDs:', err);
    }
  };

  const handleContaminationChange = (value: string) => {
    const contamination = parseInt(value) || 0;
    setForm({ ...form, contamination: value, remainingBottles: (parseInt(form.noOfBottles) || 0) - contamination });
  };

  const handleSubmit = () => {
    if (!form.mediaCode) {
      notify.error('Please select a media code');
      return;
    }
    if (!form.noOfBottles || parseInt(form.noOfBottles) <= 0) {
      notify.error('Please enter a valid new quantity (must be greater than 0)');
      return;
    }
    if (!form.operatorIds || form.operatorIds.length === 0) {
      notify.error('Please select at least one operator');
      return;
    }
    
    onSubmit({
      id: form.id,
      batchName: selectedBatch?.batch_code,
      mediaCode: form.mediaCode,
      plantName: selectedBatch?.plant_name,
      currentBottles: selectedBatch?.available_bottles ?? selectedBatch?.current_bottles_count,
      noOfBottles: form.noOfBottles,
      contaminationCount: form.contamination,
      operatorIds: form.operatorIds,
      notes: form.notes
    });
  };

  return (
    <ModalLayout title={initialData ? 'Edit Subculture Record' : 'Record Subculture'}>
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center mb-3">
            <div className="text-base text-gray-600">Subculturing Batch</div>
            <div className="font-semibold text-blue-800 text-xl">{selectedBatch?.batch_code}</div>
            <div className="text-base text-gray-600 mt-1">{selectedBatch?.plant_name}</div>
          </div>
          {selectedBatch && (
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-base text-gray-600">Current Stage</div>
                <div className="font-semibold text-blue-800">{selectedBatch.stage}</div>
              </div>
              <ArrowRight className="w-6 h-6 text-blue-600" />
              <div className="text-center">
                <div className="text-base text-gray-600">After Subculture</div>
                <div className="font-semibold text-green-800">{getNextStage(selectedBatch.stage)}</div>
              </div>
            </div>
          )}
          <div className="text-center mt-2 text-base text-gray-600">
            Subculturing will automatically advance the batch to the next stage
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Subculture Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Media Code *</Label>
              <Select value={form.mediaCode} onValueChange={(v) => updateForm('mediaCode', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allMediaCodes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {selectedBatch?.stage !== 'Stage-0' && (
              <div className="space-y-2">
                <Label>Current Quantity (Available)</Label>
                <Input type="number" value={selectedBatch?.available_bottles ?? selectedBatch?.current_bottles_count ?? ''} readOnly className="bg-gray-100" />
              </div>
            )}
            <div className="space-y-2">
              <Label>New Quantity *</Label>
              <Input type="number" value={form.noOfBottles} onChange={(e) => updateForm('noOfBottles', e.target.value)} />
            </div>
            {initialData && (
              <>
                <div className="space-y-2">
                  <Label>Contamination Count</Label>
                  <Input type="number" value={form.contamination} onChange={(e) => handleContaminationChange(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Remaining Bottles (After Contamination)</Label>
                  <Input type="number" value={form.remainingBottles} readOnly className="bg-gray-100" />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Operator Assignment</p>
          <OperatorSelector operators={operators} selectedIds={form.operatorIds} onChange={(ids) => updateForm('operatorIds', ids)} />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Additional Information</p>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} />
          </div>
        </div>
      </div>
      
      <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          {initialData && onDelete && (
            <Button variant="destructive" onClick={() => onDelete(form.id)}>
              <Trash2 className="w-4 h-4 mr-2" />Delete
            </Button>
          )}
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>Save</Button>
        </div>
      </div>
    </ModalLayout>
  );
}
