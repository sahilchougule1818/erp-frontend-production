import { useState } from 'react';
import { useIncubationData } from '../hooks/useIncubationData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { DataTable } from '../../../shared/components/DataTable';
import { IncubationEditModal } from '../components/IncubationEditModal';
import { Badge } from '../../../shared/ui/badge';

export function Incubation() {
  const { records, refetch, pagination } = useIncubationData();
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const columns = [
    { key: 'incubation_date', label: 'Incubation Date', render: (val: string) => val?.split('T')[0] },
    { key: 'stage', label: 'Stage' },
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'media_code', label: 'Media Code', render: (val: string) => <span className="text-base">{val || '-'}</span> },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'current_bottles_count', label: 'Bottles Entered' },
    { 
      key: 'contamination_count', 
      label: 'Contamination', 
      render: (val: number) => <span className="text-red-600 text-base">{val || 0}</span> 
    },
    {
      key: 'current_sold',
      label: 'Current Sold',
      render: (val: number) => <span className="text-base">{val || 0}</span>
    },
    { key: 'available_bottles', label: 'Remaining', render: (val: number) => <span className="text-green-600 text-base">{val || 0}</span> },
    { key: 'incubation_period', label: 'Period (Days)' },
    { key: 'temperature', label: 'Temp' },
    { key: 'humidity', label: 'Humidity' },
    { key: 'light_intensity', label: 'Light Intensity' },
    {
      key: 'state',
      label: 'Status',
      render: (val: string) => (
        <span className={`px-2 py-1 rounded border text-base ${
          val === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
          val === 'OUTDOOR_READY' ? 'bg-orange-50 text-orange-700 border-orange-200' :
          val === 'SOLD_OUT' ? 'bg-rose-50 text-rose-700 border-rose-200' :
          val === 'AT_OUTDOOR' ? 'bg-purple-50 text-purple-700 border-purple-200' :
          val === 'COMPLETED' ? 'bg-gray-50 text-gray-700 border-gray-200' :
          'bg-gray-50 text-gray-700 border-gray-200'
        }`}>
          {val}
        </span>
      )
    }
  ];

  return (
    <div className="p-6">
      <Tabs defaultValue="register" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="register">Incubation Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="register">
          <DataTable
            title=""
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
            hideBorder={true}
          />
        </TabsContent>
      </Tabs>

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
