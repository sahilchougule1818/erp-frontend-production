import { useState, useEffect } from 'react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Label } from '../../shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';

interface ReportSamplingFormProps {
  initialData: any;
  batches: any[];
  onSubmit: (data: any) => void;
  onDelete?: (id: number) => void;
  onCancel: () => void;
}

export function ReportSamplingForm({ initialData, batches, onSubmit, onDelete, onCancel }: ReportSamplingFormProps) {
  const [form, setForm] = useState({
    sampleDate: '',
    batchName: '',
    cropName: '',
    stage: '',
    receivedDate: '',
    status: '',
    govtCertificate: '',
    certificateNo: '',
    governmentDigitalCode: '',
    reason: ''
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        sampleDate: initialData.sample_date?.split('T')[0] || '',
        batchName: initialData.batch_code || '',
        cropName: initialData.plant_name || '',
        stage: initialData.stage || '',
        receivedDate: initialData.received_date?.split('T')[0] || '',
        status: initialData.status || '',
        govtCertificate: initialData.govt_certificate || '',
        certificateNo: initialData.certificate_number || '',
        governmentDigitalCode: initialData.government_digital_code || '',
        reason: initialData.reason || ''
      });
    }
  }, [initialData]);

  const handleSubmit = () => {
    onSubmit({ ...form, id: initialData?.id });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sample Date</Label>
          <Input type="date" value={form.sampleDate} onChange={(e) => setForm({...form, sampleDate: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Batch Name</Label>
          <Select value={form.batchName} onValueChange={(v) => setForm({...form, batchName: v})}>
            <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
            <SelectContent>
              {batches.map((b: any) => (
                <SelectItem key={b.batch_code} value={b.batch_code}>{b.batch_code} ({b.plant_name})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Plant Name</Label>
          <Input value={form.cropName} readOnly className="bg-gray-100" />
        </div>
        <div className="space-y-2">
          <Label>Stage</Label>
          <Input value={form.stage} readOnly className="bg-gray-100" />
        </div>
        <div className="space-y-2">
          <Label>Received Date</Label>
          <Input type="date" value={form.receivedDate} onChange={(e) => setForm({...form, receivedDate: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Pass">Pass</SelectItem>
              <SelectItem value="Fail">Fail</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Govt Certificate</Label>
          <Select value={form.govtCertificate} onValueChange={(v) => setForm({...form, govtCertificate: v})}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Certificate Number</Label>
          <Input value={form.certificateNo} onChange={(e) => setForm({...form, certificateNo: e.target.value})} disabled={form.govtCertificate !== 'true'} />
        </div>
        <div className="space-y-2">
          <Label>Government Digital Code</Label>
          <Input value={form.governmentDigitalCode} onChange={(e) => setForm({...form, governmentDigitalCode: e.target.value})} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Reason</Label>
          <Input value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        {initialData && onDelete && <Button variant="destructive" onClick={() => onDelete(initialData.id)}>Delete</Button>}
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  );
}
