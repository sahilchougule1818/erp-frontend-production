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
    { key: 'lab_number', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'media_code', label: 'Media Code' },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'qty_in', label: 'Bottles Entered' },
    { key: 'qty_contaminated', label: 'Contamination' },
    { key: 'qty_sold', label: 'Sold' },
    { key: 'qty_available', label: 'Available' },
    { key: 'incubation_period', label: 'Period (Days)' },
    { key: 'temperature', label: 'Temp' },
    { key: 'humidity', label: 'Humidity' },
    { key: 'light_intensity', label: 'Light Intensity' },
    { key: 'state', label: 'State' }
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
