import { useState } from 'react';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Textarea } from '../../../shared/ui/textarea';
import { Button } from '../../../shared/ui/button';
import { Alert, AlertDescription } from '../../../shared/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { ModalLayout } from '../../../shared/components/ModalLayout';

interface FullRootingFormProps {
  record: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function FullRootingForm({ record, onSubmit, onCancel }: FullRootingFormProps) {
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({
      batchCode: record.batch_code,
      sourceRecordId: record.id,
      notes
    });
  };

  return (
    <ModalLayout title="Move Full Batch to Rooting">
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        <Alert className="bg-orange-50 border-orange-200">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            The entire batch <strong>{record.batch_code}</strong> will be moved to the <strong>Rooting Stage</strong> (terminal stage).
            <br />
            The batch code will remain the same. This is the final stage before outdoor export.
          </AlertDescription>
        </Alert>

        <div className="bg-gray-50 border rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Batch Code</div>
              <div className="font-semibold text-lg">{record.batch_code}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Plant Name</div>
              <div className="font-semibold text-lg">{record.plant_name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Current Stage</div>
              <div className="font-semibold">{record.stage}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Bottles</div>
              <div className="font-semibold text-green-600">{record.current_qty_in}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this rooting operation"
              rows={3}
            />
          </div>
        </div>
      </div>
      
      <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button 
            className="bg-orange-600 hover:bg-orange-700" 
            onClick={handleSubmit}
          >
            Move to Rooting
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
}
