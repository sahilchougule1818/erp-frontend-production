import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Button } from '../../ui/button';
import { Plus, Edit, Trash2, Search, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { FilterBar } from '../../common/FilterBar';
import { BackToMainDataButton } from '../../common/BackToMainDataButton';
import { useSearchFilter } from '../../../hooks/useSearchFilter';
import { INVENTORY_ITEMS } from '../../../constants/inventoryItems';

type Supplier = {
  id: number;
  name: string;
  contact: string;
  location: string;
  supplies: string;
};

type PurchaseRecord = {
  id: number;
  dateOfPurchase: string;
  itemName: string;
  quantityPurchased: number;
  pricing: number;
  supplierName: string;
};

export function SupplierDetail() {
  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: 1, name: 'Supplier A', contact: '1234567890', location: 'City A', supplies: 'Cocopeat' },
    { id: 2, name: 'Supplier B', contact: '0987654321', location: 'City B', supplies: 'Peatmoss' },
  ]);

  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([
    { id: 1, dateOfPurchase: todayDate, itemName: 'Cocopeat', quantityPurchased: 100, pricing: 250, supplierName: 'Supplier A' },
    { id: 2, dateOfPurchase: '2024-11-15', itemName: 'Peatmoss', quantityPurchased: 200, pricing: 500, supplierName: 'Supplier B' },
  ]);

  const purchaseFilter = useSearchFilter({
    sourceData: purchaseRecords,
    field1Accessor: (record) => record.dateOfPurchase,
    field2Accessor: (record) => record.itemName
  });

  const supplierFilter = useSearchFilter({
    sourceData: suppliers,
    field1Accessor: (record) => record.name,
    field2Accessor: (record) => record.supplies
  });

  const [activeTab, setActiveTab] = useState('purchase');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isEditPurchaseModalOpen, setIsEditPurchaseModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
  const [editingPurchaseId, setEditingPurchaseId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);
  const [purchaseToDelete, setPurchaseToDelete] = useState<number | null>(null);
  const [searchClicked, setSearchClicked] = useState(false);

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact: '',
    location: '',
    supplies: ''
  });

  const [purchaseForm, setPurchaseForm] = useState({
    dateOfPurchase: todayDate,
    itemName: '',
    quantityPurchased: '',
    pricing: '',
    supplierName: ''
  });

  const resetSupplierForm = () => {
    setEditingSupplierId(null);
    setSupplierForm({
      name: '',
      contact: '',
      location: '',
      supplies: ''
    });
  };

  const handleSaveSupplier = () => {
    if (editingSupplierId) {
      setSuppliers(suppliers.map(sup =>
        sup.id === editingSupplierId ? { ...sup, ...supplierForm } : sup
      ));
    } else {
      const maxId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) : 0;
      const newId = maxId + 1;
      setSuppliers([...suppliers, { id: newId, ...supplierForm }]);
    }
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    resetSupplierForm();
  };

  const handleEditSupplierRegister = () => {
    setEditingSupplierId(null); // Clear editing ID when opening main edit modal
    setSupplierForm({
      name: '',
      contact: '',
      location: '',
      supplies: ''
    });
    setIsEditModalOpen(true);
  };

  const handleSupplierSelect = (supplierName: string) => {
    // When a supplier is selected in the edit modal, find the full record to pre-fill the form
    const supplier = suppliers.find(sup => sup.name === supplierName);
    if (supplier) {
      setSupplierForm({
        name: supplier.name,
        contact: supplier.contact,
        location: supplier.location,
        supplies: supplier.supplies
      });
      setEditingSupplierId(supplier.id);
    } else {
      setEditingSupplierId(null);
      setSupplierForm(prev => ({ ...prev, name: supplierName, contact: '', location: '', supplies: '' }));
    }
  };

  const handleDelete = () => {
    if (supplierToDelete) {
      setSuppliers(suppliers.filter(sup => sup.id !== supplierToDelete));
      setDeleteConfirmOpen(false);
      setSupplierToDelete(null);
      setIsEditModalOpen(false); // Close edit modal if open after deleting
      resetSupplierForm();
    }
    if (purchaseToDelete) {
      setPurchaseRecords(purchaseRecords.filter(rec => rec.id !== purchaseToDelete));
      setDeleteConfirmOpen(false);
      setPurchaseToDelete(null);
      setIsEditPurchaseModalOpen(false);
      resetPurchaseForm();
    }
  };

  const resetPurchaseForm = () => {
    setEditingPurchaseId(null);
    setSearchClicked(false);
    setPurchaseForm({
      dateOfPurchase: todayDate,
      itemName: '',
      quantityPurchased: '',
      pricing: '',
      supplierName: ''
    });
  };

  const handleSavePurchase = () => {
    const newRecord = {
      ...purchaseForm,
      quantityPurchased: parseInt(purchaseForm.quantityPurchased) || 0,
      pricing: parseFloat(purchaseForm.pricing) || 0
    };

    if (editingPurchaseId) {
      setPurchaseRecords(purchaseRecords.map(rec =>
        rec.id === editingPurchaseId ? { ...rec, ...newRecord } : rec
      ));
    } else {
      const maxId = purchaseRecords.length > 0 ? Math.max(...purchaseRecords.map(r => r.id)) : 0;
      const newId = maxId + 1;
      setPurchaseRecords([...purchaseRecords, { id: newId, ...newRecord }]);
    }
    setIsPurchaseModalOpen(false);
    setIsEditPurchaseModalOpen(false);
    resetPurchaseForm();
  };

  const handleEditPurchaseRegister = () => {
    resetPurchaseForm();
    setSearchClicked(false);
    setIsEditPurchaseModalOpen(true);
  };

  const handleSearchPurchaseRecord = () => {
    if (purchaseForm.dateOfPurchase && purchaseForm.itemName) {
      const record = purchaseRecords.find(rec =>
        rec.dateOfPurchase === purchaseForm.dateOfPurchase && rec.itemName === purchaseForm.itemName
      );
      if (record) {
        setPurchaseForm({
          dateOfPurchase: record.dateOfPurchase,
          itemName: record.itemName,
          quantityPurchased: String(record.quantityPurchased),
          pricing: String(record.pricing),
          supplierName: record.supplierName
        });
        setEditingPurchaseId(record.id);
        setSearchClicked(true);
      }
    }
  };

  const handlePurchaseDateSelect = (date: string) => {
    setPurchaseForm({ ...purchaseForm, dateOfPurchase: date, itemName: '', quantityPurchased: '', pricing: '', supplierName: '' });
    if (isEditPurchaseModalOpen) {
      setEditingPurchaseId(null);
      setSearchClicked(false);
    }
  };

  const handlePurchaseItemSelect = (itemName: string) => {
    setPurchaseForm({ ...purchaseForm, itemName, quantityPurchased: '', pricing: '', supplierName: '' });
    setSearchClicked(false);
    setEditingPurchaseId(null);
  };

  const availablePurchaseItemNames = Array.from(new Set(purchaseRecords.map(rec => rec.itemName)));
  const availablePurchaseDates = Array.from(new Set(purchaseRecords.map(rec => rec.dateOfPurchase))).sort();
  const availablePurchaseItemNamesForDate = purchaseForm.dateOfPurchase
    ? Array.from(new Set(purchaseRecords.filter(rec => rec.dateOfPurchase === purchaseForm.dateOfPurchase).map(rec => rec.itemName)))
    : [];

  return (
    <div className="p-6 space-y-6">
      {activeTab === 'purchase' ? (
        <FilterBar 
          field1={{
            label: 'Date',
            value: purchaseFilter.selectedField1,
            onChange: purchaseFilter.handleField1Change,
            options: purchaseFilter.field1Options,
            placeholder: 'Select date'
          }}
          field2={{
            label: 'Item Name',
            value: purchaseFilter.selectedField2,
            onChange: purchaseFilter.handleField2Change,
            options: purchaseFilter.field2Options,
            placeholder: 'Select item'
          }}
          onSearch={purchaseFilter.handleSearch}
        />
      ) : (
        <FilterBar 
          field1={{
            label: 'Supplier Name',
            value: supplierFilter.selectedField1,
            onChange: supplierFilter.handleField1Change,
            options: supplierFilter.field1Options,
            placeholder: 'Select supplier'
          }}
          field2={{
            label: 'Supplies',
            value: supplierFilter.selectedField2,
            onChange: supplierFilter.handleField2Change,
            options: supplierFilter.field2Options,
            placeholder: 'Select item'
          }}
          onSearch={supplierFilter.handleSearch}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Supplier Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="purchase">Purchase Register</TabsTrigger>
              <TabsTrigger value="suppliers">Supplier Details</TabsTrigger>
            </TabsList>

            <TabsContent value="suppliers">
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <BackToMainDataButton 
                isVisible={supplierFilter.isFiltered}
                onClick={supplierFilter.handleReset}
              />
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button
                variant="outline"
                onClick={handleEditSupplierRegister}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Dialog open={isModalOpen} onOpenChange={(open: boolean) => {
                setIsModalOpen(open);
                if (!open) resetSupplierForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => resetSupplierForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Supplier Record</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Supplier Name</Label>
                      <Input
                        placeholder="Enter supplier name"
                        value={supplierForm.name}
                        onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact</Label>
                      <Input
                        placeholder="Enter contact number"
                        value={supplierForm.contact}
                        onChange={(e) => setSupplierForm({ ...supplierForm, contact: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        placeholder="Enter location"
                        value={supplierForm.location}
                        onChange={(e) => setSupplierForm({ ...supplierForm, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Supplies</Label>
                      <Select value={supplierForm.supplies} onValueChange={(value) => setSupplierForm({ ...supplierForm, supplies: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {INVENTORY_ITEMS.map(item => (
                            <SelectItem key={item} value={item}>{item}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => {
                      setIsModalOpen(false);
                      resetSupplierForm();
                    }}>Cancel</Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveSupplier}>
                      Save Record
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Edit Supplier Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={(open: boolean) => {
              setIsEditModalOpen(open);
              if (!open) {
                resetSupplierForm();
              }
            }}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Supplier Record</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Supplier Name</Label>
                    <Select value={supplierForm.name} onValueChange={handleSupplierSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier name" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.name}>{supplier.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Contact</Label>
                    <Input
                      placeholder="Enter contact number"
                      value={supplierForm.contact}
                      onChange={(e) => setSupplierForm({ ...supplierForm, contact: e.target.value })}
                      disabled={!editingSupplierId} // Disable if no specific record is selected for editing
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="Enter location"
                      value={supplierForm.location}
                      onChange={(e) => setSupplierForm({ ...supplierForm, location: e.target.value })}
                      disabled={!editingSupplierId} // Disable if no specific record is selected for editing
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Supplies</Label>
                    <Input
                      placeholder="e.g., Item A, Item B"
                      value={supplierForm.supplies}
                      onChange={(e) => setSupplierForm({ ...supplierForm, supplies: e.target.value })}
                      disabled={!editingSupplierId} // Disable if no specific record is selected for editing
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => {
                    setIsEditModalOpen(false);
                    resetSupplierForm();
                  }}>Cancel</Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleSaveSupplier}
                    disabled={!editingSupplierId}
                  >
                    Save Changes
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      setSupplierToDelete(editingSupplierId);
                      setDeleteConfirmOpen(true);
                    }}
                    disabled={!editingSupplierId}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th scope="col" className="w-1/12 px-4 py-3 text-left font-medium text-foreground">ID</th>
                    <th scope="col" className="w-3/12 px-4 py-3 text-left font-medium text-foreground">Supplier Name</th>
                    <th scope="col" className="w-2/12 px-4 py-3 text-left font-medium text-foreground">Contact</th>
                    <th scope="col" className="w-2/12 px-4 py-3 text-left font-medium text-foreground">Location</th>
                    <th scope="col" className="w-4/12 px-4 py-3 text-left font-medium text-foreground">Supplies</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {supplierFilter.visibleData.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-muted/50">
                      <td className="w-1/12 px-4 py-4">{supplier.id}</td>
                      <td className="w-3/12 px-4 py-4">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {supplier.name}
                        </Badge>
                      </td>
                      <td className="w-2/12 px-4 py-4">{supplier.contact}</td>
                      <td className="w-2/12 px-4 py-4">{supplier.location}</td>
                      <td className="w-4/12 px-4 py-4">{supplier.supplies}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </TabsContent>

            <TabsContent value="purchase">
              <div className="space-y-4">
                <div className="flex justify-end gap-2">
                  <BackToMainDataButton 
                    isVisible={purchaseFilter.isFiltered}
                    onClick={purchaseFilter.handleReset}
                  />
                  <Button
                    variant="outline"
                    onClick={handleEditPurchaseRegister}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Edit className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Dialog open={isPurchaseModalOpen} onOpenChange={(open: boolean) => {
                    setIsPurchaseModalOpen(open);
                    if (!open) resetPurchaseForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => resetPurchaseForm()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Data
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Purchase Record</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Date of Purchase</Label>
                          <Input
                            type="date"
                            value={purchaseForm.dateOfPurchase}
                            onChange={(e) => setPurchaseForm({ ...purchaseForm, dateOfPurchase: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Item Name</Label>
                          <Select value={purchaseForm.itemName} onValueChange={(value) => setPurchaseForm({ ...purchaseForm, itemName: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {INVENTORY_ITEMS.map(item => (
                                <SelectItem key={item} value={item}>{item}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity Purchased</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 100"
                            value={purchaseForm.quantityPurchased}
                            onChange={(e) => setPurchaseForm({ ...purchaseForm, quantityPurchased: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Price</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 250"
                            value={purchaseForm.pricing}
                            onChange={(e) => setPurchaseForm({ ...purchaseForm, pricing: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Supplier Name</Label>
                          <Select value={purchaseForm.supplierName} onValueChange={(value) => setPurchaseForm({ ...purchaseForm, supplierName: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select supplier" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers.map(supplier => (
                                <SelectItem key={supplier.id} value={supplier.name}>{supplier.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => {
                          setIsPurchaseModalOpen(false);
                          resetPurchaseForm();
                        }}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSavePurchase}>
                          Save Record
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Dialog open={isEditPurchaseModalOpen} onOpenChange={(open: boolean) => {
                  setIsEditPurchaseModalOpen(open);
                  if (!open) {
                    resetPurchaseForm();
                    setSearchClicked(false);
                  }
                }}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Purchase Record</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date of Purchase</Label>
                          <Input
                            type="date"
                            value={purchaseForm.dateOfPurchase}
                            onChange={(e) => handlePurchaseDateSelect(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Item Name</Label>
                          {purchaseForm.dateOfPurchase ? (
                            <Select value={purchaseForm.itemName} onValueChange={handlePurchaseItemSelect}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select item" />
                              </SelectTrigger>
                              <SelectContent>
                                {availablePurchaseItemNamesForDate.length > 0 ? (
                                  availablePurchaseItemNamesForDate.map(name => (
                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-records" disabled>No records for this date</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input placeholder="Select date first" disabled />
                          )}
                        </div>
                      </div>

                      {searchClicked && editingPurchaseId && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div className="space-y-2">
                            <Label>Quantity Purchased</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 100"
                              value={purchaseForm.quantityPurchased}
                              onChange={(e) => setPurchaseForm({ ...purchaseForm, quantityPurchased: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Price</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 250"
                              value={purchaseForm.pricing}
                              onChange={(e) => setPurchaseForm({ ...purchaseForm, pricing: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label>Supplier Name</Label>
                            <Select value={purchaseForm.supplierName} onValueChange={(value) => setPurchaseForm({ ...purchaseForm, supplierName: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select supplier" />
                              </SelectTrigger>
                              <SelectContent>
                                {suppliers.map(supplier => (
                                  <SelectItem key={supplier.id} value={supplier.name}>{supplier.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-3">
                      {!searchClicked && (
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={handleSearchPurchaseRecord}
                          disabled={!purchaseForm.dateOfPurchase || !purchaseForm.itemName}
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Search
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => {
                        setIsEditPurchaseModalOpen(false);
                        resetPurchaseForm();
                      }}>Cancel</Button>
                      {searchClicked && editingPurchaseId && (
                        <>
                          <Button 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleSavePurchase}
                          >
                            Save Changes
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => {
                              setPurchaseToDelete(editingPurchaseId);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="w-[8%] px-4 py-3 text-left font-medium text-foreground">ID</th>
                        <th className="w-[18%] px-4 py-3 text-left font-medium text-foreground">Date of Purchase</th>
                        <th className="w-[22%] px-4 py-3 text-left font-medium text-foreground">Item Name</th>
                        <th className="w-[17%] px-4 py-3 text-left font-medium text-foreground">Quantity Purchased</th>
                        <th className="w-[13%] px-4 py-3 text-left font-medium text-foreground">Pricing</th>
                        <th className="w-[22%] px-4 py-3 text-left font-medium text-foreground">Supplier Name</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {purchaseFilter.visibleData.map((record) => (
                        <tr key={record.id} className="hover:bg-muted/50">
                          <td className="w-[8%] px-4 py-4">{record.id}</td>
                          <td className="w-[18%] px-4 py-4">{record.dateOfPurchase}</td>
                          <td className="w-[22%] px-4 py-4">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {record.itemName}
                            </Badge>
                          </td>
                          <td className="w-[17%] px-4 py-4">{record.quantityPurchased}</td>
                          <td className="w-[13%] px-4 py-4">₹{record.pricing}</td>
                          <td className="w-[22%] px-4 py-4">{record.supplierName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this supplier record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default SupplierDetail;
