import { CRUDTable } from './shared/CRUDTable';
import { Badge } from '../ui/badge';
import * as indoorApi from '../../services/indoorApi';

const FIELDS = [
  { key: 'sampleDate', label: 'Sample Date', type: 'date' },
  { key: 'cropName', label: 'Crop Name', placeholder: 'Rose' },
  { key: 'batchName', label: 'Batch Name', placeholder: 'B-2024-1145' },
  { key: 'stage', label: 'Stage', placeholder: 'Subculturing' },
  { key: 'sentDate', label: 'Sent Date', type: 'date' },
  { key: 'receivedDate', label: 'Received Date', type: 'date' },
  { key: 'status', label: 'Status', placeholder: 'Approved/Rejected' },
  { key: 'govtCertificate', label: 'Govt Certificate', placeholder: 'Yes/No' },
  { key: 'certificateNo', label: 'Certificate No', placeholder: 'CERT-001' },
  { key: 'reason', label: 'Reason (if rejected)', type: 'textarea', span: 2 }
];

export function Sampling() {
  return (
    <CRUDTable
      title=""
      fields={FIELDS}
      columns={['Sample Date', 'Crop Name', 'Batch Name', 'Stage', 'Sent Date', 'Received Date', 'Status', 'Govt Certificate', 'Certificate No', 'Reason']}
      dataKeys={['sample_date', 'crop_name', 'batch_name', 'stage', 'sent_date', 'received_date', 'status', 'govt_certificate', 'certificate_no', 'reason']}
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
        batchName: r.batch_name,
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
      filterFields={{ field1Key: 'sample_date', field1Label: 'Date', field2Key: 'batch_name', field2Label: 'Batch Name' }}
    />
  );
}
