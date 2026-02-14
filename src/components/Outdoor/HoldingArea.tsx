import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Download, Edit2 } from 'lucide-react';
import { FilterBar } from '../common/FilterBar';
import { BackToMainDataButton } from '../common/BackToMainDataButton';
import { useSearchFilter } from '../../hooks/useSearchFilter';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

const holdingData = [
  {
    id: 1,
    batchName: 'B-2024-1145',
    cropName: 'Rose',
    quantity: 1200,
    dateEntered: '2024-11-15',
    daysInHolding: 3,
    remarks: 'Awaiting sales order'
  },
  {
    id: 2,
    batchName: 'B-2024-1140',
    cropName: 'Gerbera',
    quantity: 850,
    dateEntered: '2024-11-10',
    daysInHolding: 8,
    remarks: 'Customer delayed pickup'
  },
  {
    id: 3,
    batchName: 'B-2024-1135',
    cropName: 'Carnation',
    quantity: 650,
    dateEntered: '2024-10-28',
    daysInHolding: 21,
    remarks: 'Excess inventory - needs clearance'
  },
  {
    id: 4,
    batchName: 'B-2024-1132',
    cropName: 'Orchid',
    quantity: 420,
    dateEntered: '2024-10-15',
    daysInHolding: 34,
    remarks: 'Long-term holding - quality check needed'
  },
];

function getAgeBadge(days: number) {
  if (days <= 7) {
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Fresh (0-7 days)</Badge>;
  } else if (days <= 21) {
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Moderate (8-21 days)</Badge>;
  } else {
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Ageing (22+ days)</Badge>;
  }
}

export function HoldingArea() {
  const holdingFilter = useSearchFilter({
    sourceData: holdingData,
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
    batchName: '',
    cropName: '',
    quantity: '',
    dateEntered: '',
    daysInHolding: '',
    remarks: ''
  });

  const availableDates = useMemo(() => {
    return Array.from(new Set(holdingData.map(record => record.dateEntered))).sort();
  }, []);

  const availableBatches = useMemo(() => {
    if (!selectedDate) return [];
    return Array.from(new Set(holdingData.filter(record => record.dateEntered === selectedDate).map(record => record.batchName)));
  }, [selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedBatch('');
    setFormData({
      batchName: '',
      cropName: '',
      quantity: '',
      dateEntered: '',
      daysInHolding: '',
      remarks: ''
    });
    setEditingId(null);
  };

  const handleBatchSelect = (batch: string) => {
    setSelectedBatch(batch);
  };

  const handleSearch = () => {
    const recordData = holdingData.find(record => record.dateEntered === selectedDate && record.batchName === selectedBatch);
    if (recordData) {
      setFormData({
        batchName: recordData.batchName,
        cropName: recordData.cropName,
        quantity: String(recordData.quantity),
        dateEntered: recordData.dateEntered,
        daysInHolding: String(recordData.daysInHolding),
        remarks: recordData.remarks
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
      batchName: '',
      cropName: '',
      quantity: '',
      dateEntered: '',
      daysInHolding: '',
      remarks: ''
    });
  };
  
  return (
    <div className="p-6 space-y-6">
      <FilterBar 
        field1={{
          label: 'Crop Name',
          value: holdingFilter.selectedField1,
          onChange: holdingFilter.handleField1Change,
          options: holdingFilter.field1Options,
          placeholder: 'Select crop'
        }}
        field2={{
          label: 'Batch Name',
          value: holdingFilter.selectedField2,
          onChange: holdingFilter.handleField2Change,
          options: holdingFilter.field2Options,
          placeholder: 'Select batch'
        }}
        onSearch={holdingFilter.handleSearch}
      />

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600 mb-0.5">Total Batches</div>
          <div className="text-2xl font-bold">6</div>
        </Card>
        <Card className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600 mb-0.5">Fresh (0-7 days)</div>
          <div className="text-2xl font-bold text-green-600">2</div>
        </Card>
        <Card className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600 mb-0.5">Moderate (8-21 days)</div>
          <div className="text-2xl font-bold text-amber-600">2</div>
        </Card>
        <Card className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600 mb-0.5">Ageing (22+ days)</div>
          <div className="text-2xl font-bold text-red-600">2</div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Holding Area Register</CardTitle>
            <div className="flex gap-2">
            <BackToMainDataButton 
              isVisible={holdingFilter.isFiltered}
              onClick={holdingFilter.handleReset}
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
                  <DialogTitle>Edit Holding Area Entry</DialogTitle>
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
                        <Label>Batch Name</Label>
                        <Input value={formData.batchName} onChange={(e) => setFormData({...formData, batchName: e.target.value})} />
                      </div>
                      <div>
                        <Label>Crop Name</Label>
                        <Input value={formData.cropName} onChange={(e) => setFormData({...formData, cropName: e.target.value})} />
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                      </div>
                      <div>
                        <Label>Date Entered</Label>
                        <Input type="date" value={formData.dateEntered} onChange={(e) => setFormData({...formData, dateEntered: e.target.value})} />
                      </div>
                      <div>
                        <Label>Days in Holding</Label>
                        <Input type="number" value={formData.daysInHolding} onChange={(e) => setFormData({...formData, daysInHolding: e.target.value})} />
                      </div>
                      <div className="col-span-3">
                        <Label>Remarks</Label>
                        <Textarea value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} />
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
                  Add to Holding
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add to Holding Area</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4 py-4">
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
                    <Label>Quantity</Label>
                    <Input type="number" placeholder="e.g., 1200" />
                  </div>
                  <div>
                    <Label>Date Entered</Label>
                    <Input type="date" />
                  </div>
                  <div className="col-span-2">
                    <Label>Remarks</Label>
                    <Textarea placeholder="Enter remarks..." />
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
                    Save to Holding
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Batch Name</TableHead>
                  <TableHead>Crop</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date Entered</TableHead>
                  <TableHead>Days in Holding</TableHead>
                  <TableHead>Age Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdingFilter.visibleData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.batchName}</TableCell>
                    <TableCell>{row.cropName}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{row.dateEntered}</TableCell>
                    <TableCell className="font-semibold">{row.daysInHolding} days</TableCell>
                    <TableCell>{getAgeBadge(row.daysInHolding)}</TableCell>
                    <TableCell>{row.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this holding area entry.
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
