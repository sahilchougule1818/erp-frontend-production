import { useState } from 'react';
import { useSubcultureData } from '../hooks/useSubcultureData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/tabs';
import { DataTable } from '../../shared/components/DataTable';
import { Badge } from '../../shared/ui/badge';
import { UnifiedOperatorEditModal } from '../../operators/components/UnifiedOperatorEditModal';

export function Subculturing() {
  const { records, refetch, pagination } = useSubcultureData();
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const columns = [
    { key: 'transfer_date', label: 'Transfer Date', render: (val: string) => val?.split('T')[0] },
    { key: 'next_stage', label: 'Stage Number' },
    { key: 'batch_code', label: 'Batch Name' },
    { key: 'media_code', label: 'Media Code' },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'current_bottles_count', label: 'Current Bottles (Before)' },
    { key: 'new_bottles_count', label: 'New Bottles (After)' },
    { key: 'notes', label: 'Notes' },
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
          <TabsTrigger value="register">Subculturing Register</TabsTrigger>
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
            exportFileName="subculturing_records"
            pagination={pagination}
            hideBorder={true}
          />
        </TabsContent>
      </Tabs>

      {editingRecord && (
        <UnifiedOperatorEditModal
          eventCode={editingRecord.event_code}
          batchCode={editingRecord.batch_code}
          stage={editingRecord.next_stage}
          activityType="event"
          onClose={() => setEditingRecord(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
