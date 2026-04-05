import { useState } from 'react';
import { useIncubationData } from '../hooks/useIncubationData';
import { DataTable } from '../../shared/components/DataTable';
import { IncubationEditModal } from '../components/IncubationEditModal';
import { Badge } from '../../shared/ui/badge';

export function Incubation() {
  const { records, refetch, pagination } = useIncubationData();
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const columns = [
    { key: 'incubation_date', label: 'Incubation Date', render: (val: string) => val?.split('T')[0] },
    { key: 'stage', label: 'Stage' },
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'media_code', label: 'Media Code', render: (val: string) => val ? <Badge variant="outline" className="bg-green-50 text-green-700">{val}</Badge> : <span className="text-gray-400">-</span> },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'current_bottles_count', label: 'Bottles Entered' },
    { 
      key: 'contamination_count', 
      label: 'Contamination', 
      render: (val: number) => <span className={val > 0 ? "text-red-600 font-semibold" : ""}>{val || 0}</span> 
    },
    {
      key: 'current_sold',
      label: 'Current Sold',
      render: (val: number) => <span className={val > 0 ? 'font-semibold text-red-600' : 'text-slate-400'}>{val || 0}</span>
    },
    { key: 'available_bottles', label: 'Remaining' },
    { key: 'incubation_period', label: 'Period (Days)' },
    { key: 'temperature', label: 'Temp' },
    { key: 'humidity', label: 'Humidity' },
    { key: 'light_intensity', label: 'Light Intensity' },
    {
      key: 'state',
      label: 'Status',
      render: (val: string) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          val === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          val === 'OUTDOOR_READY' ? 'bg-orange-100 text-orange-800' :
          val === 'SOLD_OUT' ? 'bg-rose-100 text-rose-800' :
          val === 'AT_OUTDOOR' ? 'bg-purple-100 text-purple-800' :
          val === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {val}
        </span>
      )
    }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Incubation Register"
        columns={columns}
        records={records}
        onEdit={(record) => { if (record.state === 'ACTIVE') setEditingRecord(record); }}
        filterConfig={{
          filter1Key: 'plant_name',
          filter1Label: 'Plant Name',
          filter2Key: 'batch_code',
          filter2Label: 'Batch Name'
        }}
        exportFileName="incubation_records"
        pagination={pagination}
      />

      {editingRecord && (
        <IncubationEditModal 
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
