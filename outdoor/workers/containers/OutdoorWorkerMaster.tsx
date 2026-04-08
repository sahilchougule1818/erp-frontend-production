import { useState } from 'react';
import { Button } from '../../shared/ui/button';
import { Plus } from 'lucide-react';
import { ModalLayout } from '../../shared/components/ModalLayout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../shared/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/tabs';
import { Badge } from '../../shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { useWorkerMaster } from '../hooks/useWorkerMaster';
import { WorkerForm } from '../forms/WorkerForm';
import { DataTable } from '../../shared/components/DataTable';
import { useNotify } from '../../shared/hooks/useNotify';
import { Tunnels } from '../../tunnels/containers/Tunnels';

export function OutdoorWorkerMaster() {
  const {
    workers,
    workerLogs,
    createWorker,
    updateWorker,
    deleteWorker,
    paginationWorkers,
    paginationLogs
  } = useWorkerMaster();

  const [modals, setModals] = useState({
    operator: false,
    export: false,
    delete: false
  });
  const [selectedOperator, setSelectedOperator] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedWorker, setSelectedWorker] = useState('all');
  const notify = useNotify();

  const columns = [
    { key: 'id', label: 'ID', render: (val: number) => <span className="text-xs text-slate-500 font-mono">{val}</span> },
    { key: 'short_name', label: 'Short Name', render: (val: string) => <span className="font-bold">{val}</span> },
    { key: 'full_name', label: 'Full Name', render: (_: any, record: any) => `${record.first_name} ${record.last_name}` },
    { key: 'is_active', label: 'Status', render: (val: boolean) => (
      <Badge className={val ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
        {val ? 'Active' : 'Inactive'}
      </Badge>
    )}
  ];

  const logColumns = [
    { key: 'batch_code', label: 'Batch Code', render: (val: string) => <span className="font-medium">{val}</span> },
    { key: 'activity', label: 'Activity', render: (val: string, record: any) => {
      const activity = val || record.phase;
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          activity === 'Import'
            ? 'bg-green-100 text-green-700'
          : activity === 'Shifting'
            ? 'bg-blue-100 text-blue-700'
          : activity === 'Phase Transition'
            ? 'bg-purple-100 text-purple-700'
          : activity === 'Fertilization'
            ? 'bg-amber-100 text-amber-700'
          : activity === 'Sampling'
            ? 'bg-cyan-100 text-cyan-700'
          : 'bg-gray-100 text-gray-700'
        }`}>
          {activity}
        </span>
      );
    }},
    { key: 'phase', label: 'Phase', render: (val: string) => <span className="capitalize">{val?.replace(/_/g, ' ')}</span> },
    { key: 'tunnel', label: 'Tunnel', render: (val: string) => val || '-' },
    { key: 'worker_name', label: 'Worker', render: (_: any, record: any) => record.worker_name || record.worker_shortname },
    { key: 'date', label: 'Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : '' }
  ];

  const toggleModal = (type: keyof typeof modals, open?: boolean) => {
    setModals(prev => ({ ...prev, [type]: open ?? !prev[type] }));
  };

  const handleOperatorSubmit = async (operatorData: any) => {
    try {
      if (operatorData.id) {
        await updateWorker(operatorData.id, operatorData);
      } else {
        await createWorker(operatorData);
      }
      toggleModal('operator', false);
      setSelectedOperator(null);
      notify.success('Saved!');
    } catch (error: any) {
      notify.error('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (op: any) => {
    setSelectedOperator(op);
    toggleModal('operator', true);
  };

  const handleDelete = async () => {
    try {
      await deleteWorker(deleteId!);
      toggleModal('delete', false);
      setDeleteId(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const closeModal = () => {
    toggleModal('operator', false);
    setSelectedOperator(null);
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="operators" className="w-full">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="operators">Worker Master</TabsTrigger>
          <TabsTrigger value="operator-log">Worker Log Register</TabsTrigger>
          <TabsTrigger value="tunnel-master">Tunnel Master</TabsTrigger>
        </TabsList>

        <TabsContent value="operators">
          <DataTable
            title="Worker Master"
            columns={columns}
            records={workers}
            onEdit={handleEdit}
            exportFileName="workers"
            pagination={paginationWorkers}
            addButton={
              <Button style={{ backgroundColor: '#16a34a', color: '#fff' }} className="hover:opacity-90" onClick={() => toggleModal('operator', true)}>
                <Plus className="w-4 h-4 mr-2" />Add Worker
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="operator-log">
          <DataTable
            title="Worker Log Register"
            columns={logColumns}
            records={workerLogs.filter((log: any) => selectedWorker === 'all' || log.worker_id.toString() === selectedWorker)}
            exportFileName="worker_logs"
            pagination={paginationLogs}
            addButton={
              <div className="w-64">
                <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Worker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Workers</SelectItem>
                    {workers.map((op: any) => (
                      <SelectItem key={op.id} value={op.id.toString()}>
                        {op.first_name} {op.last_name} ({op.short_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </TabsContent>

        <TabsContent value="tunnel-master">
          <Tunnels />
        </TabsContent>
      </Tabs>

      {modals.operator && (
        <ModalLayout
          title={selectedOperator ? 'Edit Worker' : 'Add Worker'}
          maxWidth="480px"
          onClose={closeModal}
        >
          <div className="px-6 pb-4">
            <WorkerForm
              initialData={selectedOperator}
              onSubmit={handleOperatorSubmit}
              onDelete={(id) => { setDeleteId(id); toggleModal('delete', true); toggleModal('operator', false); }}
              onCancel={closeModal}
            />
          </div>
        </ModalLayout>
      )}

      <AlertDialog open={modals.delete} onOpenChange={(open: boolean) => toggleModal('delete', open)}>
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
