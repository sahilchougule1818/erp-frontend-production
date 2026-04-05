import { useSecondaryHardeningData } from '../hooks';
import { DataTable } from '../../shared/components/DataTable';
import { createPhaseColumns, phaseColumnConfigs } from '../../shared/components/phaseColumns';
import { UnifiedEditModal } from '../../workers/components/UnifiedEditModal';
import { usePhaseEditing } from '../hooks/usePhaseEditing';

export function SecondaryHardening() {
  const { records, refetch, pagination } = useSecondaryHardeningData();
  const { editingRecord, onEditRecord, closeEdit } = usePhaseEditing(refetch);

  const columns = createPhaseColumns(phaseColumnConfigs.secondaryHardening);

  return (
    <div className="p-6">
      <DataTable
        title="Secondary Hardening"
        columns={columns}
        records={records}
        filterConfig={{ filter1Key: 'plant_name', filter1Label: 'Plant Name', filter2Key: 'batch_code', filter2Label: 'Batch Code' }}
        exportFileName="secondary-hardening"
        onEdit={onEditRecord}
        pagination={pagination}
      />

      {editingRecord && (
        <UnifiedEditModal
          eventCode={editingRecord.event_code}
          batchCode={editingRecord.batch_code}
          tunnel={editingRecord.current_tunnel ?? ''}
          phase={'secondary_hardening'}
          onClose={closeEdit}
        />
      )}
    </div>
  );
}
