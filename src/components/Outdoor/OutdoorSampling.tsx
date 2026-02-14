import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, Download, Edit2, FileCheck, X, Upload } from 'lucide-react';
import { FilterBar } from '../common/FilterBar';
import { BackToMainDataButton } from '../common/BackToMainDataButton';
import { useSearchFilter } from '../../hooks/useSearchFilter';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

const outdoorSamplingData = [
  {
    id: 1,
    sampleDate: '2024-11-18',
    cropName: 'Rose',
    batchName: 'B-2024-1145',
    stage: 'Primary Hardening',
    tunnelNo: 'T3',
    trayNo: 'TR-45',
    sentDate: '2024-11-19',
    receivedDate: '-',
    status: 'Sent',
    govtCertificate: 'Pending',
    certificateNo: '-',
    reason: '-'
  },
  {
    id: 2,
    sampleDate: '2024-11-16',
    cropName: 'Gerbera',
    batchName: 'B-2024-1142',
    stage: 'Secondary Hardening',
    tunnelNo: 'T7',
    trayNo: '-',
    sentDate: '2024-11-17',
    receivedDate: '2024-11-19',
    status: 'Received',
    govtCertificate: 'Yes',
    certificateNo: 'CERT-2024-G-788',
    reason: '-'
  },
  {
    id: 3,
    sampleDate: '2024-11-14',
    cropName: 'Carnation',
    batchName: 'B-2024-1138',
    stage: 'Primary Hardening',
    tunnelNo: 'T2',
    trayNo: 'TR-28',
    sentDate: '2024-11-15',
    receivedDate: '2024-11-18',
    status: 'Rejected',
    govtCertificate: 'No',
    certificateNo: '-',
    reason: 'Signs of viral infection detected'
  },
  {
    id: 4,
    sampleDate: '2024-11-12',
    cropName: 'Orchid',
    batchName: 'B-2024-1135',
    stage: 'Secondary Hardening',
    tunnelNo: 'T5',
    trayNo: '-',
    sentDate: '-',
    receivedDate: '-',
    status: 'Not Sent',
    govtCertificate: 'No',
    certificateNo: '-',
    reason: 'Sample collection pending'
  },
  {
    id: 5,
    sampleDate: '2024-11-10',
    cropName: 'Rose',
    batchName: 'B-2024-1130',
    stage: 'Primary Hardening',
    tunnelNo: 'T1',
    trayNo: 'TR-12',
    sentDate: '2024-11-11',
    receivedDate: '2024-11-14',
    status: 'Received',
    govtCertificate: 'Yes',
    certificateNo: 'CERT-2024-R-456',
    reason: '-'
  },
];

function getStatusBadge(status: string) {
  const statusMap: { [key: string]: string } = {
    'Received': 'bg-green-100 text-green-700',
    'Sent': 'bg-blue-100 text-blue-700',
    'Rejected': 'bg-red-100 text-red-700',
    'Not Sent': 'bg-gray-100 text-gray-700',
  };
  return <Badge className={statusMap[status] || 'bg-gray-100 text-gray-700'}>{status}</Badge>;
}

function getCertificateBadge(certificate: string) {
  if (certificate === 'Yes') {
    return <Badge className="bg-green-100 text-green-700"><FileCheck className="w-3 h-3 mr-1" />Yes</Badge>;
  } else if (certificate === 'Pending') {
    return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
  } else {
    return <Badge className="bg-gray-100 text-gray-700"><X className="w-3 h-3 mr-1" />No</Badge>;
  }
}

