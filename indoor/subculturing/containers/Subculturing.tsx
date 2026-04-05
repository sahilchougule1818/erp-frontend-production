import { useState } from 'react';
import { useSubcultureData } from '../hooks/useSubcultureData';
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
    { key: 'media_code', label: 'Media Code', render: (val: string) => <Badge variant="outline" className="bg-green-50 text-green-700">{val}</Badge> },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'current_bottles_count', label: 'Current Bottles (Before)' },
    { key: 'new_bottles_count', label: 'New Bottles (After)' },
    { key: 'notes', label: 'Notes' },
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
        title="Subculturing Register"
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
      />

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
