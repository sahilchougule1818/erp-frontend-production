import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Plus, Edit2, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import * as operatorApi from '../../services/operatorApi';

const ROLES = ['Lab Assistant', 'Senior Technician', 'Supervisor', 'QC Officer'];
const SECTIONS = ['Media Preparation', 'Subculturing', 'Incubation', 'Cleaning Record', 'Sampling'];

export function OperatorMaster() {
  const [operators, setOperators] = useState([]);
  const [modal, setModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [exportRange, setExportRange] = useState({ from: '', to: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    id: null,
    firstName: '',
    lastName: '',
    shortName: '',
    role: '',
    section: '',
    isActive: true
  });

  useEffect(() => { fetchOperators(); }, []);

  const fetchOperators = async () => {
    try {
      const res = await operatorApi.getOperators();
      setOperators(res.data);
    } catch (error) {
      console.error('Error:', error);
      setOperators([]);
    }
  };

  const generateShortName = (first: string, last: string) => {
    const f = first.trim().charAt(0).toUpperCase();
    const l = last.trim().charAt(0).toUpperCase();
    return `${f}${l}`;
  };

  const handleNameChange = (field: string, value: string) => {
    const updated = { ...form, [field]: value };
    const shortName = generateShortName(
      field === 'firstName' ? value : form.firstName,
      field === 'lastName' ? value : form.lastName
    );
    setForm({ ...updated, shortName });
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.role || !form.section) {
      return alert('Please fill all required fields');
    }
    try {
      if (form.id) {
        await operatorApi.updateOperator(form.id, form);
      } else {
        await operatorApi.createOperator(form);
      }
      fetchOperators();
      closeModal();
      alert('Saved!');
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (op: any) => {
    setForm({
      id: op.id,
      firstName: op.first_name,
      lastName: op.last_name,
      shortName: op.short_name,
      role: op.role,
      section: op.section || '',
      isActive: op.is_active
    });
    setModal(true);
  };

  const handleDelete = async () => {
    try {
      await operatorApi.deleteOperator(deleteId);
      fetchOperators();
      setDeleteConfirm(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleExport = () => {
    if (!exportRange.from || !exportRange.to) return alert('Please select date range');
    const html = `<html><head><style>body{font-family:Arial;padding:20px}h1{color:#16a34a}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#f3f4f6}</style></head><body><h1>Operator Master</h1><p>Period: ${exportRange.from} to ${exportRange.to}</p><table><thead><tr><th>Short Name</th><th>Full Name</th><th>Role</th><th>Section</th><th>Status</th></tr></thead><tbody>${operators.map(op => `<tr><td>${op.short_name}</td><td>${op.first_name} ${op.last_name}</td><td>${op.role}</td><td>${op.section || ''}</td><td>${op.is_active ? 'Active' : 'Inactive'}</td></tr>`).join('')}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operator-master_${exportRange.from}_to_${exportRange.to}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setExportModal(false);
    setExportRange({ from: '', to: '' });
  };

  const closeModal = () => {
    setModal(false);
    setForm({
      id: null,
      firstName: '',
      lastName: '',
      shortName: '',
      role: '',
      section: '',
      isActive: true
    });
  };

  return (
    <div className="p-6">
      <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-6">
        <div className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm bg-background text-foreground shadow-sm">
          Operator Master
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Operator Master</CardTitle>
            <div className="flex gap-2">
              <Dialog open={exportModal} onOpenChange={setExportModal}>
                <DialogTrigger asChild>
                  <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>Export Data</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>From Date</Label>
                      <Input type="date" value={exportRange.from} onChange={(e) => setExportRange({ ...exportRange, from: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>To Date</Label>
                      <Input type="date" value={exportRange.to} onChange={(e) => setExportRange({ ...exportRange, to: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => { setExportModal(false); setExportRange({ from: '', to: '' }); }}>Cancel</Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleExport}>Download</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={modal} onOpenChange={(o) => { setModal(o); if (!o) closeModal(); }}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />Add Operator
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{form.id ? 'Edit' : 'Add'} Operator</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-gray-700">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name *</Label>
                        <Input value={form.firstName} onChange={(e) => handleNameChange('firstName', e.target.value)} />
                      </div>
                      <div>
                        <Label>Last Name *</Label>
                        <Input value={form.lastName} onChange={(e) => handleNameChange('lastName', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>Short Name (Auto-generated)</Label>
                      <Input value={form.shortName} disabled className="bg-gray-50 font-bold" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-gray-700">Professional Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Role *</Label>
                        <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                          <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                          <SelectContent>
                            {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Section *</Label>
                        <Select value={form.section} onValueChange={(v) => setForm({ ...form, section: v })}>
                          <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                          <SelectContent>
                            {SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-gray-700">Status</h3>
                    <div>
                      <Label>Status</Label>
                      <Select value={form.isActive ? 'active' : 'inactive'} onValueChange={(v) => setForm({ ...form, isActive: v === 'active' })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={closeModal}>Cancel</Button>
                  {form.id && (
                    <Button variant="destructive" onClick={() => { setDeleteId(form.id); setDeleteConfirm(true); setModal(false); }}>
                      Delete
                    </Button>
                  )}
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>Save</Button>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Short Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Full Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Section</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap sticky right-0 bg-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {operators.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">No operators found.</td></tr>
                ) : (
                  operators.map(op => (
                    <tr key={op.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-bold whitespace-nowrap">{op.short_name}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{`${op.first_name} ${op.last_name}`}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{op.role}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{op.section || '-'}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <Badge className={op.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {op.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm sticky right-0 bg-white hover:bg-gray-50">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(op)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
