import React from 'react';
import { CRUDTable } from '../Indoor/shared/CRUDTable';
import { outdoorApi } from '../../services/outdoorApi';
import { useIndoorBatches } from '../../hooks/useIndoorBatches';

export function Fertilization() {
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
    { key: 'activityType', label: 'Activity Type' },
    { key: 'materialsUsed', label: 'Materials Used' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'operatorName', label: 'Operator Name' },
    { key: 'notes', label: 'Notes', type: 'textarea', span: 2 }
  ];

  return (
    <CRUDTable
      title="Fertilization"
      fields={fields}
      columns={['Date', 'Crop Name', 'Batch Name', 'Activity Type', 'Materials Used', 'Quantity', 'Operator Name', 'Notes']}
      dataKeys={['date', 'crop_name', 'batch_code', 'activity_type', 'materials_used', 'quantity', 'operator_name', 'notes']}
      api={{
        get: outdoorApi.fertilization.getAll,
        create: outdoorApi.fertilization.create,
        update: outdoorApi.fertilization.update,
        delete: outdoorApi.fertilization.delete
      }}
      mapToForm={(record) => ({
        date: record.date,
        cropName: record.crop_name,
        batchName: record.batch_code,
        activityType: record.activity_type,
        materialsUsed: record.materials_used,
        quantity: record.quantity,
        operatorName: record.operator_name,
        notes: record.notes
      })}
      mapToPayload={(form) => ({
        date: form.date,
        cropName: form.cropName,
        batchName: form.batchName,
        activityType: form.activityType,
        materialsUsed: form.materialsUsed,
        quantity: form.quantity,
        operatorName: form.operatorName,
        notes: form.notes
      })}
      filterFields={{ field1Key: 'crop_name', field1Label: 'Crop Name', field2Key: 'batch_code', field2Label: 'Batch Name' }}
    />
  );
}
