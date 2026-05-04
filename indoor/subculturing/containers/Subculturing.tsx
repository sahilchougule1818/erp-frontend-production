import { useState } from 'react';
import { useSubcultureData } from '../hooks/useSubcultureData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { DataTable } from '../../../shared/components/DataTable';
import { Badge } from '../../../shared/ui/badge';
import { UnifiedOperatorEditModal } from '../../operators/components/UnifiedOperatorEditModal';

export function Subculturing() {
  const { records, refetch, pagination } = useSubcultureData();
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const columns = [
    { key: 'subculture_date', label: 'Subculture Date', render: (val: string) => val?.split('T')[0] },
    { key: 'to_stage', label: 'Stage Number' },
    { key: 'batch_code', label: 'Batch Name' },
    { key: 'lab_number', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'media_code', label: 'Media Code' },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'qty_inherited', label: 'Current Bottles (Before)' },
    { key: 'qty_in', label: 'New Bottles (After)' },
    { key: 'qty_p_rooted', label: 'Partial Rooting' },
    { key: 'qty_available', label: 'Available Bottles' },
    { key: 'notes', label: 'Notes' },
    { key: 'state', label: 'State' },
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
          stage={editingRecord.to_stage}
          activityType="event"
          onClose={() => setEditingRecord(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
