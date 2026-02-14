import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { FilterBar } from '../../common/FilterBar';
import { BackToMainDataButton } from '../../common/BackToMainDataButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';

// Field interface - defines structure for form fields
interface Field {
  key: string;           // Field identifier
  label: string;         // Display label
  type?: string;         // Input type (text, date, time, number, textarea)
  placeholder?: string;  // Placeholder text
  span?: number;         // Column span for grid layout
}

// Props interface for CRUDTable component
interface CRUDTableProps {
  title: string;                    // Table title
  fields: Field[];                  // Form field configuration
  columns: string[];                // Table column headers
  dataKeys: string[];               // Database field keys for table columns
  api: {                            // API endpoints for CRUD operations
    get: () => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
  };
  mapToForm: (record: any) => any;  // Maps database record to form format
  mapToPayload: (form: any) => any; // Maps form data to API payload format
  renderCell?: (key: string, value: any) => React.ReactNode; // Custom cell renderer
  filterFields?: { field1Key: string; field1Label: string; field2Key: string; field2Label: string }; // Filter configuration
}

/**
 * CRUDTable - Reusable component for Create, Read, Update, Delete operations
 * Features:
 * - Dynamic form generation from field configuration
 * - Filtering by two fields (configurable)
 * - Shows 5 recent records by default, all when filtered
 * - Operator dropdown integration
 * - Custom cell rendering support
 */
