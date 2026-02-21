import React from 'react';
import { CRUDTable } from '../Indoor/shared/CRUDTable';
import { outdoorApi } from '../../services/outdoorApi';
import { useIndoorBatches } from '../../hooks/useIndoorBatches';

export function OutdoorSampling() {
  const { batches } = useIndoorBatches();
  
  const fields = [
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
    { key: 'stage', label: 'Stage' },
    { key: 'sentDate', label: 'Sent Date', type: 'date' },
    { key: 'receivedDate', label: 'Received Date', type: 'date' },
    { key: 'status', label: 'Status' },
    { key: 'govtCertificate', label: 'Govt Certificate' },
    { key: 'certificateNo', label: 'Certificate No' },
    { key: 'reason', label: 'Reason', type: 'textarea', span: 2 }
  ];

  return (
    <CRUDTable
      title="Outdoor Sampling"
      fields={fields}
      columns={['Sample Date', 'Crop Name', 'Batch Name', 'Stage', 'Sent Date', 'Received Date', 'Status', 'Govt Certificate', 'Certificate No', 'Reason']}
      dataKeys={['sample_date', 'crop_name', 'batch_code', 'stage', 'sent_date', 'received_date', 'status', 'govt_certificate', 'certificate_no', 'reason']}
      api={{
        get: outdoorApi.outdoorSampling.getAll,
        create: outdoorApi.outdoorSampling.create,
        update: outdoorApi.outdoorSampling.update,
        delete: outdoorApi.outdoorSampling.delete
      }}
      mapToForm={(record) => ({
        sampleDate: record.sample_date,
        cropName: record.crop_name,
        batchName: record.batch_code,
        stage: record.stage,
        sentDate: record.sent_date,
        receivedDate: record.received_date,
        status: record.status,
        govtCertificate: record.govt_certificate,
        certificateNo: record.certificate_no,
        reason: record.reason
      })}
      mapToPayload={(form) => ({
        sampleDate: form.sampleDate,
        cropName: form.cropName,
        batchName: form.batchName,
        stage: form.stage,
        sentDate: form.sentDate,
        receivedDate: form.receivedDate,
        status: form.status,
        govtCertificate: form.govtCertificate,
        certificateNo: form.certificateNo,
        reason: form.reason
      })}
      filterFields={{ field1Key: 'crop_name', field1Label: 'Crop Name', field2Key: 'batch_code', field2Label: 'Batch Name' }}
    />
  );
}
