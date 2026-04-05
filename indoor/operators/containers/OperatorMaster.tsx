import { useState } from 'react';
import { Button } from '../../shared/ui/button';
import { 
  Users, 
  UserPlus,
  Trash2, 
  Edit2, 
  History,
  Plus
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../shared/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../shared/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/tabs';
import { Badge } from '../../shared/ui/badge';
import { Separator } from '../../shared/ui/separator';
import { useOperatorMaster } from '../hooks/useOperatorMaster';
import { OperatorForm } from '../forms/OperatorForm';
import { DataTable } from '../../shared/components/DataTable';

export function OperatorMaster() {
  const {
    operators,
    activityLogs,
    createOperator,
    updateOperator,
    deleteOperator,
    operatorPagination,
    activityLogsPagination
  } = useOperatorMaster();

  const [modals, setModals] = useState({
    operator: false,
    delete: false
  });
  const [selectedOperator, setSelectedOperator] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const toggleModal = (type: keyof typeof modals, open?: boolean) => {
    setModals(prev => ({ ...prev, [type]: open ?? !prev[type] }));
  };

  const handleOperatorSubmit = async (operatorData: any) => {
    try {
      if (operatorData.id) {
        await updateOperator(operatorData.id, operatorData);
      } else {
        await createOperator(operatorData);
      }
      toggleModal('operator', false);
      setSelectedOperator(null);
    } catch (error: any) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (op: any) => {
    setSelectedOperator(op);
    toggleModal('operator', true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteOperator(deleteId);
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 pb-2">
        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md shadow-indigo-100/50">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Operator Master
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider opacity-70">
            Workforce Management & Activity Monitoring
          </p>
        </div>
      </div>

      <Separator className="bg-slate-200/60" />

      <Tabs defaultValue="master" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="master">
            <Users className="w-4 h-4" />
            Operator Master
          </TabsTrigger>
          <TabsTrigger value="logs">
            <History className="w-4 h-4" />
            Activity Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="master">
          <DataTable
            title="Operator Directory"
            records={operators}
            columns={[
              { 
                key: 'short_name', 
                label: 'Operator', 
                render: (val, op) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                      {val}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-base">{op.first_name} {op.last_name}</div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold opacity-70">ID: {op.id}</div>
                    </div>
                  </div>
                )
              },
              { 
                key: 'role', 
                label: 'Role',
                render: (val) => (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 font-medium capitalize">
                    {val}
                  </Badge>
                )
              },
              { 
                key: 'is_active', 
                label: 'Status',
                render: (val) => (
                  <Badge className={val ? "bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1 font-bold" : "bg-slate-100 text-slate-600 border-slate-200 px-3 py-1 font-bold"}>
                    {val ? 'Active' : 'Inactive'}
                  </Badge>
                )
              }
            ]}
            onEdit={handleEdit}
            onDelete={(op: any) => { setDeleteId(op.id); toggleModal('delete', true); }}
            exportFileName="operator_directory"
            pagination={operatorPagination}
            addButton={
              <Button onClick={() => toggleModal('operator', true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-100 rounded-xl px-4 py-2 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                <Plus className="w-4 h-4" />
                Register Operator
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="logs">
          <DataTable
            title="Staff Utilization Audit Log"
            records={activityLogs}
            columns={[
              { 
                key: 'activity_date', 
                label: 'Date', 
                render: (val) => new Date(val).toLocaleDateString() 
              },
              { 
                key: 'category', 
                label: 'Category',
                render: (val) => (
                  <Badge variant="outline" className={`font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                    val === 'Production' 
                      ? "bg-purple-50 text-purple-700 border-purple-100" 
                      : val === 'Cleaning'
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-blue-50 text-blue-700 border-blue-100"
                  }`}>
                    {val}
                  </Badge>
                )
              },
              { key: 'reference_code', label: 'Reference' },
              { 
                key: 'phase', 
                label: 'Activity/Phase',
                render: (val) => (
                  <span className={val === 'Autoclave Cycle' ? "text-orange-700 font-black underline decoration-orange-200 underline-offset-4" : "text-slate-700 font-bold"}>
                    {val}
                  </span>
                )
              },
              { 
                key: 'stage', 
                label: 'Stage',
                render: (val) => <span className="italic text-slate-500 font-medium">{val || '-'}</span>
              },
              { 
                key: 'operator', 
                label: 'Worker',
                render: (val, log) => (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[11px] font-black text-indigo-700">
                      {val}
                    </div>
                    <span className="font-bold text-slate-700">{log.full_name}</span>
                  </div>
                )
              },
              { 
                key: 'notes', 
                label: 'Notes',
                render: (val) => <span className="text-xs text-slate-500 line-clamp-1 max-w-[150px] italic">{val || '-'}</span>
              }
            ]}
            filterConfig={{
              filter1Key: 'category',
              filter1Label: 'Category',
              filter2Key: 'reference_code',
              filter2Label: 'Batch / Media / Task'
            }}
            exportFileName="staff_utilization_audit"
            pagination={activityLogsPagination}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={modals.operator} onOpenChange={(open: boolean) => toggleModal('operator', open)}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
              {selectedOperator ? <Edit2 className="w-6 h-6 text-indigo-600" /> : <UserPlus className="w-6 h-6 text-indigo-600" />}
              {selectedOperator ? 'Edit Profile' : 'Register Operator'}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <OperatorForm 
              initialData={selectedOperator} 
              onSubmit={handleOperatorSubmit}
              onCancel={closeModal}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-red-600 flex items-center gap-2">
              <Trash2 className="w-6 h-6" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-base font-medium">
              Are you sure you want to remove this operator? This will permanently delete their directory record and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel className="rounded-xl font-bold h-11 px-6 border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-xl font-bold h-11 px-6 shadow-lg shadow-red-100">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
