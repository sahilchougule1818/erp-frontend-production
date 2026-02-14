import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Download, Edit2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { FilterBar } from '../common/FilterBar';
import { BackToMainDataButton } from '../common/BackToMainDataButton';
import { useSearchFilter } from '../../hooks/useSearchFilter';
import { DataTable } from '../common/DataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

const shiftingData = [
  {
    id: 1,
    date: '2024-11-18',
    cropName: 'Rose',
    batch: 'B-2024-1145',
    oldLocation: 'T1 / Tray 5 / C10-C20',
    newLocation: 'T2 / Tray 12 / C1-C11',
    plants: 264,
    reason: 'Better light exposure',
    notes: 'Completed successfully'
  },
  {
    id: 2,
    date: '2024-11-17',
    cropName: 'Gerbera',
    batch: 'B-2024-1144',
    oldLocation: 'T3 / Tray 8 / C15-C25',
    newLocation: 'T1 / Tray 15 / C30-C40',
    plants: 264,
    reason: 'Mortality in old location',
    notes: 'Preventive shift'
  },
];

export function Shifting() {
  const shiftingFilter = useSearchFilter({
    sourceData: shiftingData,
    field1Accessor: (record) => record.cropName,
    field2Accessor: (record) => record.batch
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    date: '',
    cropName: '',
    batch: '',
    oldLocation: '',
    newLocation: '',
    plants: '',
    reason: '',
    notes: ''
  });
  
  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'cropName', label: 'Crop Name' },
    { key: 'batch', label: 'Batch' },
    { key: 'oldLocation', label: 'Old Location' },
    { key: 'newLocation', label: 'New Location' },
    { key: 'plants', label: 'Plants' },
    { key: 'reason', label: 'Reason' },
    { key: 'notes', label: 'Notes' },
  ];

  const availableDates = useMemo(() => {
    return Array.from(new Set(shiftingData.map(record => record.date))).sort();
  }, []);

  const availableBatches = useMemo(() => {
    if (!selectedDate) return [];
    return Array.from(new Set(shiftingData.filter(record => record.date === selectedDate).map(record => record.batch)));
  }, [selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedBatch('');
    setFormData({
      date: '',
      cropName: '',
      batch: '',
      oldLocation: '',
      newLocation: '',
      plants: '',
      reason: '',
      notes: ''
    });
    setEditingId(null);
  };

  const handleBatchSelect = (batch: string) => {
    setSelectedBatch(batch);
  };

  const handleSearch = () => {
    const recordData = shiftingData.find(record => record.date === selectedDate && record.batch === selectedBatch);
    if (recordData) {
      setFormData({
        date: recordData.date,
        cropName: recordData.cropName,
        batch: recordData.batch,
        oldLocation: recordData.oldLocation,
        newLocation: recordData.newLocation,
        plants: String(recordData.plants),
        reason: recordData.reason,
        notes: recordData.notes
      });
      setEditingId(recordData.id);
    }
  };

  const handleSaveChanges = () => {
    console.log('Saving changes:', formData);
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteEntry = () => {
    console.log('Deleting entry:', editingId);
    setIsEditModalOpen(false);
    setDeleteConfirmOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedDate('');
    setSelectedBatch('');
    setEditingId(null);
    setFormData({
      date: '',
      cropName: '',
      batch: '',
      oldLocation: '',
      newLocation: '',
      plants: '',
      reason: '',
      notes: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      <FilterBar 
        field1={{
          label: 'Crop Name',
          value: shiftingFilter.selectedField1,
          onChange: shiftingFilter.handleField1Change,
          options: shiftingFilter.field1Options,
          placeholder: 'Select crop'
        }}
        field2={{
          label: 'Batch',
          value: shiftingFilter.selectedField2,
          onChange: shiftingFilter.handleField2Change,
          options: shiftingFilter.field2Options,
          placeholder: 'Select batch'
        }}
        onSearch={shiftingFilter.handleSearch}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Shifting Register</CardTitle>
            <div className="flex gap-2">
            <BackToMainDataButton 
              isVisible={shiftingFilter.isFiltered}
              onClick={shiftingFilter.handleReset}
            />
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => resetForm()}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Shifting Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Select Date</Label>
                      <Input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => handleDateSelect(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Select Batch Name</Label>
                      <Select value={selectedBatch} onValueChange={handleBatchSelect} disabled={!selectedDate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableBatches.map(batch => (
                            <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {editingId && (
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <Label>Date</Label>
                        <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                      </div>
                      <div>
                        <Label>Crop Name</Label>
                        <Input value={formData.cropName} onChange={(e) => setFormData({...formData, cropName: e.target.value})} />
                      </div>
                      <div>
                        <Label>Batch</Label>
                        <Input value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} />
                      </div>
                      <div className="col-span-2">
                        <Label>Old Location</Label>
                        <Input value={formData.oldLocation} onChange={(e) => setFormData({...formData, oldLocation: e.target.value})} />
                      </div>
                      <div>
                        <Label>Plants</Label>
                        <Input type="number" value={formData.plants} onChange={(e) => setFormData({...formData, plants: e.target.value})} />
                      </div>
                      <div className="col-span-3">
                        <Label>New Location</Label>
                        <Input value={formData.newLocation} onChange={(e) => setFormData({...formData, newLocation: e.target.value})} />
                      </div>
                      <div className="col-span-3">
                        <Label>Reason for Shift</Label>
                        <Input value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
                      </div>
                      <div className="col-span-3">
                        <Label>Notes</Label>
                        <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => { setIsEditModalOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  {!editingId ? (
                    <Button 
                      variant={null as any}
                      style={{ backgroundColor: '#4CAF50', color: 'white' }}
                      className="hover:bg-[#66BB6A] font-medium shadow-sm"
                      onClick={handleSearch}
                      disabled={!selectedDate || !selectedBatch}
                    >
                      Search
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="destructive"
                        onClick={() => setDeleteConfirmOpen(true)}
                      >
                        Delete Entry
                      </Button>
                      <Button 
                        variant={null as any}
                        style={{ backgroundColor: '#4CAF50', color: 'white' }}
                        className="hover:bg-[#66BB6A] font-medium shadow-sm"
                        onClick={handleSaveChanges}
                      >
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm"
                  className="bg-[#4CAF50] hover:bg-[#66BB6A] text-white border-0"
                  style={{ backgroundColor: '#4CAF50', color: 'white' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Shift
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Shift Entry</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4 py-4">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Crop Name</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select crop" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rose">Rose</SelectItem>
                        <SelectItem value="gerbera">Gerbera</SelectItem>
                        <SelectItem value="carnation">Carnation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Batch</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="b2024-1145">B-2024-1145</SelectItem>
                        <SelectItem value="b2024-1144">B-2024-1144</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Old Location</Label>
                    <Input placeholder="e.g., T1 / Tray 5 / C10-C20" />
                  </div>
                  <div>
                    <Label>New Location</Label>
                    <Input placeholder="e.g., T2 / Tray 12 / C1-C11" />
                  </div>
                  <div>
                    <Label>Number of Plants</Label>
                    <Input type="number" placeholder="e.g., 264" />
                  </div>
                  <div className="col-span-3">
                    <Label>Reason for Shift</Label>
                    <Input placeholder="e.g., Better light exposure" />
                  </div>
                  <div className="col-span-3">
                    <Label>Notes</Label>
                    <Textarea placeholder="Enter notes..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-[#4CAF50] hover:bg-[#66BB6A]"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Save Shift
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={shiftingFilter.visibleData}
            showActions={false}
          />
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEntry} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
