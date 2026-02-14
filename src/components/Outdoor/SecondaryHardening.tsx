import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Download, Edit2, ArrowRight } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { FilterBar } from '../common/FilterBar';
import { BackToMainDataButton } from '../common/BackToMainDataButton';
import { useSearchFilter } from '../../hooks/useSearchFilter';
import { DataTable } from '../common/DataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

const secondaryData = [
  {
    id: 1,
    transferDate: '2024-11-18',
    cropName: 'Rose',
    batchName: 'B-2024-1145',
    from: 'T1 / Tray 12 / C1-C50',
    toBed: 'Bed B1',
    plants: 1200,
    notes: 'Transferred after 14 days primary'
  },
  {
    id: 2,
    transferDate: '2024-11-16',
    cropName: 'Gerbera',
    batchName: 'B-2024-1143',
    from: 'T2 / Tray 8 / C1-C40',
    toBed: 'Bed B3',
    plants: 960,
    notes: 'Good root development'
  },
];

export function SecondaryHardening() {
  const secondaryFilter = useSearchFilter({
    sourceData: secondaryData,
    field1Accessor: (record) => record.cropName,
    field2Accessor: (record) => record.batchName
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    transferDate: '',
    cropName: '',
    batchName: '',
    from: '',
    toBed: '',
    plants: '',
    notes: ''
  });

  const columns = [
    { key: 'transferDate', label: 'Transfer Date' },
    { key: 'cropName', label: 'Crop Name' },
    { key: 'batchName', label: 'Batch Name' },
    { key: 'from', label: 'From (Primary)' },
    { key: 'toBed', label: 'To Bed (Secondary)' },
    { key: 'plants', label: 'Plants' },
    { key: 'notes', label: 'Notes' },
  ];

  const availableDates = useMemo(() => {
    return Array.from(new Set(secondaryData.map(record => record.transferDate))).sort();
  }, []);

  const availableBatches = useMemo(() => {
    if (!selectedDate) return [];
    return Array.from(new Set(secondaryData.filter(record => record.transferDate === selectedDate).map(record => record.batchName)));
  }, [selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedBatch('');
    setFormData({
      transferDate: '',
      cropName: '',
      batchName: '',
      from: '',
      toBed: '',
      plants: '',
      notes: ''
    });
    setEditingId(null);
  };

  const handleBatchSelect = (batch: string) => {
    setSelectedBatch(batch);
  };

  const handleSearch = () => {
    const recordData = secondaryData.find(record => record.transferDate === selectedDate && record.batchName === selectedBatch);
    if (recordData) {
      setFormData({
        transferDate: recordData.transferDate,
        cropName: recordData.cropName,
        batchName: recordData.batchName,
        from: recordData.from,
        toBed: recordData.toBed,
        plants: String(recordData.plants),
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
      transferDate: '',
      cropName: '',
      batchName: '',
      from: '',
      toBed: '',
      plants: '',
      notes: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      <FilterBar 
        field1={{
          label: 'Crop Name',
          value: secondaryFilter.selectedField1,
          onChange: secondaryFilter.handleField1Change,
          options: secondaryFilter.field1Options,
          placeholder: 'Select crop'
        }}
        field2={{
          label: 'Batch Name',
          value: secondaryFilter.selectedField2,
          onChange: secondaryFilter.handleField2Change,
          options: secondaryFilter.field2Options,
          placeholder: 'Select batch'
        }}
        onSearch={secondaryFilter.handleSearch}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Secondary Hardening Register</CardTitle>
            <div className="flex gap-2">
            <BackToMainDataButton 
              isVisible={secondaryFilter.isFiltered}
              onClick={secondaryFilter.handleReset}
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
                  <DialogTitle>Edit Secondary Hardening Entry</DialogTitle>
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
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <Label>Transfer Date</Label>
                        <Input type="date" value={formData.transferDate} onChange={(e) => setFormData({...formData, transferDate: e.target.value})} />
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
                        <Label>From (Primary)</Label>
                        <Input value={formData.from} onChange={(e) => setFormData({...formData, from: e.target.value})} />
                      </div>
                      <div>
                        <Label>To Bed (Secondary)</Label>
                        <Input value={formData.toBed} onChange={(e) => setFormData({...formData, toBed: e.target.value})} />
                      </div>
                      <div>
                        <Label>Plants</Label>
                        <Input type="number" value={formData.plants} onChange={(e) => setFormData({...formData, plants: e.target.value})} />
                      </div>
                      <div className="col-span-2">
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
                  Add Transfer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Transfer to Secondary Hardening</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div>
                    <Label>Transfer Date</Label>
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

                  <div className="col-span-2 border-t pt-4 mt-2">
                    <h3 className="mb-3 flex items-center gap-2">
                      <span>From — Primary Location</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
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
                            <SelectItem value="tray12">Tray 12</SelectItem>
                            <SelectItem value="tray8">Tray 8</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Cavity</Label>
                        <Input placeholder="e.g., C1-C50" />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-center py-2">
                    <ArrowRight className="w-6 h-6 text-[#4CAF50]" />
                  </div>

                  <div className="col-span-2 border-t pt-4">
                    <h3 className="mb-3">To — Secondary Bed</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Bed</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bed" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="b1">Bed B1 (Available: 1500)</SelectItem>
                            <SelectItem value="b2">Bed B2 (Available: 1200)</SelectItem>
                            <SelectItem value="b3">Bed B3 (Available: 2000)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Number of Plants</Label>
                        <Input type="number" placeholder="e.g., 1200" />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label>Notes</Label>
                    <Textarea placeholder="Enter transfer notes..." />
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
                    Save Transfer
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
            data={secondaryFilter.visibleData}
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
