import { useState } from 'react';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Textarea } from '../../../shared/ui/textarea';
import { Button } from '../../../shared/ui/button';
import { Alert, AlertDescription } from '../../../shared/ui/alert';
import { Info } from 'lucide-react';
import { ModalLayout } from '../../../shared/components/ModalLayout';

interface PartialRootingFormProps {
  record: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function PartialRootingForm({ record, onSubmit, onCancel }: PartialRootingFormProps) {
  const [bottlesToRoot, setBottlesToRoot] = useState('');
  const [notes, setNotes] = useState('');

  // Available bottles = qty_available from batch master (already accounts for contamination, rooting, and sales)
  const availableBottles = record.qty_available ?? record.current_qty_in ?? 0;

  const handleSubmit = () => {
    const bottles = parseInt(bottlesToRoot);
    
    if (!bottles || bottles <= 0) {
      alert('Please enter a valid number of bottles');
      return;
    }
    
    if (bottles > availableBottles) {
      alert(`Cannot root more than ${availableBottles} bottles`);
      return;
    }

    onSubmit({
      batchCode: record.batch_code,
      sourceRecordId: record.id,
      bottlesCount: bottles,
      notes
    });
  };

  return (
    <ModalLayout title="Make Partial Rooting">
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            A new batch will be created with code: <strong>{record.batch_code}-R(n)</strong>
            <br />
            The new batch will enter the <strong>Rooting Stage</strong> (terminal stage).
          </AlertDescription>
        </Alert>

        <div className="bg-gray-50 border rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Original Batch</div>
              <div className="font-semibold text-lg">{record.batch_code}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Plant Name</div>
              <div className="font-semibold text-lg">{record.plant_name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Current Stage</div>
              <div className="font-semibold">{record.to_stage || record.next_stage}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Available Bottles</div>
              <div className="font-semibold text-green-600">{availableBottles}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Bottles to Root *</Label>
            <Input 
              type="number" 
              min="1"
              max={availableBottles}
              value={bottlesToRoot}
              onChange={(e) => setBottlesToRoot(e.target.value)}
              placeholder={`Max: ${availableBottles}`}
            />
            <p className="text-xs text-gray-500">
              Remaining in original batch: {availableBottles - (parseInt(bottlesToRoot) || 0)}
            </p>
          </div>

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
            disabled={!bottlesToRoot || parseInt(bottlesToRoot) <= 0}
          >
            Create Rooted Batch
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
}
