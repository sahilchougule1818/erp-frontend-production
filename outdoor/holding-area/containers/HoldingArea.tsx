import { useHoldingAreaData } from '../hooks';
import { DataTable } from '../../shared/components/DataTable';
import { createPhaseColumns, phaseColumnConfigs } from '../../shared/components/phaseColumns';
import { UnifiedEditModal } from '../../workers/components/UnifiedEditModal';
import { usePhaseEditing } from '../../hardening/hooks/usePhaseEditing';

export function HoldingArea() {
  const { records, refetch, pagination } = useHoldingAreaData();
  const { editingRecord, onEditRecord, closeEdit } = usePhaseEditing(refetch);

  // Use shared config — includes source_phase, mortality, sold, and available columns
  const baseColumns = createPhaseColumns(phaseColumnConfigs.holdingArea);

  // Replace 'current_tunnel' with 'source_tunnel' for holding area
  const columns = baseColumns.map(col => {
    if (col.key === 'current_tunnel') {
      return { ...col, key: 'source_tunnel', label: 'Source Tunnel' };
    }
    return col;
  });

  return (
    <div className="p-6">
      <DataTable
        title="Holding Area"
        columns={columns}
        records={records}
        filterConfig={{ filter1Key: 'batch_code', filter1Label: 'Batch Code', filter2Key: 'plant_name', filter2Label: 'Plant Name' }}
        exportFileName="holding-area"
        onEdit={onEditRecord}
        pagination={pagination}
      />

      {editingRecord && (
        <UnifiedEditModal
          eventCode={editingRecord.event_code}
          batchCode={editingRecord.batch_code}
          tunnel={editingRecord.source_tunnel ?? ''}
          phase={editingRecord.source_phase ?? 'holding_area'}
          onClose={closeEdit}
        />
      )}
    </div>
  );
}
