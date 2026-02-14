import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Download, Edit2 } from 'lucide-react';
import { FilterBar } from '../common/FilterBar';
import { BackToMainDataButton } from '../common/BackToMainDataButton';
import { useSearchFilter } from '../../hooks/useSearchFilter';
import { DataTable } from '../common/DataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

const primaryData = [
  {
    id: 1,
    date: '2024-11-18',
    cropName: 'Rose',
    batchName: 'B-2024-1145',
    tunnel: 'T1',
    tray: 'Tray 12',
    cavity: 'C1-C50',
    plants: 1200,
    workers: 4,
    waitingPeriod: 14,
    notes: 'Good acclimatization'
  },
  {
    id: 2,
    date: '2024-11-17',
    cropName: 'Gerbera',
    batchName: 'B-2024-1144',
    tunnel: 'T2',
    tray: 'Tray 8',
    cavity: 'C1-C40',
    plants: 960,
    workers: 3,
    waitingPeriod: 14,
    notes: 'Monitoring growth'
  },
];

export function PrimaryHardening() {
  const primaryFilter = useSearchFilter({
    sourceData: primaryData,
    field1Accessor: (record) => record.cropName,
    field2Accessor: (record) => record.batchName
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    date: '',
    cropName: '',
    batchName: '',
    tunnel: '',
    tray: '',
    cavity: '',
    plants: '',
    workers: '',
    waitingPeriod: '',
    notes: ''
  });

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'cropName', label: 'Crop Name' },
    { key: 'batchName', label: 'Batch Name' },
    { key: 'tunnel', label: 'Tunnel' },
    { key: 'tray', label: 'Tray' },
    { key: 'cavity', label: 'Cavity' },
    { key: 'plants', label: 'Plants' },
    { key: 'workers', label: 'Workers' },
    { key: 'waitingPeriod', label: 'Days' },
    { key: 'notes', label: 'Notes' },
  ];

  const availableDates = useMemo(() => {
    return Array.from(new Set(primaryData.map(record => record.date))).sort();
  }, []);

  const availableBatches = useMemo(() => {
    if (!selectedDate) return [];
    return Array.from(new Set(primaryData.filter(record => record.date === selectedDate).map(record => record.batchName)));
  }, [selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedBatch('');
    setFormData({
      date: '',
      cropName: '',
      batchName: '',
      tunnel: '',
      tray: '',
      cavity: '',
      plants: '',
      workers: '',
      waitingPeriod: '',
      notes: ''
    });
    setEditingId(null);
  };

  const handleBatchSelect = (batch: string) => {
    setSelectedBatch(batch);
    const recordData = primaryData.find(record => record.date === selectedDate && record.batchName === batch);
    if (recordData) {
      setFormData({
        date: recordData.date,
        cropName: recordData.cropName,
        batchName: recordData.batchName,
        tunnel: recordData.tunnel,
        tray: recordData.tray,
        cavity: recordData.cavity,
        plants: String(recordData.plants),
        workers: String(recordData.workers),
        waitingPeriod: String(recordData.waitingPeriod),
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
      batchName: '',
      tunnel: '',
      tray: '',
      cavity: '',
      plants: '',
      workers: '',
      waitingPeriod: '',
      notes: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      <FilterBar 
        field1={{
          label: 'Crop Name',
          value: primaryFilter.selectedField1,
          onChange: primaryFilter.handleField1Change,
          options: primaryFilter.field1Options,
          placeholder: 'Select crop'
        }}
        field2={{
          label: 'Batch Name',
          value: primaryFilter.selectedField2,
          onChange: primaryFilter.handleField2Change,
          options: primaryFilter.field2Options,
          placeholder: 'Select batch'
        }}
        onSearch={primaryFilter.handleSearch}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Primary Hardening Register</CardTitle>
            <div className="flex gap-2">
            <BackToMainDataButton 
              isVisible={primaryFilter.isFiltered}
              onClick={primaryFilter.handleReset}
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
                  <DialogTitle>Edit Primary Hardening Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Select Date</Label>
                      <Select value={selectedDate} onValueChange={handleDateSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDates.map(date => (
                            <SelectItem key={date} value={date}>{date}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        <Label>Batch Name</Label>
                        <Input value={formData.batchName} onChange={(e) => setFormData({...formData, batchName: e.target.value})} />
                      </div>
                      <div>
                        <Label>Tunnel</Label>
                        <Input value={formData.tunnel} onChange={(e) => setFormData({...formData, tunnel: e.target.value})} />
                      </div>
                      <div>
                        <Label>Tray</Label>
                        <Input value={formData.tray} onChange={(e) => setFormData({...formData, tray: e.target.value})} />
                      </div>
                      <div>
                        <Label>Cavity</Label>
                        <Input value={formData.cavity} onChange={(e) => setFormData({...formData, cavity: e.target.value})} />
                      </div>
                      <div>
                        <Label>Plants</Label>
                        <Input type="number" value={formData.plants} onChange={(e) => setFormData({...formData, plants: e.target.value})} />
                      </div>
                      <div>
                        <Label>Workers</Label>
                        <Input type="number" value={formData.workers} onChange={(e) => setFormData({...formData, workers: e.target.value})} />
                      </div>
                      <div>
                        <Label>Waiting Period (days)</Label>
                        <Input type="number" value={formData.waitingPeriod} onChange={(e) => setFormData({...formData, waitingPeriod: e.target.value})} />
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
                  {editingId && (
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
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Primary Hardening Entry</DialogTitle>
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
                    <Label>Batch Name</Label>
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
                    <Label>Tunnel</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tunnel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="t1">Tunnel T1</SelectItem>
                        <SelectItem value="t2">Tunnel T2</SelectItem>
                        <SelectItem value="t3">Tunnel T3</SelectItem>
                        <SelectItem value="t4">Tunnel T4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tray</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tray" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tray1">Tray 1 (Available: 50)</SelectItem>
                        <SelectItem value="tray2">Tray 2 (Available: 40)</SelectItem>
                        <SelectItem value="tray3">Tray 3 (Available: 60)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cavity Range</Label>
                    <Input placeholder="e.g., C1-C50" />
                  </div>
                  <div>
                    <Label>Number of Plants</Label>
                    <Input type="number" placeholder="e.g., 1200" />
                  </div>
                  <div>
                    <Label>Number of Workers</Label>
                    <Input type="number" placeholder="e.g., 4" />
                  </div>
                  <div>
                    <Label>Waiting Period (days)</Label>
                    <Input type="number" placeholder="e.g., 14" />
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
                    Save Entry
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
            data={primaryFilter.visibleData}
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
