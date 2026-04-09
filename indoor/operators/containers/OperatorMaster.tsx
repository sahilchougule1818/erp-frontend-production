import { useState } from 'react';
import { Button } from '../../shared/ui/button';
import { UserPlus, Trash2, Edit2, Plus } from 'lucide-react';
import { ModalLayout } from '../../shared/components/ModalLayout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../shared/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/tabs';
import { Badge } from '../../shared/ui/badge';

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
      <Tabs defaultValue="master" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="master">Operator Master</TabsTrigger>
          <TabsTrigger value="logs">Activity Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="master">
          <DataTable
            title=""
            records={operators}
            columns={[
              {
                key: 'id',
                label: 'ID',
                render: (val) => <span className="text-base text-slate-500 font-mono">{val}</span>
              },
              {
                key: 'short_name',
                label: 'Short Name',
                render: (val) => <span className="text-base">{val}</span>
              },
              {
                key: 'full_name',
                label: 'Full Name',
                render: (_: any, op: any) => <span className="text-base">{op.first_name} {op.last_name}</span>
              },
              {
                key: 'is_active',
                label: 'Status',
                render: (val) => (
                  <span className={val ? "text-emerald-700 text-base" : "text-slate-500 text-base"}>
                    {val ? 'Active' : 'Inactive'}
                  </span>
                )
              }
            ]}
            onEdit={handleEdit}
            onDelete={(op: any) => { setDeleteId(op.id); toggleModal('delete', true); }}
            exportFileName="operator_directory"
            pagination={operatorPagination}
            addButton={
              <Button onClick={() => toggleModal('operator', true)} style={{ backgroundColor: '#4f46e5', color: '#fff' }} className="font-bold shadow-md shadow-indigo-100 rounded-xl px-4 py-2 flex items-center gap-2 transition-all hover:opacity-90 active:scale-95">
                <Plus className="w-4 h-4" />
                Register Operator
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="logs">
          <DataTable
            title=""
            records={activityLogs}
            columns={[
              { 
                key: 'activity_date', 
                label: 'Date', 
                render: (val) => <span className="text-base">{new Date(val).toLocaleDateString()}</span>
              },
              { 
                key: 'category', 
                label: 'Category',
                render: (val) => (
                  <Badge variant="outline" className={`px-2 py-0.5 text-sm uppercase tracking-wider ${
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
                render: (val) => <span className="text-base">{val}</span>
              },
              { 
                key: 'stage', 
                label: 'Stage',
                render: (val) => <span className="text-base">{val || '-'}</span>
              },
              { 
                key: 'operator', 
                label: 'Worker',
                render: (val, log) => <span className="text-base">{log.full_name}</span>
              },
              { 
                key: 'notes', 
                label: 'Notes',
                render: (val) => <span className="text-base text-slate-500 line-clamp-1 max-w-[150px] italic">{val || '-'}</span>
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

      {modals.operator && (
        <ModalLayout
          title={selectedOperator ? 'Edit Profile' : 'Register Operator'}
          icon={selectedOperator ? <Edit2 className="w-5 h-5 text-indigo-600" /> : <UserPlus className="w-5 h-5 text-indigo-600" />}
          maxWidth="480px"
          onClose={closeModal}
        >
          <div className="px-6 pb-4">
            <OperatorForm
              initialData={selectedOperator}
              onSubmit={handleOperatorSubmit}
              onCancel={closeModal}
            />
          </div>
        </ModalLayout>
      )}

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
