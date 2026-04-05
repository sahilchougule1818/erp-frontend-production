import { useTunnelShiftsData } from '../hooks';
import { DataTable } from '../../shared/components/DataTable';

const movementTypeLabel = (val: string) => {
  const map: Record<string, string> = {
    IMPORT: 'Import',
    SHIFT: 'Shift',
    TRANSITION: 'Transition',
  };
  return map[val] ?? val;
};

const movementTypeBadge = (val: string) => {
  const cls =
    val === 'IMPORT' ? 'bg-green-100 text-green-800' :
    val === 'SHIFT' ? 'bg-blue-100 text-blue-800' :
    val === 'TRANSITION' ? 'bg-purple-100 text-purple-800' :
    'bg-gray-100 text-gray-600';
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${cls}`}>
      {movementTypeLabel(val)}
    </span>
  );
};


export function TunnelShifts() {
  const { records, refetch, pagination } = useTunnelShiftsData();

  const columns = [
    {
      key: 'moved_at',
      label: 'Date',
      render: (val: string) => val?.split('T')[0] ?? '',
    },
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant Name' },
    {
      key: 'movement_type',
      label: 'Type',
      render: (val: string) => movementTypeBadge(val),
    },
    {
      key: 'from_location',
      label: 'From',
      render: (val: string | null) => val ?? '—',
    },
    {
      key: 'to_location',
      label: 'To',
      render: (val: string | null, row: any) => (
        <span className="flex items-center gap-1">
          <span>{val ?? '—'}</span>
          {row.is_overcrowded && (
            <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200"
                  title="Tunnel is currently over capacity">
              Over Capacity
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'plants_at_entry',
      label: 'Plants',
      render: (val: number) => <span>{Number(val || 0).toLocaleString()}</span>,
    },
    {
      key: 'mortality_count',
      label: 'Mortality',
      render: (val: number) => (
        <span className={Number(val) > 0 ? 'font-semibold text-red-600' : 'text-slate-400'}>
          {Number(val ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'sold_count',
      label: 'Sold',
      render: (val: number) =>
        Number(val) > 0
          ? <span className="font-semibold text-rose-600">{Number(val).toLocaleString()}</span>
          : <span className="text-slate-400">—</span>,
    },
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Movement Journal"
        columns={columns}
        records={records}
        filterConfig={{
          filter1Key: 'batch_code', filter1Label: 'Batch Code',
          filter2Key: 'movement_type', filter2Label: 'Type',
        }}
        exportFileName="movement-journal"
        pagination={pagination}
      />
    </div>
  );
}
