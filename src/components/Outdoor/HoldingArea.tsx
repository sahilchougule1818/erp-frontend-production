import React from 'react';
import { CRUDTable } from '../Indoor/shared/CRUDTable';
import { outdoorApi } from '../../services/outdoorApi';
import { useIndoorBatches } from '../../hooks/useIndoorBatches';

export function HoldingArea() {
  const { batches } = useIndoorBatches();
  
  const fields = [
    { key: 'date', label: 'Date', type: 'date' },
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
    { key: 'location', label: 'Location' },
    { key: 'plants', label: 'Plants', type: 'number' },
    { key: 'status', label: 'Status' },
    { key: 'expectedDispatch', label: 'Expected Dispatch', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'textarea', span: 2 }
  ];

  return (
    <CRUDTable
      title="Holding Area"
      fields={fields}
      columns={['Date', 'Crop Name', 'Batch Name', 'Location', 'Plants', 'Status', 'Expected Dispatch', 'Notes']}
      dataKeys={['date', 'crop_name', 'batch_code', 'location', 'plants', 'status', 'expected_dispatch', 'notes']}
      api={{
        get: outdoorApi.holdingArea.getAll,
        create: outdoorApi.holdingArea.create,
        update: outdoorApi.holdingArea.update,
        delete: outdoorApi.holdingArea.delete
      }}
      mapToForm={(record) => ({
        date: record.date,
        cropName: record.crop_name,
        batchName: record.batch_code,
        location: record.location,
        plants: record.plants,
        status: record.status,
        expectedDispatch: record.expected_dispatch,
        notes: record.notes
      })}
      mapToPayload={(form) => ({
        date: form.date,
        cropName: form.cropName,
        batchName: form.batchName,
        location: form.location,
        plants: form.plants,
        status: form.status,
        expectedDispatch: form.expectedDispatch,
        notes: form.notes
      })}
      filterFields={{ field1Key: 'crop_name', field1Label: 'Crop Name', field2Key: 'batch_code', field2Label: 'Batch Name' }}
    />
  );
}
