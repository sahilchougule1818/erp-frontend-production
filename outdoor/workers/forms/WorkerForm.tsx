import { useState, useEffect } from 'react';
import { Label } from '../../shared/ui/label';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { Trash2 } from 'lucide-react';

const SECTIONS = ['Primary Hardening', 'Secondary Hardening', 'Holding Area', 'Fertilization Area'];

const INITIAL_FORM = {
  id: null,
  firstName: '',
  lastName: '',
  shortName: '',
  role: 'Worker',
  section: '',
  isActive: true
};

interface OperatorFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onDelete?: (id: number) => void;
  onCancel: () => void;
}

export function WorkerForm({ initialData, onSubmit, onDelete, onCancel }: OperatorFormProps) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        firstName: initialData.first_name,
        lastName: initialData.last_name,
        shortName: initialData.short_name,
        role: initialData.role || 'Worker',
        section: initialData.section || '',
        isActive: initialData.is_active
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [initialData]);

  const generateShortName = (first: string, last: string) => {
    return `${first.trim().charAt(0).toUpperCase()}${last.trim().charAt(0).toUpperCase()}`;
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    const updated = { ...form, [field]: value };
    if (field === 'firstName' || field === 'lastName') {
      updated.shortName = generateShortName(
        field === 'firstName' ? value as string : form.firstName,
        field === 'lastName' ? value as string : form.lastName
      );
    }
    setForm(updated);
  };

  const handleSubmit = () => {
    const { firstName, lastName, section } = form;
    if (!firstName || !lastName || !section) {
      return alert('Please fill all required fields');
    }
    onSubmit(form);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-gray-700">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>First Name *</Label>
            <Input value={form.firstName} onChange={(e) => handleFormChange('firstName', e.target.value)} />
          </div>
          <div>
            <Label>Last Name *</Label>
            <Input value={form.lastName} onChange={(e) => handleFormChange('lastName', e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Short Name (Auto-generated)</Label>
          <Input value={form.shortName} disabled className="bg-gray-50 font-bold" />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-gray-700">Professional Information</h3>
        <div>
          <Label>Section *</Label>
          <Select value={form.section} onValueChange={(v) => handleFormChange('section', v)}>
            <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
            <SelectContent>
              {SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-gray-700">Status</h3>
        <div>
          <Label>Status</Label>
          <Select value={form.isActive ? 'active' : 'inactive'} onValueChange={(v) => handleFormChange('isActive', v === 'active')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        {form.id && onDelete && (
          <Button variant="destructive" onClick={() => onDelete(form.id)}>
            <Trash2 className="w-4 h-4 mr-2" />Delete
          </Button>
        )}
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  );
}