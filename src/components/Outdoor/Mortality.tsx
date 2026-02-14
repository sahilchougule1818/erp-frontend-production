import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Download, Edit2, AlertTriangle } from 'lucide-react';
import { FilterBar } from '../common/FilterBar';
import { BackToMainDataButton } from '../common/BackToMainDataButton';
import { useSearchFilter } from '../../hooks/useSearchFilter';
import { DataTable } from '../common/DataTable';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

const mortalityData = [
  {
    id: 1,
    date: '2024-11-18',
    cropName: 'Rose',
    batch: 'B-2024-1142',
    location: 'T3 / Tray 6 / C12-C20',
    mortalityType: 'Fungal',
    affectedPlants: 47,
    actionTaken: 'Removed & disposed, area sterilized',
    notes: 'High humidity suspected cause'
  },
  {
    id: 2,
    date: '2024-11-17',
    cropName: 'Gerbera',
    batch: 'B-2024-1140',
    location: 'T2 / Tray 10 / C5-C8',
    mortalityType: 'Bacterial',
    affectedPlants: 12,
    actionTaken: 'Isolated and treated',
    notes: 'Under monitoring'
  },
  {
    id: 3,
    date: '2024-11-16',
    cropName: 'Carnation',
    batch: 'B-2024-1138',
    location: 'T1 / Tray 3 / C15-C18',
    mortalityType: 'Physiological',
    affectedPlants: 8,
    actionTaken: 'Adjusted watering schedule',
    notes: 'Water stress identified'
  },
];

export function Mortality() {
  const mortalityFilter = useSearchFilter({
    sourceData: mortalityData,
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
    location: '',
    mortalityType: '',
    affectedPlants: '',
    actionTaken: '',
    notes: ''
  });
  
  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'cropName', label: 'Crop Name' },
    { key: 'batch', label: 'Batch' },
    { key: 'location', label: 'Location' },
    { key: 'mortalityType', label: 'Mortality Type' },
    { key: 'affectedPlants', label: 'Affected Plants' },
    { key: 'actionTaken', label: 'Action Taken' },
    { key: 'notes', label: 'Notes' },
  ];

  const availableBatches = useMemo(() => {
    if (!selectedDate) return [];
    return Array.from(new Set(mortalityData.filter(record => record.date === selectedDate).map(record => record.batch)));
  }, [selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedBatch('');
    setFormData({
      date: '',
      cropName: '',
      batch: '',
      location: '',
      mortalityType: '',
      affectedPlants: '',
      actionTaken: '',
      notes: ''
    });
    setEditingId(null);
  };

  const handleBatchSelect = (batch: string) => {
    setSelectedBatch(batch);
  };

  const handleSearch = () => {
    const recordData = mortalityData.find(record => record.date === selectedDate && record.batch === selectedBatch);
    if (recordData) {
      setFormData({
        date: recordData.date,
        cropName: recordData.cropName,
        batch: recordData.batch,
        location: recordData.location,
        mortalityType: recordData.mortalityType,
        affectedPlants: String(recordData.affectedPlants),
        actionTaken: recordData.actionTaken,
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
      location: '',
      mortalityType: '',
      affectedPlants: '',
      actionTaken: '',
      notes: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      <FilterBar 
        field1={{
          label: 'Crop Name',
          value: mortalityFilter.selectedField1,
          onChange: mortalityFilter.handleField1Change,
          options: mortalityFilter.field1Options,
          placeholder: 'Select crop'
        }}
        field2={{
          label: 'Batch',
          value: mortalityFilter.selectedField2,
          onChange: mortalityFilter.handleField2Change,
          options: mortalityFilter.field2Options,
          placeholder: 'Select batch'
        }}
        onSearch={mortalityFilter.handleSearch}
      />

      <Card className="p-4 mt-6 bg-red-50 border-red-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-red-900">Mortality Alert</h3>
              <Badge className="bg-red-600">High Priority</Badge>
            </div>
            <p className="text-sm text-red-700 mb-2">
              <strong>67 plants</strong> affected by mortality this week across 3 locations. 
              Immediate action required for Tunnel T3.
            </p>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-red-600">Fungal: </span>
                <span className="font-medium">47</span>
              </div>
              <div>
                <span className="text-red-600">Bacterial: </span>
                <span className="font-medium">12</span>
              </div>
              <div>
                <span className="text-red-600">Physiological: </span>
                <span className="font-medium">8</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Outdoor Mortality Register</CardTitle>
            <div className="flex gap-2">
            <BackToMainDataButton 
              isVisible={mortalityFilter.isFiltered}
              onClick={mortalityFilter.handleReset}
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
                  <DialogTitle>Edit Mortality Entry</DialogTitle>
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
                        <Label>Location</Label>
                        <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                      </div>
                      <div>
                        <Label>Mortality Type</Label>
                        <Select value={formData.mortalityType} onValueChange={(value: string) => setFormData({...formData, mortalityType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fungal">Fungal</SelectItem>
                            <SelectItem value="Bacterial">Bacterial</SelectItem>
                            <SelectItem value="Physiological">Physiological</SelectItem>
                            <SelectItem value="Viral">Viral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Affected Plants</Label>
                        <Input type="number" value={formData.affectedPlants} onChange={(e) => setFormData({...formData, affectedPlants: e.target.value})} />
                      </div>
                      <div className="col-span-2">
                        <Label>Action Taken</Label>
                        <Input value={formData.actionTaken} onChange={(e) => setFormData({...formData, actionTaken: e.target.value})} />
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
                  Report Mortality
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Report Mortality/Contamination</DialogTitle>
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
                    <Label>Location</Label>
                    <Input placeholder="e.g., T3 / Tray 6 / C12-C20" />
                  </div>
                  <div>
                    <Label>Mortality Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fungal">Fungal</SelectItem>
                        <SelectItem value="bacterial">Bacterial</SelectItem>
                        <SelectItem value="physiological">Physiological</SelectItem>
                        <SelectItem value="viral">Viral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Affected Plants</Label>
                    <Input type="number" placeholder="e.g., 47" />
                  </div>
                  <div className="col-span-3">
                    <Label>Action Taken</Label>
                    <Input placeholder="e.g., Removed & disposed, area sterilized" />
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
                    Save Report
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
            data={mortalityFilter.visibleData}
            showActions={false}
          />
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this mortality entry.
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
