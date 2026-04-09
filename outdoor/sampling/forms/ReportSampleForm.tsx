import React, { useState } from 'react';
import { Label } from '../../shared/ui/label';
import { Input } from '../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { Textarea } from '../../shared/ui/textarea';
import { Button } from '../../shared/ui/button';
import { ModalLayout } from '../../shared/components/ModalLayout';

interface ReportSampleFormProps {
  batch: { batch_code: string };
  onClose: () => void;
  onSubmit: (data: { resultDate: string; status: string; certificateNumber: string; govtCode: string; notes: string }) => void;
}

export const ReportSampleForm: React.FC<ReportSampleFormProps> = ({ batch, onClose, onSubmit }) => {
  const [resultDate, setResultDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [govtCode, setGovtCode] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!status) {
      alert('Please select a status');
      return;
    }
    if (status === 'Yes' && !certificateNumber) {
      alert('Certificate number is required when status is Yes');
      return;
    }
    onSubmit({ resultDate, status, certificateNumber, govtCode, notes });
  };

  return (
    <ModalLayout title="Report Sample Result">
      <div className="px-6 py-4 max-w-lg mx-auto">
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-base text-gray-700">Batch Information</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-base text-gray-600">
                Batch Code: <span className="font-semibold text-gray-900">{batch.batch_code}</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-gray-700">Result Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Result Date *</Label>
                <Input 
                  type="date" 
                  value={resultDate} 
                  onChange={(e) => setResultDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Status *</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-gray-700">Certificate Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Certificate No {status === 'Yes' && '*'}</Label>
                <Input 
                  value={certificateNumber} 
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  disabled={status !== 'Yes'}
                  placeholder="Enter certificate number"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Govt Code</Label>
                <Input 
                  value={govtCode} 
                  onChange={(e) => setGovtCode(e.target.value)}
                  disabled={status !== 'Yes'}
                  placeholder="Enter government code"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-gray-700">Additional Information</h3>
            <div className="space-y-2">
              <Label className="text-sm">Notes</Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Enter result notes"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Submit Result
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
};