export function OutdoorSampling() {
  const outdoorSamplingFilter = useSearchFilter({
    sourceData: outdoorSamplingData,
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
    sampleDate: '',
    cropName: '',
    batchName: '',
    stage: '',
    tunnelNo: '',
    trayNo: '',
    sentDate: '',
    receivedDate: '',
    status: '',
    govtCertificate: '',
    certificateNo: '',
    reason: ''
  });

  const availableDates = useMemo(() => {
    return Array.from(new Set(outdoorSamplingData.map(record => record.sampleDate))).sort();
  }, []);

  const availableBatches = useMemo(() => {
    if (!selectedDate) return [];
    return Array.from(new Set(outdoorSamplingData.filter(record => record.sampleDate === selectedDate).map(record => record.batchName)));
  }, [selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedBatch('');
    setFormData({
      sampleDate: '',
      cropName: '',
      batchName: '',
      stage: '',
      tunnelNo: '',
      trayNo: '',
      sentDate: '',
      receivedDate: '',
      status: '',
      govtCertificate: '',
      certificateNo: '',
      reason: ''
    });
    setEditingId(null);
  };

  const handleBatchSelect = (batch: string) => {
    setSelectedBatch(batch);
  };

  const handleSearch = () => {
    const recordData = outdoorSamplingData.find(record => record.sampleDate === selectedDate && record.batchName === selectedBatch);
    if (recordData) {
      setFormData({
        sampleDate: recordData.sampleDate,
        cropName: recordData.cropName,
        batchName: recordData.batchName,
        stage: recordData.stage,
        tunnelNo: recordData.tunnelNo,
        trayNo: recordData.trayNo,
        sentDate: recordData.sentDate,
        receivedDate: recordData.receivedDate,
        status: recordData.status,
        govtCertificate: recordData.govtCertificate,
        certificateNo: recordData.certificateNo,
        reason: recordData.reason
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
      sampleDate: '',
      cropName: '',
      batchName: '',
      stage: '',
      tunnelNo: '',
      trayNo: '',
      sentDate: '',
      receivedDate: '',
      status: '',
      govtCertificate: '',
      certificateNo: '',
      reason: ''
    });
  };
  
  return (
    <div className="p-6 space-y-6">
      <FilterBar 
        field1={{
          label: 'Crop Name',
          value: outdoorSamplingFilter.selectedField1,
          onChange: outdoorSamplingFilter.handleField1Change,
          options: outdoorSamplingFilter.field1Options,
          placeholder: 'Select crop'
        }}
        field2={{
          label: 'Batch Name',
          value: outdoorSamplingFilter.selectedField2,
          onChange: outdoorSamplingFilter.handleField2Change,
          options: outdoorSamplingFilter.field2Options,
          placeholder: 'Select batch'
        }}
        onSearch={outdoorSamplingFilter.handleSearch}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600 mb-0.5">Total Outdoor Samples</div>
          <div className="text-2xl font-bold">35</div>
        </Card>
        <Card className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600 mb-0.5">Pending Lab Results</div>
          <div className="text-2xl font-bold text-blue-600">8</div>
        </Card>
        <Card className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600 mb-0.5">Certified</div>
          <div className="text-2xl font-bold text-green-600">24</div>
        </Card>
        <Card className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600 mb-0.5">Rejected</div>
          <div className="text-2xl font-bold text-red-600">3</div>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2>Outdoor Sampling Register</h2>
          <div className="flex gap-2">
            <BackToMainDataButton 
              isVisible={outdoorSamplingFilter.isFiltered}
              onClick={outdoorSamplingFilter.handleReset}
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
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Edit Outdoor Sampling Entry</DialogTitle>
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
                        <Label>Sample Date</Label>
                        <Input type="date" value={formData.sampleDate} onChange={(e) => setFormData({...formData, sampleDate: e.target.value})} />
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
                        <Label>Stage</Label>
                        <Select value={formData.stage} onValueChange={(value) => setFormData({...formData, stage: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Primary Hardening">Primary Hardening</SelectItem>
                            <SelectItem value="Secondary Hardening">Secondary Hardening</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Tunnel No</Label>
                        <Input value={formData.tunnelNo} onChange={(e) => setFormData({...formData, tunnelNo: e.target.value})} />
                      </div>
                      <div>
                        <Label>Tray No</Label>
                        <Input value={formData.trayNo} onChange={(e) => setFormData({...formData, trayNo: e.target.value})} />
                      </div>
                      <div>
                        <Label>Sent Date</Label>
                        <Input type="date" value={formData.sentDate} onChange={(e) => setFormData({...formData, sentDate: e.target.value})} />
                      </div>
                      <div>
                        <Label>Received Date</Label>
                        <Input type="date" value={formData.receivedDate} onChange={(e) => setFormData({...formData, receivedDate: e.target.value})} />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sent">Sent</SelectItem>
                            <SelectItem value="Received">Received</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Not Sent">Not Sent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Govt Certificate</Label>
                        <Select value={formData.govtCertificate} onValueChange={(value) => setFormData({...formData, govtCertificate: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Certificate No</Label>
                        <Input value={formData.certificateNo} onChange={(e) => setFormData({...formData, certificateNo: e.target.value})} />
                      </div>
                      <div className="col-span-3">
                        <Label>Reason (if rejected)</Label>
                        <Input value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
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
                  Add Sample
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Sample Entry</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4 py-4">
                  <div>
                    <Label>Sample Date</Label>
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
                    <Label>Stage</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary Hardening</SelectItem>
                        <SelectItem value="secondary">Secondary Hardening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tunnel No</Label>
                    <Input placeholder="e.g., T3" />
                  </div>
                  <div>
                    <Label>Tray No</Label>
                    <Input placeholder="e.g., TR-45" />
                  </div>
                  <div>
                    <Label>Sent Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="col-span-2">
                    <Label>Reason (if rejected)</Label>
                    <Input placeholder="Optional" />
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
                    Save Sample
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Sample Date</TableHead>
                  <TableHead>Crop Name</TableHead>
                  <TableHead>Batch Name</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Tunnel No</TableHead>
                  <TableHead>Tray/Bed No</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Received Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Govt Certificate</TableHead>
                  <TableHead>Certificate No</TableHead>
                  <TableHead>Reason (if rejected)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outdoorSamplingFilter.visibleData.map((sample) => (
                  <TableRow key={sample.id}>
                    <TableCell>{sample.sampleDate}</TableCell>
                    <TableCell>{sample.cropName}</TableCell>
                    <TableCell className="font-medium">{sample.batchName}</TableCell>
                    <TableCell>{sample.stage}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{sample.tunnelNo}</span>
                    </TableCell>
                    <TableCell>
                      {sample.trayNo !== '-' ? (
                        <span className="font-mono text-xs">{sample.trayNo}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{sample.sentDate}</TableCell>
                    <TableCell>{sample.receivedDate}</TableCell>
                    <TableCell>{getStatusBadge(sample.status)}</TableCell>
                    <TableCell>{getCertificateBadge(sample.govtCertificate)}</TableCell>
                    <TableCell>
                      {sample.certificateNo !== '-' ? (
                        <span className="font-mono text-xs">{sample.certificateNo}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sample.reason !== '-' ? (
                        <span className="text-sm text-red-600">{sample.reason}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this outdoor sampling entry.
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
