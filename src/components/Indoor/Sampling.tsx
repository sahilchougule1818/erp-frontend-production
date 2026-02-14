import { CRUDTable } from './shared/CRUDTable';
import { Badge } from '../ui/badge';
import * as indoorApi from '../../services/indoorApi';

// Field configuration for sampling form - defines all input fields for sample tracking
const FIELDS = [
  { key: 'sampleDate', label: 'Sample Date', type: 'date' },
  { key: 'cropName', label: 'Crop Name', placeholder: 'Rose' },
  { key: 'batchName', label: 'Batch Name', placeholder: 'B-2024-1145' },
  { key: 'stage', label: 'Stage', placeholder: 'Subculturing' },
  { key: 'tunnelNo', label: 'Tunnel No', placeholder: 'T1' },
  { key: 'trayBedNo', label: 'Tray/Bed No', placeholder: 'Tray 12' },
  { key: 'sentDate', label: 'Sent Date', type: 'date' },
  { key: 'receivedDate', label: 'Received Date', type: 'date' },
  { key: 'status', label: 'Status', placeholder: 'Approved/Rejected' },
  { key: 'govtCertificate', label: 'Govt Certificate', placeholder: 'Yes/No' },
  { key: 'certificateNo', label: 'Certificate No', placeholder: 'CERT-001' },
  { key: 'reason', label: 'Reason (if rejected)', type: 'textarea', span: 2 }
];

/**
 * Sampling component - Manages sample records sent for government certification
 * Tracks sample dates, crop/batch info, tunnel/tray details, sent/received dates, and certification status
 */
export function Sampling() {
  return (
    <CRUDTable
      title="Sampling"
      fields={FIELDS}
      columns={['Sample Date', 'Crop Name', 'Batch Name', 'Stage', 'Tunnel No', 'Tray/Bed No', 'Sent Date', 'Received Date', 'Status', 'Govt Certificate', 'Certificate No', 'Reason']}
      dataKeys={['sample_date', 'crop_name', 'batch_name', 'stage', 'tunnel_no', 'tray_bed_no', 'sent_date', 'received_date', 'status', 'govt_certificate', 'certificate_no', 'reason']}
      api={{
        get: indoorApi.getSampling,      // Fetch all sampling records
        create: indoorApi.createSampling, // Create new sample record
        update: indoorApi.updateSampling, // Update existing sample
        delete: indoorApi.deleteSampling  // Delete sample record
      }}
      // Maps database record to form fields
      mapToForm={(r) => ({
        id: r.id,
        sampleDate: r.sample_date,
        cropName: r.crop_name,
        batchName: r.batch_name,
        stage: r.stage,
        tunnelNo: r.tunnel_no,
        trayBedNo: r.tray_bed_no,
        sentDate: r.sent_date,
        receivedDate: r.received_date,
        status: r.status,
        govtCertificate: r.govt_certificate,
        certificateNo: r.certificate_no,
        reason: r.reason
      })}
      // Maps form fields to API payload format
      mapToPayload={(f) => ({
        sampleDate: f.sampleDate,
        cropName: f.cropName,
        batchName: f.batchName,
        stage: f.stage,
        tunnelNo: f.tunnelNo,
        trayBedNo: f.trayBedNo,
        sentDate: f.sentDate,
        receivedDate: f.receivedDate,
        status: f.status,
        govtCertificate: f.govtCertificate,
        certificateNo: f.certificateNo,
        reason: f.reason
      })}
      // Custom cell rendering - displays status as colored badge (green for Approved, red for Rejected)
      renderCell={(key, value) => {
        if (key === 'status') return <Badge className={value === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{value}</Badge>;
        return value;
      }}
      // Filter configuration - enables filtering by sample date and batch name
      filterFields={{ field1Key: 'sample_date', field1Label: 'Date', field2Key: 'batch_name', field2Label: 'Batch Name' }}
    />
  );
}
