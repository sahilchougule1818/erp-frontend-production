import { CRUDTable } from './shared/CRUDTable';
import { Badge } from '../ui/badge';
import * as indoorApi from '../../services/indoorApi';
import { useIndoorBatches } from '../../hooks/useIndoorBatches';

export function Sampling() {
  const { batches } = useIndoorBatches();
  
  const FIELDS = [
    { key: 'sampleDate', label: 'Sample Date', type: 'date' },
    { key: 'cropName', label: 'Crop Name', readOnly: true },
    { 
      key: 'batchName', 
      label: 'Batch Name', 
      type: 'select', 
      options: batches,
      onChange: (value, setForm, form) => {
        const selected = batches.find(b => b.value === value);
        if (selected) {
          const cropName = selected.label.split('(')[1]?.replace(')', '') || '';
          setForm({...form, batchName: value, cropName});
        }
      }
    },
  { key: 'stage', label: 'Stage', placeholder: 'Subculturing' },
  { key: 'sentDate', label: 'Sent Date', type: 'date' },
  { key: 'receivedDate', label: 'Received Date', type: 'date' },
  { key: 'status', label: 'Status', placeholder: 'Approved/Rejected' },
  { key: 'govtCertificate', label: 'Govt Certificate', placeholder: 'Yes/No' },
  { key: 'certificateNo', label: 'Certificate No', placeholder: 'CERT-001' },
  { key: 'reason', label: 'Reason (if rejected)', type: 'textarea', span: 2 }
];

  return (
    <div className="p-6">
      <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-6">
        <div className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm bg-background text-foreground shadow-sm">
          Sampling
        </div>
      </div>
      <CRUDTable
      title=""
      fields={FIELDS}
      columns={['Sample Date', 'Crop Name', 'Batch Name', 'Stage', 'Sent Date', 'Received Date', 'Status', 'Govt Certificate', 'Certificate No', 'Reason']}
      dataKeys={['sample_date', 'crop_name', 'batch_code', 'stage', 'sent_date', 'received_date', 'status', 'govt_certificate', 'certificate_no', 'reason']}
      api={{
        get: indoorApi.getSampling,
        create: indoorApi.createSampling,
        update: indoorApi.updateSampling,
        delete: indoorApi.deleteSampling
      }}
      mapToForm={(r) => ({
        id: r.id,
        sampleDate: r.sample_date,
        cropName: r.crop_name,
        batchName: r.batch_code,
        stage: r.stage,
        sentDate: r.sent_date,
        receivedDate: r.received_date,
        status: r.status,
        govtCertificate: r.govt_certificate,
        certificateNo: r.certificate_no,
        reason: r.reason
      })}
      mapToPayload={(f) => ({
        sampleDate: f.sampleDate,
        cropName: f.cropName,
        batchName: f.batchName,
        stage: f.stage,
        sentDate: f.sentDate,
        receivedDate: f.receivedDate,
        status: f.status,
        govtCertificate: f.govtCertificate,
        certificateNo: f.certificateNo,
        reason: f.reason
      })}
      renderCell={(key, value) => {
        if (key === 'sample_date' && value) return value.split('T')[0];
        if (key === 'sent_date' && value) return value.split('T')[0];
        if (key === 'received_date' && value) return value.split('T')[0];
        if (key === 'status') return <Badge className={value === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{value}</Badge>;
        return value;
      }}
      filterFields={{ field1Key: 'sample_date', field1Label: 'Date', field2Key: 'batch_code', field2Label: 'Batch Name' }}
      section="Sampling"
    />
    </div>
  );
}
