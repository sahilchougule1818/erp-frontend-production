import { useIndoorContaminationData } from '../hooks/useIndoorContaminationData';
import { DataTable } from '../../../shared/components/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Badge } from '../../../shared/ui/badge';
import { useEffect } from 'react';

export function IndoorContamination() {
  const { records, summary, fetchRecords, fetchSummary, pagination } = useIndoorContaminationData();

  useEffect(() => {
    fetchRecords();
    fetchSummary();
  }, [fetchRecords, fetchSummary]);

  const summaryColumns = [
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant Name' },
    {
      key: 'total_contamination',
      label: 'Total Contamination',
      render: (val: number) => <span className="font-bold text-red-600 underline decoration-red-200 decoration-2">{val || 0}</span>
    }
  ];

  const recordsColumns = [
    { key: 'arrived_at', label: 'Recorded At', render: (val: string) => val?.split('T')[0] },
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'stage', label: 'Stage' },
    {
      key: 'contamination_count',
      label: 'Contamination',
      render: (val: number) => <span className="font-semibold text-red-600">{val || 0}</span>
    },
    { key: 'notes', label: 'Notes', render: (val: string) => <span className="text-gray-500 text-base">{val || '—'}</span> },
    {
      key: 'is_active',
      label: 'State',
      render: (val: boolean) => (
        <Badge variant={val ? 'default' : 'secondary'} className={val ? 'bg-green-100 text-green-800 border-green-200' : ''}>
          {val ? 'Active' : 'Completed'}
        </Badge>
      )
    }
  ];

  return (
    <div className="p-6">
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="summary">Contamination Summary</TabsTrigger>
          <TabsTrigger value="records">Detailed Records</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <DataTable
            title=""
            columns={summaryColumns}
            records={summary}
            exportFileName="contamination_summary"
          />
        </TabsContent>

        <TabsContent value="records">
          <DataTable
            title=""
            columns={recordsColumns}
            records={records}
            filterConfig={{
              filter1Key: 'plant_name',
              filter1Label: 'Plant Name',
              filter2Key: 'batch_code',
              filter2Label: 'Batch Name'
            }}
            exportFileName="indoor_contamination_records"
            pagination={pagination}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
