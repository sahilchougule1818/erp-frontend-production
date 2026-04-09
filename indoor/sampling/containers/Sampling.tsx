import { useState, useEffect } from 'react';
import { Button } from '../../shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/tabs';
import { DataTable } from '../../shared/components/DataTable';
import apiClient from '../../shared/services/apiClient';
import { useNotify } from '../../shared/hooks/useNotify';

export function Sampling() {
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const notify = useNotify();

  useEffect(() => {
    loadSamples();
  }, [activeTab]);

  const loadSamples = async () => {
    setLoading(true);
    try {
      let endpoint = 'summary';
      if (activeTab === 'create') endpoint = 'submissions';
      if (activeTab === 'report') endpoint = 'results';
      
      const response = await apiClient.get(`/indoor/sampling/${endpoint}`);
      setSamples(response?.data ? response.data : (Array.isArray(response) ? response : []));
    } catch (error) {
      console.error('Failed to load samples:', error);
      setSamples([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCreate = async (id: number) => {
    if (!confirm('Delete this sample?')) return;
    try {
      await apiClient.delete(`/indoor/sampling/submission/${id}`);
      notify.success('Deleted successfully');
      loadSamples();
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Failed to delete');
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (!confirm('Delete this report?')) return;
    try {
      await apiClient.delete(`/indoor/sampling/result/${id}`);
      notify.success('Deleted successfully');
      loadSamples();
    } catch (error) {
      notify.error('Failed to delete');
    }
  };

  const summaryColumns = [
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant' },
    { key: 'current_stage', label: 'Stage' },
    { key: 'current_phase', label: 'Phase' },
    {
      key: 'plant_age_at_sampling',
      label: 'Plant Age at Sampling',
      render: (val: number) => <span className="text-base">{val !== null && val !== undefined ? `${val} days` : '-'}</span>
    },
    { key: 'sample_date', label: 'Sample Date', render: (val: string) => <span className="text-base">{val ? new Date(val).toLocaleDateString() : '-'}</span> },
    { 
      key: 'status', 
      label: 'Status', 
      render: (val: string) => (
        <span className={`px-2 py-1 rounded border text-base ${
          val === 'Yes' ? 'bg-green-50 text-green-700 border-green-200' :
          val === 'No' ? 'bg-red-50 text-red-700 border-red-200' :
          'bg-yellow-50 text-yellow-700 border-yellow-200'
        }`}>
          {val || 'Pending'}
        </span>
      )
    },
    { key: 'received_date', label: 'Received Date', render: (val: string) => <span className="text-base">{val ? new Date(val).toLocaleDateString() : '-'}</span> },
    { key: 'certificate_number', label: 'Certificate', render: (val: string) => <span className="text-base">{val || '-'}</span> }
  ];

  const createColumns = [
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant' },
    { key: 'current_stage', label: 'Stage' },
    { key: 'current_phase', label: 'Phase' },
    {
      key: 'plant_age_at_sampling',
      label: 'Plant Age at Sampling',
      render: (val: number) => <span className="text-base">{val !== null && val !== undefined ? `${val} days` : '-'}</span>
    },
    { key: 'sample_date', label: 'Sample Date', render: (val: string) => <span className="text-base">{val ? new Date(val).toLocaleDateString() : '-'}</span> },
    { key: 'notes', label: 'Notes', render: (val: string) => <span className="text-base">{val || '-'}</span> },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (_: any, record: any) => (
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={() => handleDeleteCreate(record.id)}
        >
          Delete
        </Button>
      )
    }
  ];

  const reportColumns = [
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'received_date', label: 'Received Date', render: (val: string) => <span className="text-base">{val ? new Date(val).toLocaleDateString() : '-'}</span> },
    { 
      key: 'status', 
      label: 'Status', 
      render: (val: string) => (
        <span className={`px-2 py-1 rounded border text-base ${
          val === 'Yes' ? 'bg-green-50 text-green-700 border-green-200' :
          'bg-red-50 text-red-700 border-red-200'
        }`}>
          {val}
        </span>
      )
    },
    { key: 'certificate_number', label: 'Certificate Number', render: (val: string) => <span className="text-base">{val || '-'}</span> },
    { key: 'government_digital_code', label: 'Govt Code', render: (val: string) => <span className="text-base">{val || '-'}</span> },
    { key: 'reason', label: 'Reason', render: (val: string) => <span className="text-base">{val || '-'}</span> },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (_: any, record: any) => (
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={() => handleDeleteReport(record.id)}
        >
          Delete
        </Button>
      )
    }
  ];

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="create">Submissions</TabsTrigger>
          <TabsTrigger value="report">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <DataTable
            title=""
            columns={summaryColumns}
            records={samples || []}
            filterConfig={{
              filter1Key: 'batch_code',
              filter1Label: 'Batch Code',
              filter2Key: 'status',
              filter2Label: 'Status'
            }}
            exportFileName="sampling_summary"
            readOnly={true}
          />
        </TabsContent>

        <TabsContent value="create">
          <DataTable
            title=""
            columns={createColumns}
            records={samples || []}
            filterConfig={{
              filter1Key: 'batch_code',
              filter1Label: 'Batch Code',
              filter2Key: 'plant_name',
              filter2Label: 'Plant Name'
            }}
            exportFileName="sampling_submissions"
            readOnly={true}
          />
        </TabsContent>

        <TabsContent value="report">
          <DataTable
            title=""
            columns={reportColumns}
            records={samples || []}
            filterConfig={{
              filter1Key: 'batch_code',
              filter1Label: 'Batch Code',
              filter2Key: 'status',
              filter2Label: 'Status'
            }}
            exportFileName="sampling_results"
            readOnly={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
