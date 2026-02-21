import React, { useState, useEffect } from 'react';
import { CRUDTable } from '../Indoor/shared/CRUDTable';
import { outdoorApi } from '../../services/outdoorApi';
import { useIndoorBatches } from '../../hooks/useIndoorBatches';

export function SecondaryHardening() {
  const [primaryRecords, setPrimaryRecords] = useState<any[]>([]);
  const { batches } = useIndoorBatches();

  useEffect(() => {
    loadPrimaryRecords();
  }, []);

  const loadPrimaryRecords = async () => {
    try {
      const res = await outdoorApi.primaryHardening.getAll();
      setPrimaryRecords(res.data);
    } catch (error) {
      console.error('Error loading primary records:', error);
    }
  };

  const loadBatches = async () => {
    try {
      const res = await outdoorApi.primaryHardening.getAll();
      setPrimaryRecords(res.data);
    } catch (error) {
      console.error('Error loading primary records:', error);
    }
  };

  const fields = [
    { key: 'transferDate', label: 'Transfer Date', type: 'date' },
    { key: 'cropName', label: 'Crop Name', readOnly: true },
    { 
      key: 'batchName', 
      label: 'Batch Name', 
      type: 'select', 
      options: batches,
      onChange: (batchName, formSetter, currentForm) => {
        const selected = batches.find(b => b.value === batchName);
        const cropName = selected ? selected.label.split('(')[1]?.replace(')', '') || '' : '';
        const match = primaryRecords.find(r => r.batch_code === batchName);
        if (match) {
          formSetter({ ...currentForm, batchName, cropName, fromLocation: match.tunnel || '', plants: match.plants || 0 });
        } else {
          formSetter({ ...currentForm, batchName, cropName, fromLocation: '', plants: 0 });
        }
      }
    },
    { key: 'fromLocation', label: 'From Tunnel', readOnly: true },
    { key: 'toBed', label: 'Secondary Unit' },
    { key: 'plants', label: 'Plants', type: 'number', readOnly: true },
    { key: 'notes', label: 'Notes', type: 'textarea', span: 2 }
  ];

  return (
    <CRUDTable
      title="Secondary Hardening"
      fields={fields}
      columns={['Transfer Date', 'Crop Name', 'Batch Name', 'From Tunnel', 'Secondary Unit', 'Plants', 'Notes']}
      dataKeys={['transfer_date', 'crop_name', 'batch_code', 'from_location', 'to_bed', 'plants', 'notes']}
      api={{
        get: outdoorApi.secondaryHardening.getAll,
        create: outdoorApi.secondaryHardening.create,
        update: outdoorApi.secondaryHardening.update,
        delete: outdoorApi.secondaryHardening.delete
      }}
      mapToForm={(record) => ({
        transferDate: record.transfer_date,
        cropName: record.crop_name,
        batchName: record.batch_code,
        fromLocation: record.from_location,
        toBed: record.to_bed,
        plants: record.plants,
        notes: record.notes
      })}
      mapToPayload={(form) => ({
        transferDate: form.transferDate,
        cropName: form.cropName,
        batchName: form.batchName,
        fromLocation: form.fromLocation,
        toBed: form.toBed,
        plants: form.plants,
        notes: form.notes
      })}
      filterFields={{ field1Key: 'crop_name', field1Label: 'Crop Name', field2Key: 'batch_code', field2Label: 'Batch Name' }}
    />
  );
}
