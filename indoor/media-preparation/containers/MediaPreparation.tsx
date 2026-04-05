import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/tabs';
import { Button } from '../../shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../shared/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../shared/ui/alert-dialog';
import { Badge } from '../../shared/ui/badge';
import { Plus } from 'lucide-react';
import { useMediaData } from '../hooks/useMediaData';
import { MediaBatchForm } from '../forms/MediaBatchForm';
import { AutoclaveCycleForm } from '../forms/AutoclaveCycleForm';
import { DataTable } from '../../shared/components/DataTable';

export function MediaPreparation() {
  const { 
    mediaBatches, 
    pendingMediaBatches, 
    autoclaveCycles, 
    operators, 
    saveMediaBatch, 
    saveAutoclaveCycle, 
    deleteMediaBatch, 
    deleteAutoclaveCycle,
    mediaPagination,
    autoclavePagination
  } = useMediaData();
  const [tab, setTab] = useState('batch');
  const [modal, setModal] = useState({ open: false, editData: null, type: 'batch' });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_autoclave: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const batchColumns = [
    { key: 'prepared_date', label: 'Date', render: (val: any) => val ? String(val).split('T')[0] : 'N/A' },
    { key: 'media_code', label: 'Media Code' },
    { key: 'media_type', label: 'Media Type', render: (val: any) => val || 'Not set' },
    { key: 'media_volume', label: 'Media Total', render: (val: any) => val || 'Not set' },
    { key: 'bottles_count', label: 'Bottles Count', render: (val: any) => val || 'Not set' },
    { key: 'contamination', label: 'Contamination', render: (val: any) => val || 'None' },
    { key: 'status', label: 'Status', render: (val: string) => <StatusBadge status={val} /> }
  ];

  const autoclaveColumns = [
    { key: 'cycle_date', label: 'Date', render: (val: any) => val ? String(val).split('T')[0] : 'N/A' },
    { key: 'media_code', label: 'Media Code' },
    { key: 'media_type', label: 'Type of Media' },
    { key: 'started_at', label: 'Autoclave ON Time' },
    { key: 'media_loaded_at', label: 'Media Loading Time', render: (val: any) => val || 'Not set' },
    { key: 'pressure_reached_at', label: 'Pressure Time', render: (val: any) => val || 'Not set' },
    { key: 'ended_at', label: 'Off Time', render: (val: any) => val || 'Not set' },
    { key: 'opened_at', label: 'Open Time', render: (val: any) => val || 'Not set' },
    { key: 'media_volume', label: 'Media Total', render: (val: any) => val || 'Not set' },
    { key: 'bottles_count', label: 'Bottles Count', render: (val: any) => val || 'Not set' },
    { key: 'status', label: 'Status', render: (val: string) => <StatusBadge status={val} /> }
  ];

  const handleSave = async (formData: any) => {
    const success = modal.type === 'batch'
      ? await saveMediaBatch(formData)
      : await saveAutoclaveCycle(formData);
    if (success) {
      setModal({ open: false, editData: null, type: 'batch' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const success = modal.type === 'batch'
      ? await deleteMediaBatch(deleteId)
      : await deleteAutoclaveCycle(deleteId);
    if (success) {
      setDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="batch">Media Batch Register</TabsTrigger>
          <TabsTrigger value="autoclave">Autoclave Cycle</TabsTrigger>
        </TabsList>
        
        <TabsContent value="batch">
          <DataTable
            title="Media Batch Register"
            columns={batchColumns}
            records={mediaBatches}
            onEdit={(record) => setModal({ open: true, editData: record, type: 'batch' })}
            filterConfig={{
              filter1Key: 'prepared_date',
              filter1Label: 'Date',
              filter2Key: 'media_code',
              filter2Label: 'Media Code'
            }}
            exportFileName="media_batches"
            pagination={mediaPagination}
            addButton={
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setModal({ open: true, editData: null, type: 'batch' })}>
                <Plus className="w-4 h-4 mr-2" />Add New
              </Button>
            }
          />
        </TabsContent>
        
        <TabsContent value="autoclave">
          <DataTable
            title="Autoclave Cycle"
            columns={autoclaveColumns}
            records={autoclaveCycles}
            onEdit={(record) => setModal({ open: true, editData: record, type: 'autoclave' })}
            filterConfig={{
              filter1Key: 'cycle_date',
              filter1Label: 'Date',
              filter2Key: 'media_code',
              filter2Label: 'Media Code'
            }}
            exportFileName="autoclave_cycles"
            pagination={autoclavePagination}
            addButton={
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setModal({ open: true, editData: null, type: 'autoclave' })}>
                <Plus className="w-4 h-4 mr-2" />Add New
              </Button>
            }
          />
        </TabsContent>
      </Tabs>

      <MediaBatchForm
        open={modal.open && modal.type === 'batch'}
        initialData={modal.editData}
        operators={operators}
        onSubmit={handleSave}
        onDelete={(id) => { setDeleteId(id); setDeleteConfirm(true); setModal({ open: false, editData: null, type: 'batch' }); }}
        onClose={() => setModal({ open: false, editData: null, type: 'batch' })}
      />

      {modal.open && modal.type === 'autoclave' && (
        <Dialog open={true} onOpenChange={() => setModal({ open: false, editData: null, type: 'autoclave' })}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{modal.editData ? 'Edit' : 'Add'} Autoclave Cycle</DialogTitle>
            </DialogHeader>
            <AutoclaveCycleForm
              initialData={modal.editData}
              operators={operators}
              pendingMediaBatches={pendingMediaBatches}
              onSubmit={handleSave}
              onDelete={(id) => { setDeleteId(id); setDeleteConfirm(true); setModal({ open: false, editData: null, type: 'autoclave' }); }}
              onCancel={() => setModal({ open: false, editData: null, type: 'autoclave' })}
            />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
