import React from 'react';
import { CRUDTable } from '../Indoor/shared/CRUDTable';
import { outdoorApi } from '../../services/outdoorApi';
import { useIndoorBatches } from '../../hooks/useIndoorBatches';

export function Mortality() {
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
    { key: 'mortalityType', label: 'Mortality Type' },
    { key: 'affectedPlants', label: 'Affected Plants', type: 'number' },
    { key: 'actionTaken', label: 'Action Taken', type: 'textarea' },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ];

  return (
    <CRUDTable
      title="Outdoor Mortality"
      fields={fields}
      columns={['Date', 'Crop Name', 'Batch Name', 'Location', 'Mortality Type', 'Affected Plants', 'Action Taken', 'Notes']}
      dataKeys={['date', 'crop_name', 'batch_code', 'location', 'mortality_type', 'affected_plants', 'action_taken', 'notes']}
      api={{
        get: outdoorApi.outdoorMortality.getAll,
        create: outdoorApi.outdoorMortality.create,
        update: outdoorApi.outdoorMortality.update,
        delete: outdoorApi.outdoorMortality.delete
      }}
      mapToForm={(record) => ({
        date: record.date,
        cropName: record.crop_name,
        batchName: record.batch_code,
        location: record.location,
        mortalityType: record.mortality_type,
        affectedPlants: record.affected_plants,
        actionTaken: record.action_taken,
        notes: record.notes
      })}
      mapToPayload={(form) => ({
        date: form.date,
        cropName: form.cropName,
        batchName: form.batchName,
        location: form.location,
        mortalityType: form.mortalityType,
        affectedPlants: form.affectedPlants,
        actionTaken: form.actionTaken,
        notes: form.notes
      })}
      filterFields={{ field1Key: 'crop_name', field1Label: 'Crop Name', field2Key: 'batch_code', field2Label: 'Batch Name' }}
    />
  );
}
