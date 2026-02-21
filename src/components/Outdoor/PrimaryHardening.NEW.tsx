import React, { useState } from 'react';
import { CRUDTable } from '../Indoor/shared/CRUDTable';
import { Badge } from '../ui/badge';
import { outdoorApi } from '../../services/outdoorApi';
import { Plus, Trash2 } from 'lucide-react';
import { useOutdoorBatches } from '../../hooks/useOutdoorBatches';

interface TraySize {
  id: string;
  name: string;
  cavityCount: number;
  quantity: number;
}

export function PrimaryHardening() {
  const [traySizes, setTraySizes] = useState<TraySize[]>([]);
  const [newTraySize, setNewTraySize] = useState({ cavityCount: '', quantity: '' });
  const { batches } = useOutdoorBatches();

  const calculatePlants = () => {
    return traySizes.reduce((total, tray) => total + (tray.cavityCount * tray.quantity), 0);
  };

  const addTraySize = () => {
    if (!newTraySize.cavityCount || !newTraySize.quantity) return;
    setTraySizes([...traySizes, {
      id: Date.now().toString(),
      name: `T${newTraySize.cavityCount}`,
      cavityCount: parseInt(newTraySize.cavityCount),
      quantity: parseInt(newTraySize.quantity)
    }]);
    setNewTraySize({ cavityCount: '', quantity: '' });
  };

  const removeTraySize = (id: string) => {
    setTraySizes(traySizes.filter(t => t.id !== id));
  };

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
    { key: 'tunnel', label: 'Tunnel', type: 'select', options: Array.from({length: 48}, (_, i) => ({value: `T-${i+1}`, label: `T-${i+1}`})) },
    { key: 'workers', label: 'Workers', type: 'number' },
    { key: 'waitingPeriod', label: 'Waiting Period (days)', type: 'number' },
    { 
      key: 'trayManagement', 
      label: 'Tray Management', 
      type: 'custom',
      span: 2,
      render: () => (
        <div className="col-span-2 space-y-2">
          <div className="space-y-2">
            {traySizes.map((tray) => (
              <div key={tray.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-sm font-medium">{tray.name}</span>
                <span className="text-sm text-gray-600">Cavity: {tray.cavityCount}</span>
                <span className="text-sm text-gray-600">Qty: {tray.quantity}</span>
                <span className="text-sm font-medium">= {tray.cavityCount * tray.quantity} plants</span>
                <button type="button" onClick={() => removeTraySize(tray.id)} className="ml-auto text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Cavity count" 
              value={newTraySize.cavityCount} 
              onChange={(e) => setNewTraySize({...newTraySize, cavityCount: e.target.value})} 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input 
              type="number" 
              placeholder="Quantity" 
              value={newTraySize.quantity} 
              onChange={(e) => setNewTraySize({...newTraySize, quantity: e.target.value})} 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button 
              type="button" 
              onClick={addTraySize} 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-sm font-medium">
            Total Plants: {calculatePlants()}
          </div>
        </div>
      )
    },
    { key: 'notes', label: 'Notes', type: 'textarea', span: 2 }
  ];

  const customMapToPayload = (form: any) => {
    const cleanTrays = traySizes.map(tray => ({
      name: tray.name,
      cavityCount: tray.cavityCount,
      quantity: tray.quantity
    }));
    
    return {
      date: form.date,
      cropName: form.cropName,
      batchName: form.batchName,
      tunnel: form.tunnel,
      workers: form.workers,
      waitingPeriod: form.waitingPeriod,
      trays: cleanTrays,
      notes: form.notes
    };
  };

  const customMapToForm = async (record: any) => {
    try {
      const response = await outdoorApi.primaryHardening.getTrayDetails(record.id);
      const trayData = response.data.map((t: any) => ({
        id: Date.now().toString() + Math.random(),
        name: t.tray_name,
        cavityCount: t.cavity_count,
        quantity: t.quantity
      }));
      setTraySizes(trayData);
    } catch {
      setTraySizes([]);
    }
    return {
      id: record.id,
      date: record.date,
      cropName: record.crop_name,
      batchName: record.batch_code,
      tunnel: record.tunnel,
      workers: record.workers,
      waitingPeriod: record.waiting_period,
      notes: record.notes
    };
  };

  const renderCell = (key: string, value: any, record: any) => {
    if (key === 'tray_count') {
      return record.tray_display || '0';
    }
    if (key === 'batch_code') {
      return <Badge variant="outline" className="bg-green-50 text-green-700">{value}</Badge>;
    }
    if (key.includes('date') && value) {
      return value.split('T')[0];
    }
    return value;
  };

  return (
    <CRUDTable
      title="Primary Hardening Register"
      fields={fields}
      columns={['Date', 'Crop Name', 'Batch Name', 'Tunnel', 'Tray Count', 'Plants', 'Workers', 'Waiting Period', 'Notes']}
      dataKeys={['date', 'crop_name', 'batch_code', 'tunnel', 'tray_count', 'plants', 'workers', 'waiting_period', 'notes']}
      api={{
        get: outdoorApi.primaryHardening.getAll,
        create: outdoorApi.primaryHardening.create,
        update: outdoorApi.primaryHardening.update,
        delete: outdoorApi.primaryHardening.delete
      }}
      mapToForm={customMapToForm}
      mapToPayload={customMapToPayload}
      renderCell={renderCell}
      filterFields={{ field1Key: 'crop_name', field1Label: 'Crop Name', field2Key: 'batch_code', field2Label: 'Batch Name' }}
      section="Outdoor"
    />
  );
}
