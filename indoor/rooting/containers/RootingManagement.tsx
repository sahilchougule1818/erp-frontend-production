import { useRootingData } from '../hooks/useRootingData';
import { DataTable } from '../../../shared/components/DataTable';

export function RootingManagement() {
  const { rootedBatches, loading, error, pagination } = useRootingData();

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-IN');
  };

  const columns = [
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'lab_number', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'qty_in', label: 'Bottles Entered' },
    { key: 'qty_contaminated', label: 'Contamination' },
    { key: 'qty_sold', label: 'Sold' },
    { key: 'qty_available', label: 'Available' },
    { key: 'source_batch_stage', label: 'Source Stage' },
    { key: 'rooting_date', label: 'Rooting Date', render: (value: string | null) => formatDate(value) },
    { key: 'state', label: 'State' },
    { key: 'actions', label: '', render: () => null }
  ];

  if (loading) return <div className="p-6">Loading rooted batches...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  const activeCount = rootedBatches.filter((b: any) => b.state === 'AT_OUTDOOR').length;
  const completedCount = rootedBatches.filter((b: any) => b.state !== 'AT_OUTDOOR').length;

  return (
    <div className="p-6">
      <DataTable
        title="Rooting Register"
        description={`Total: ${pagination.total} | Active: ${activeCount} | Completed: ${completedCount}`}
        columns={columns}
        records={rootedBatches}
        exportFileName="rooted_batches"
        pagination={pagination}
      />
    </div>
  );
}
