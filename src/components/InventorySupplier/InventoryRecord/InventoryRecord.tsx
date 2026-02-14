import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { Badge } from '../../ui/badge';
import { FilterBar } from '../../common/FilterBar';
import { BackToMainDataButton } from '../../common/BackToMainDataButton';
import { useSearchFilter } from '../../../hooks/useSearchFilter';
import { INVENTORY_ITEMS } from '../../../constants/inventoryItems';

type PurchaseRecord = {
  id: number;
  dateOfPurchase: string;
  itemName: string;
  quantityPurchased: number;
  currentStock: number;
};

type WithdrawalRecord = {
  id: number;
  itemName: string;
  previousStock: number;
  withdrawQuantity: number;
  currentStock: number;
  dateOfWithdrawal: string;
};

export function InventoryRecord() {
  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([
    { id: 1, dateOfPurchase: todayDate, itemName: 'Cocopeat', quantityPurchased: 100, currentStock: 500 },
    { id: 2, dateOfPurchase: '2024-11-15', itemName: 'Peatmoss', quantityPurchased: 200, currentStock: 800 },
  ]);

  const [withdrawalRecords, setWithdrawalRecords] = useState<WithdrawalRecord[]>([
    { id: 1, itemName: 'Cocopeat', previousStock: 500, withdrawQuantity: 50, currentStock: 450, dateOfWithdrawal: todayDate },
    { id: 2, itemName: 'Pot', previousStock: 300, withdrawQuantity: 30, currentStock: 270, dateOfWithdrawal: '2024-11-15' },
  ]);

  const inventoryFilter = useSearchFilter({
    sourceData: withdrawalRecords,
    field1Accessor: (record) => record.dateOfWithdrawal,
    field2Accessor: (record) => record.itemName
  });

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isEditWithdrawalModalOpen, setIsEditWithdrawalModalOpen] = useState(false);
  const [editingWithdrawalId, setEditingWithdrawalId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'purchase' | 'withdrawal', id: number } | null>(null);
  const [withdrawalSearchClicked, setWithdrawalSearchClicked] = useState(false);

  const [purchaseForm, setPurchaseForm] = useState({
    dateOfPurchase: todayDate,
    itemName: '',
    quantityPurchased: '',
    currentStock: ''
  });

  const [withdrawalForm, setWithdrawalForm] = useState({
    itemName: '',
    previousStock: '',
    withdrawQuantity: '',
    currentStock: '',
    dateOfWithdrawal: todayDate
  });

  const availableItemNames = useMemo(() => {
    const allNames = [
      ...purchaseRecords.map(rec => rec.itemName),
      ...withdrawalRecords.map(rec => rec.itemName)
    ];
    return Array.from(new Set(allNames));
  }, [purchaseRecords, withdrawalRecords]);

  const handlePurchaseItemSelect = (itemName: string) => {
    setPurchaseForm({ ...purchaseForm, itemName });
  };

  const handleWithdrawalItemSelect = (itemName: string) => {
    if (isEditWithdrawalModalOpen) {
      setWithdrawalForm({ ...withdrawalForm, itemName, previousStock: '', withdrawQuantity: '', currentStock: '' });
      setWithdrawalSearchClicked(false);
      setEditingWithdrawalId(null);
    } else {
      // Auto-populate Previous Stock from the most recent withdrawal record for this item
      const latestWithdrawalRecord = withdrawalRecords
        .filter(rec => rec.itemName === itemName)
        .sort((a, b) => new Date(b.dateOfWithdrawal).getTime() - new Date(a.dateOfWithdrawal).getTime())[0];
      
      let previousStock = '';
      
      if (latestWithdrawalRecord) {
        // Use current stock from last withdrawal
        previousStock = String(latestWithdrawalRecord.currentStock);
      } else {
        // If no withdrawal records, use current stock from purchase records
        const purchaseRecord = purchaseRecords.find(rec => rec.itemName === itemName);
        previousStock = purchaseRecord ? String(purchaseRecord.currentStock) : '';
      }
      
      setWithdrawalForm({ 
        ...withdrawalForm, 
        itemName,
        previousStock
      });
    }
  };

  const handlePurchaseDateChange = (date: string) => {
    setPurchaseForm({ ...purchaseForm, dateOfPurchase: date, itemName: '' });
  };

  const handleWithdrawalDateChange = (date: string) => {
    setWithdrawalForm({ ...withdrawalForm, dateOfWithdrawal: date, itemName: '', previousStock: '', withdrawQuantity: '', currentStock: '' });
    // Reset editing ID when date changes in edit mode
    if (isEditWithdrawalModalOpen) {
      setEditingWithdrawalId(null);
      setWithdrawalSearchClicked(false);
    }
  };

  const handleSearchWithdrawalRecord = () => {
    if (withdrawalForm.dateOfWithdrawal && withdrawalForm.itemName) {
      const record = withdrawalRecords.find(rec =>
        rec.dateOfWithdrawal === withdrawalForm.dateOfWithdrawal && rec.itemName === withdrawalForm.itemName
      );
      if (record) {
        setWithdrawalForm({
          itemName: record.itemName,
          previousStock: String(record.previousStock),
          withdrawQuantity: String(record.withdrawQuantity),
          currentStock: String(record.currentStock),
          dateOfWithdrawal: record.dateOfWithdrawal
        });
        setEditingWithdrawalId(record.id);
        setWithdrawalSearchClicked(true);
      }
    }
  };

  const handleSavePurchase = () => {
    const newRecord = {
      ...purchaseForm,
      quantityPurchased: parseInt(purchaseForm.quantityPurchased) || 0,
      currentStock: parseInt(purchaseForm.currentStock) || 0
    };

    const maxId = purchaseRecords.length > 0 ? Math.max(...purchaseRecords.map(r => r.id)) : 0;
    const newId = maxId + 1;
    setPurchaseRecords([...purchaseRecords, { id: newId, ...newRecord }]);
    setIsPurchaseModalOpen(false);
    resetPurchaseForm();
  };

  const handleSaveWithdrawal = () => {
    const prevStock = parseInt(withdrawalForm.previousStock) || 0;
    const withdrawQty = parseInt(withdrawalForm.withdrawQuantity) || 0;
    const calculatedCurrentStock = prevStock - withdrawQty;

    const newRecord = {
      itemName: withdrawalForm.itemName,
      previousStock: prevStock,
      withdrawQuantity: withdrawQty,
      currentStock: calculatedCurrentStock,
      dateOfWithdrawal: withdrawalForm.dateOfWithdrawal
    };

    if (editingWithdrawalId) {
      setWithdrawalRecords(withdrawalRecords.map(rec =>
        rec.id === editingWithdrawalId ? { ...rec, ...newRecord } : rec
      ));
    } else {
      const maxId = withdrawalRecords.length > 0 ? Math.max(...withdrawalRecords.map(r => r.id)) : 0;
      const newId = maxId + 1;
      setWithdrawalRecords([...withdrawalRecords, { id: newId, ...newRecord }]);
    }
    setIsWithdrawalModalOpen(false);
    setIsEditWithdrawalModalOpen(false);
    resetWithdrawalForm();
  };

  const handleEditRegister = () => {
    setEditingWithdrawalId(null);
    setWithdrawalSearchClicked(false);
    setWithdrawalForm({
      itemName: '',
      previousStock: '',
      withdrawQuantity: '',
      currentStock: '',
      dateOfWithdrawal: todayDate
    });
    setIsEditWithdrawalModalOpen(true);
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    setWithdrawalRecords(withdrawalRecords.filter(rec => rec.id !== itemToDelete.id));
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
    if (isEditWithdrawalModalOpen) {
      setIsEditWithdrawalModalOpen(false);
      resetWithdrawalForm();
    }
  };

  const resetPurchaseForm = () => {
    setPurchaseForm({
      dateOfPurchase: todayDate,
      itemName: '',
      quantityPurchased: '',
      currentStock: ''
    });
  };

  const resetWithdrawalForm = () => {
    setEditingWithdrawalId(null);
    setWithdrawalSearchClicked(false);
    setWithdrawalForm({
      itemName: '',
      previousStock: '',
      withdrawQuantity: '',
      currentStock: '',
      dateOfWithdrawal: todayDate
    });
  };

  // Get available item names for the selected date for purchase edit modal
  const availablePurchaseItemNamesForDate = useMemo(() => {
    if (!purchaseForm.dateOfPurchase) return [];
    const recordsForDate = purchaseRecords.filter(rec => rec.dateOfPurchase === purchaseForm.dateOfPurchase);
    return Array.from(new Set(recordsForDate.map(rec => rec.itemName)));
  }, [purchaseForm.dateOfPurchase, purchaseRecords]);

  // Get available item names for the selected date for withdrawal edit modal
  const availableWithdrawalItemNamesForDate = useMemo(() => {
    if (!withdrawalForm.dateOfWithdrawal) return [];
    const recordsForDate = withdrawalRecords.filter(rec => rec.dateOfWithdrawal === withdrawalForm.dateOfWithdrawal);
    return Array.from(new Set(recordsForDate.map(rec => rec.itemName)));
  }, [withdrawalForm.dateOfWithdrawal, withdrawalRecords]);


  return (
    <div className="p-6 space-y-6">
      <FilterBar 
        field1={{
          label: 'Date',
          value: inventoryFilter.selectedField1,
          onChange: inventoryFilter.handleField1Change,
          options: inventoryFilter.field1Options,
          placeholder: 'Select date'
        }}
        field2={{
          label: 'Item Name',
          value: inventoryFilter.selectedField2,
          onChange: inventoryFilter.handleField2Change,
          options: inventoryFilter.field2Options,
          placeholder: 'Select item'
        }}
        onSearch={inventoryFilter.handleSearch}
      />

      <Card>
        <CardHeader>
          <CardTitle>Inventory Record</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <BackToMainDataButton 
                isVisible={inventoryFilter.isFiltered}
                onClick={inventoryFilter.handleReset}
              />
              <Button
                variant="outline"
                onClick={handleEditRegister}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                Export
              </Button>
              <Dialog open={isWithdrawalModalOpen} onOpenChange={(open: boolean) => {
                setIsWithdrawalModalOpen(open);
                if (!open) resetWithdrawalForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => resetWithdrawalForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Inventory Withdrawal Record</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Date of Withdrawal</Label>
                      <Input
                        type="date"
                        value={withdrawalForm.dateOfWithdrawal}
                        onChange={(e) => setWithdrawalForm({ ...withdrawalForm, dateOfWithdrawal: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Item Name</Label>
                      <Select value={withdrawalForm.itemName} onValueChange={handleWithdrawalItemSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item name" />
                        </SelectTrigger>
                        <SelectContent>
                          {INVENTORY_ITEMS.map(name => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Previous Quantity</Label>
                      <Input
                        type="number"
                        placeholder="Auto-filled"
                        value={withdrawalForm.previousStock}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Withdraw Quantity</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 50"
                        value={withdrawalForm.withdrawQuantity}
                        onChange={(e) => {
                          const withdrawQty = e.target.value;
                          const prevStock = parseInt(withdrawalForm.previousStock) || 0;
                          const withdrawNum = parseInt(withdrawQty) || 0;
                          const newCurrentStock = prevStock - withdrawNum;
                          setWithdrawalForm({ 
                            ...withdrawalForm, 
                            withdrawQuantity: withdrawQty,
                            currentStock: newCurrentStock >= 0 ? String(newCurrentStock) : '0'
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Stock (After Withdrawal)</Label>
                      <Input
                        value={
                          (parseInt(withdrawalForm.previousStock) || 0) -
                          (parseInt(withdrawalForm.withdrawQuantity) || 0)
                        }
                        disabled
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsWithdrawalModalOpen(false)}>Cancel</Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveWithdrawal}>Save</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

                {/* Edit Withdrawal Dialog */}
                <Dialog open={isEditWithdrawalModalOpen} onOpenChange={(open: boolean) => {
                  setIsEditWithdrawalModalOpen(open);
                  if (!open) {
                    resetWithdrawalForm();
                  }
                }}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Inventory Withdrawal Record</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date of Withdrawal</Label>
                          <Input
                            type="date"
                            value={withdrawalForm.dateOfWithdrawal}
                            onChange={(e) => handleWithdrawalDateChange(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Item Name</Label>
                          {withdrawalForm.dateOfWithdrawal ? (
                            <Select value={withdrawalForm.itemName} onValueChange={handleWithdrawalItemSelect}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select item name" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableWithdrawalItemNamesForDate.length > 0 ? (
                                  availableWithdrawalItemNamesForDate.map(name => (
                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                  ))
                                ) : (
                                  INVENTORY_ITEMS.map(name => (
                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              placeholder="Select date first"
                              disabled
                            />
                          )}
                        </div>
                      </div>

                      {withdrawalSearchClicked && editingWithdrawalId && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div className="space-y-2">
                            <Label>Previous Stock</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 500"
                              value={withdrawalForm.previousStock}
                              onChange={(e) => setWithdrawalForm({ ...withdrawalForm, previousStock: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Withdraw Quantity</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 50"
                              value={withdrawalForm.withdrawQuantity}
                              onChange={(e) => {
                                const withdrawQty = e.target.value;
                                const prevStock = parseInt(withdrawalForm.previousStock) || 0;
                                const withdrawNum = parseInt(withdrawQty) || 0;
                                const newCurrentStock = prevStock - withdrawNum;
                                setWithdrawalForm({ 
                                  ...withdrawalForm, 
                                  withdrawQuantity: withdrawQty,
                                  currentStock: newCurrentStock >= 0 ? String(newCurrentStock) : '0'
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Current Stock (After Withdrawal)</Label>
                            <Input
                              value={
                                (parseInt(withdrawalForm.previousStock) || 0) -
                                (parseInt(withdrawalForm.withdrawQuantity) || 0)
                              }
                              disabled
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-3">
                      {!withdrawalSearchClicked && (
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={handleSearchWithdrawalRecord}
                          disabled={!withdrawalForm.dateOfWithdrawal || !withdrawalForm.itemName}
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Search
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => {
                        setIsEditWithdrawalModalOpen(false);
                        resetWithdrawalForm();
                      }}>Cancel</Button>
                      {withdrawalSearchClicked && editingWithdrawalId && (
                        <>
                          <Button 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleSaveWithdrawal}
                          >
                            Save Changes
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => {
                              if (editingWithdrawalId) {
                                setItemToDelete({ type: 'withdrawal', id: editingWithdrawalId });
                                setDeleteConfirmOpen(true);
                              }
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
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs text-gray-600 w-1/6">Item Name</th>
                        <th className="px-6 py-3 text-center text-xs text-gray-600 w-1/6">Quantity When Purchased</th>
                        <th className="px-6 py-3 text-center text-xs text-gray-600 w-1/6">Current Stock</th>
                        <th className="px-6 py-3 text-center text-xs text-gray-600 w-1/6">Withdrawn Quantity</th>
                        <th className="px-6 py-3 text-center text-xs text-gray-600 w-1/6">Previous Stock</th>
                        <th className="px-6 py-3 text-center text-xs text-gray-600 w-1/6">Date of Withdraw</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryFilter.visibleData.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {record.itemName}
                            </Badge>
                          </td>
                          <td className="px-6 py-3 text-sm text-center">{record.previousStock + record.withdrawQuantity}</td>
                          <td className="px-6 py-3 text-sm text-center">{record.currentStock}</td>
                          <td className="px-6 py-3 text-sm text-center">{record.withdrawQuantity}</td>
                          <td className="px-6 py-3 text-sm text-center">{record.previousStock}</td>
                          <td className="px-6 py-3 text-sm text-center">{record.dateOfWithdrawal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this record.
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
