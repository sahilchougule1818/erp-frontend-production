import React from 'react';
import { CRUDTable } from '../Indoor/shared/CRUDTable';
import { outdoorApi } from '../../services/outdoorApi';
import { useIndoorBatches } from '../../hooks/useIndoorBatches';

export function Shifting() {
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
    { key: 'oldLocation', label: 'Old Location' },
    { key: 'newLocation', label: 'New Location' },
    { key: 'plants', label: 'Plants', type: 'number' },
    { key: 'reason', label: 'Reason' },
    { key: 'notes', label: 'Notes', type: 'textarea', span: 2 }
  ];

  return (
    <CRUDTable
      title="Shifting"
      fields={fields}
      columns={['Date', 'Crop Name', 'Batch Name', 'Old Location', 'New Location', 'Plants', 'Reason', 'Notes']}
      dataKeys={['date', 'crop_name', 'batch_code', 'old_location', 'new_location', 'plants', 'reason', 'notes']}
      api={{
        get: outdoorApi.shifting.getAll,
        create: outdoorApi.shifting.create,
        update: outdoorApi.shifting.update,
        delete: outdoorApi.shifting.delete
      }}
      mapToForm={(record) => ({
        date: record.date,
        cropName: record.crop_name,
        batchName: record.batch_code,
        oldLocation: record.old_location,
        newLocation: record.new_location,
        plants: record.plants,
        reason: record.reason,
        notes: record.notes
      })}
      mapToPayload={(form) => ({
        date: form.date,
        cropName: form.cropName,
        batchName: form.batchName,
        oldLocation: form.oldLocation,
        newLocation: form.newLocation,
        plants: form.plants,
        reason: form.reason,
        notes: form.notes
      })}
      filterFields={{ field1Key: 'crop_name', field1Label: 'Crop Name', field2Key: 'batch_code', field2Label: 'Batch Name' }}
    />
  );
}