export function CRUDTable({ title, fields, columns, dataKeys, api, mapToForm, mapToPayload, renderCell, filterFields }: CRUDTableProps) {
  // State management
  const [records, setRecords] = useState([]);           // All records from database
  const [operators, setOperators] = useState([]);       // List of operators for dropdown
  const [modal, setModal] = useState(false);            // Add/Edit modal visibility
  const [edit, setEdit] = useState(false);              // Edit mode flag
  const [deleteConfirm, setDeleteConfirm] = useState(false); // Delete confirmation dialog
  const [deleteId, setDeleteId] = useState(null);       // ID of record to delete
  const [form, setForm] = useState({});                 // Form data
  const [selectedCrop, setSelectedCrop] = useState(''); // First filter value
  const [selectedBatch, setSelectedBatch] = useState(''); // Second filter value
  const [isFiltered, setIsFiltered] = useState(false);  // Filter active flag
  const [searchModal, setSearchModal] = useState(false); // Edit by search modal
  const [searchDate, setSearchDate] = useState('');      // Search date
  const [searchBatch, setSearchBatch] = useState('');    // Search batch name

  // Fetch records and operators on component mount
  useEffect(() => { 
    fetchRecords(); 
    fetchOperators();
  }, []);

  /**
   * Fetches operator list from API for dropdown
   */
  const fetchOperators = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/operators`);
      const data = await res.json();
      setOperators(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  /**
   * Generates options for first filter dropdown
   * Formats dates to remove timestamp if field is a date
   */
  const filter1Options = useMemo(() => {
    if (!filterFields) return [];
    const values = Array.from(new Set(records.map(r => {
      const val = r[filterFields.field1Key];
      // Format date if it's a date field
      if (filterFields.field1Key.includes('date') && val) {
        return val.split('T')[0];
      }
      return val;
    }).filter(Boolean)));
    return values.map(v => ({ value: v, label: v }));
  }, [records, filterFields]);

  /**
   * Generates options for second filter dropdown
   * Cascades based on first filter selection
   */
  const filter2Options = useMemo(() => {
    if (!filterFields) return [];
    const filtered = selectedCrop ? records.filter(r => {
      const val = r[filterFields.field1Key];
      const compareVal = filterFields.field1Key.includes('date') && val ? val.split('T')[0] : val;
      return compareVal === selectedCrop;
    }) : records;
    const values = Array.from(new Set(filtered.map(r => r[filterFields.field2Key]).filter(Boolean)));
    return values.map(v => ({ value: v, label: v }));
  }, [records, selectedCrop, filterFields]);

  /**
   * Generates batch options for search modal based on selected date
   */
  const searchBatchOptions = useMemo(() => {
    if (!filterFields || !searchDate) return [];
    const filtered = records.filter(r => {
      const val = r[filterFields.field1Key];
      const compareVal = filterFields.field1Key.includes('date') && val ? val.split('T')[0] : val;
      return compareVal === searchDate;
    });
    const values = Array.from(new Set(filtered.map(r => r[filterFields.field2Key]).filter(Boolean)));
    return values.map(v => ({ value: v, label: v }));
  }, [records, searchDate, filterFields]);

  /**
   * Handles search for batch to edit
   */
  const handleEditSearch = useCallback(() => {
    if (!searchDate || !searchBatch) {
      alert('Please select both date and batch name');
      return;
    }
    const record = records.find(r => {
      const val = r[filterFields.field1Key];
      const compareVal = filterFields.field1Key.includes('date') && val ? val.split('T')[0] : val;
      return compareVal === searchDate && r[filterFields.field2Key] === searchBatch;
    });
    if (record) {
      setForm(mapToForm(record));
      setEdit(true);
      setSearchModal(false);
      setModal(true);
      setSearchDate('');
      setSearchBatch('');
    } else {
      alert('No record found');
    }
  }, [searchDate, searchBatch, records, filterFields, mapToForm]);

  /**
   * Computes visible records based on filter state
   * Shows 5 most recent by default, all matching when filtered
   */
  const visibleRecords = useMemo(() => {
    let filtered = records;
    
    if (isFiltered && filterFields) {
      if (selectedCrop) {
        filtered = filtered.filter(r => {
          const val = r[filterFields.field1Key];
          const compareVal = filterFields.field1Key.includes('date') && val ? val.split('T')[0] : val;
          return compareVal === selectedCrop;
        });
      }
      if (selectedBatch) {
        filtered = filtered.filter(r => r[filterFields.field2Key] === selectedBatch);
      }
      return filtered;
    }
    
    // Show only 5 most recent by default
    return filtered.slice(0, 5);
  }, [records, selectedCrop, selectedBatch, isFiltered, filterFields]);

  /**
   * Activates filter mode when search is clicked
   */
  const handleSearch = useCallback(() => {
    if (selectedCrop || selectedBatch) {
      setIsFiltered(true);
    }
  }, [selectedCrop, selectedBatch]);

  /**
   * Resets all filters and returns to default view
   */
  const handleReset = useCallback(() => {
    setSelectedCrop('');
    setSelectedBatch('');
    setIsFiltered(false);
  }, []);

  /**
   * Handles first filter change and resets second filter (cascading)
   */
  const handleCropChange = useCallback((value: string) => {
    setSelectedCrop(value);
    setSelectedBatch('');
  }, []);

  /**
   * Fetches all records from API
   */
  const fetchRecords = async () => {
    try {
      const response = await api.get();
      setRecords(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  /**
   * Handles form submission for create/update operations
   * Validates required fields before submission
   */
  const handleSave = async () => {
    try {
      // Validate required fields (excludes textarea fields)
      const emptyFields = fields
        .filter(f => f.key !== 'remark' && f.key !== 'contamination' && f.type !== 'textarea')
        .filter(f => !form[f.key] || form[f.key].toString().trim() === '')
        .map(f => f.label);
      
      if (emptyFields.length > 0) {
        alert('Please fill all required fields');
        return;
      }

      const payload = mapToPayload(form);
      await (edit && form.id ? api.update(form.id, payload) : api.create(payload));
      fetchRecords();
      closeModal();
      alert('Saved!');
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  /**
   * Handles record deletion
   */
  const handleDelete = async () => {
    try {
      await api.delete(deleteId);
      fetchRecords();
      setDeleteConfirm(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  /**
   * Closes modal and resets form state
   */
  const closeModal = () => {
    setModal(false);
    setForm({});
    setEdit(false);
  };

  /**
   * Renders appropriate input field based on field configuration
   * Special handling for operator dropdown and textarea fields
   */
  const renderField = (f: Field) => {
    // Render operator dropdown
    if (f.key === 'operatorName' || f.key === 'operator') {
      return (
        <Select value={form[f.key] || ''} onValueChange={(v) => setForm({...form, [f.key]: v})}>
          <SelectTrigger><SelectValue placeholder="Select operator" /></SelectTrigger>
          <SelectContent>
            {operators.map(op => <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    }
    // Render textarea
    if (f.type === 'textarea') {
      return <Textarea placeholder={f.placeholder} value={form[f.key] || ''} onChange={(e) => setForm({...form, [f.key]: e.target.value})} />;
    }
    // Render standard input
    return <Input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key] || ''} onChange={(e) => setForm({...form, [f.key]: e.target.value})} />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filter bar - only shows if filterFields configured */}
      {filterFields && (
        <FilterBar
          field1={{
            label: filterFields.field1Label,
            value: selectedCrop,
            onChange: handleCropChange,
            options: filter1Options,
            placeholder: `Select ${filterFields.field1Label.toLowerCase()}`
          }}
          field2={{
            label: filterFields.field2Label,
            value: selectedBatch,
            onChange: setSelectedBatch,
            options: filter2Options,
            placeholder: `Select ${filterFields.field2Label.toLowerCase()}`
          }}
          onSearch={handleSearch}
        />
      )}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <div className="flex items-center gap-2">
              {/* Back button - only shows when filtered */}
              <BackToMainDataButton isVisible={isFiltered} onClick={handleReset} />
              {/* Edit by Search button */}
              {filterFields && (
                <Dialog open={searchModal} onOpenChange={setSearchModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline"><Search className="w-4 h-4 mr-2" />Edit</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Search Batch to Edit</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>{filterFields.field1Label}</Label>
                        <Input type="date" value={searchDate} onChange={(e) => { setSearchDate(e.target.value); setSearchBatch(''); }} />
                      </div>
                      <div className="space-y-2">
                        <Label>{filterFields.field2Label}</Label>
                        <Select value={searchBatch} onValueChange={setSearchBatch} disabled={!searchDate}>
                          <SelectTrigger><SelectValue placeholder={`Select ${filterFields.field2Label.toLowerCase()}`} /></SelectTrigger>
                          <SelectContent>
                            {searchBatchOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => { setSearchModal(false); setSearchDate(''); setSearchBatch(''); }}>Cancel</Button>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={handleEditSearch}>Search</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {/* Add New button */}
              <Dialog open={modal} onOpenChange={(o) => { setModal(o); if (!o) closeModal(); }}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700"><Plus className="w-4 h-4 mr-2" />Add New</Button>
                </DialogTrigger>
                {/* Add/Edit Modal */}
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{edit ? 'Edit' : 'Add'} {title}</DialogTitle></DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    {fields.map(f => (
                      <div key={f.key} className={`space-y-2 ${f.span === 2 ? 'col-span-2' : ''}`}>
                        <Label>{f.label}</Label>
                        {renderField(f)}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={closeModal}>Cancel</Button>
                    {edit && <Button variant="destructive" onClick={() => { setDeleteId(form.id); setDeleteConfirm(true); setModal(false); }}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>Save</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">

            {/* Data Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {columns.map(c => <th key={c} className="px-4 py-3 text-left text-xs text-gray-600">{c}</th>)}
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords.length === 0 ? (
                    <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-sm text-gray-500">No records found.</td></tr>
                  ) : (
                    visibleRecords.map(record => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        {dataKeys.map(key => (
                          <td key={key} className="px-4 py-3 text-sm">
                            {/* Use custom renderer if provided, otherwise show raw value */}
                            {renderCell ? renderCell(key, record[key]) : record[key]}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-sm">
                          {/* Edit button */}
                          <Button variant="ghost" size="sm" onClick={() => { setForm(mapToForm(record)); setEdit(true); setModal(true); }}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
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
