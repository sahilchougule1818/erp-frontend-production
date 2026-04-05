import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../shared/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../shared/ui/alert-dialog';
import { useFertilizationData } from '../hooks';
import { EditFertilizationForm } from '../forms/EditFertilizationForm';
import { UnifiedEditModal } from '../../workers/components/UnifiedEditModal';
import { DataTable } from '../../shared/components/DataTable';
import { useNotify } from '../../shared/hooks/useNotify';

export function Fertilization() {
  const { records, batches, saveRecord, deleteRecord, pagination } = useFertilizationData();
  const [modal, setModal] = useState({ open: false, editData: null });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingWorkers, setEditingWorkers] = useState<any | null>(null);
  const notify = useNotify();

  const columns = [
    { key: 'created_at', label: 'Date', render: (val: string) => val?.split('T')[0] || '' },
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'current_phase', label: 'Phase' },
    { key: 'current_tunnel', label: 'Tunnel' },
    { key: 'fertilizer_name', label: 'Fertilizer' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'workers', label: 'Workers' }
  ];

  const handleSave = async (formData: any) => {
    const success = await saveRecord(formData);
    if (success) {
      setModal({ open: false, editData: null });
      notify.success('Updated successfully!');
    } else {
      notify.error('Failed to update fertilization record');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const success = await deleteRecord(deleteId);
    if (success) {
      setDeleteConfirm(false);
      setDeleteId(null);
      notify.success('Deleted successfully!');
    } else {
      notify.error('Failed to delete fertilization record');
    }
  };

  const handleEdit = (record: any) => {
    setModal({ open: true, editData: record });
  };

  return (
    <div className="p-6">
      <DataTable
        title="Fertilization Records"
        columns={columns}
        records={records}
        onEdit={handleEdit}
        onEditWorkers={(record) => setEditingWorkers(record)}
        filterConfig={{ filter1Key: 'plant_name', filter1Label: 'Plant Name', filter2Key: 'batch_code', filter2Label: 'Batch Code' }}
        exportFileName="fertilization"
        pagination={pagination}
      />

      <Dialog open={modal.open} onOpenChange={(o: boolean) => setModal({ ...modal, open: o })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit Fertilization Record</DialogTitle>
          </DialogHeader>
          <EditFertilizationForm
            initialData={modal.editData}
            batches={batches}
            onSubmit={handleSave}
            onDelete={(id) => { setDeleteId(id); setDeleteConfirm(true); setModal({ open: false, editData: null }); }}
            onCancel={() => setModal({ open: false, editData: null })}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this fertilization record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingWorkers && (
        <UnifiedEditModal
          eventCode={editingWorkers.event_code}
          batchCode={editingWorkers.batch_code}
          phase={editingWorkers.current_phase || 'fertilization'}
          tunnel={editingWorkers.current_tunnel}
          activityType="fertilization"
          fertilizationId={editingWorkers.id}
          onClose={() => setEditingWorkers(null)}
        />
      )}
    </div>
  );
}