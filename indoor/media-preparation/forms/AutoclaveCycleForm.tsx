import { useState, useEffect } from 'react';
import { useNotify } from '../../../shared/hooks/useNotify';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Trash2, CheckCircle, X } from 'lucide-react';
import { indoorApi } from '../../services/indoorApi';

interface AutoclaveCycleFormProps {
  initialData: any;
  operators: any[];
  pendingMediaBatches: any[];
  onSubmit: (data: any) => void;
  onDelete?: (id: number) => void;
  onCancel: () => void;
}

export function AutoclaveCycleForm({ 
  initialData, 
  operators, 
  pendingMediaBatches, 
  onSubmit, 
  onDelete, 
  onCancel 
}: AutoclaveCycleFormProps) {
  const [form, setForm] = useState<any>({
    cycle_date: '',
    media_code: '',
    operator_ids: [],
    media_type: '',
    started_at: '',
    media_loaded_at: '',
    pressure_reached_at: '',
    ended_at: '',
    opened_at: '',
    media_volume: '',
    bottles_count: '',
    temperature: '',
    pressure: '',
    duration: '',
    notes: '',
    status: 'pending'
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const notify = useNotify();

  useEffect(() => {
    if (initialData) {
      setIsEditMode(true);
      setActiveTab('edit');
      
      const loadOperators = async () => {
        try {
          const assignments = await indoorApi.operators.getAssignments({
            activity_type: 'autoclave',
            media_code: initialData.media_code
          });
          const operatorIds = assignments.map((a: any) => a.operator_id);
          
          setForm({
            id: initialData.id,
            cycle_date: initialData.cycle_date?.split('T')[0] || '',
            media_code: initialData.media_code || '',
            operator_ids: operatorIds,
            media_type: initialData.media_type || '',
            started_at: initialData.started_at || initialData.autoclave_on_time || '',
            media_loaded_at: initialData.media_loaded_at || '',
            pressure_reached_at: initialData.pressure_reached_at || '',
            ended_at: initialData.ended_at || '',
            opened_at: initialData.opened_at || '',
            media_volume: initialData.media_volume || '',
            bottles_count: initialData.bottles_count || '',
            temperature: initialData.temperature || '',
            pressure: initialData.pressure || '',
            duration: initialData.duration || '',
            notes: initialData.notes || '',
            status: initialData.status || 'pending'
          });
        } catch (error) {
          console.error('Failed to load operators:', error);
        }
      };
      
      loadOperators();
    } else {
      setIsEditMode(false);
      setActiveTab('basic');
    }
  }, [initialData]);

  const handleSubmit = () => {
    let submitData;
    
    if (isEditMode) {
      const data: any = {
        id: form.id,
        operator_ids: form.operator_ids || []
      };
      
      if (form.media_loaded_at) data.media_loaded_at = form.media_loaded_at;
      if (form.pressure_reached_at) data.pressure_reached_at = form.pressure_reached_at;
      if (form.ended_at) data.ended_at = form.ended_at;
      if (form.opened_at) data.opened_at = form.opened_at;
      if (form.media_volume) data.media_volume = parseInt(form.media_volume);
      if (form.bottles_count) data.bottles_count = parseInt(form.bottles_count);
      if (form.temperature) data.temperature = parseFloat(form.temperature);
      if (form.pressure) data.pressure = parseFloat(form.pressure);
      if (form.duration) data.duration = parseInt(form.duration);
      if (form.notes) data.notes = form.notes;
      if (form.status) data.status = form.status;

      submitData = data;
    } else {
      if (!form.cycle_date || !form.media_code || !form.operator_ids?.length || !form.started_at) {
        notify.error('Please fill in all required fields: Cycle Date, Media Code, Operators, and Autoclave ON Time');
        return;
      }
      
      const operatorIds = form.operator_ids.map((id: any) => typeof id === 'string' ? parseInt(id) : id);
      
      submitData = {
        cycle_date: form.cycle_date,
        media_code: form.media_code,
        operator_ids: operatorIds,
        started_at: form.started_at
      };
    }
    
    onSubmit(submitData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'aborted': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {isEditMode ? (
        // Edit Mode - Time-wise editing
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Edit Autoclave Cycle</h3>
            <Badge className={getStatusColor(form.status)}>
              {form.status.toUpperCase()}
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">
                <CheckCircle className="w-4 h-4 mr-2" />
                Process Details
              </TabsTrigger>
              <TabsTrigger value="operators">
                Operators
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-4">
              {/* Editable process details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Media Loading Time</Label>
                  <Input 
                    type="time" 
                    value={form.media_loaded_at} 
                    onChange={(e) => setForm({...form, media_loaded_at: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pressure Time</Label>
                  <Input 
                    type="time" 
                    value={form.pressure_reached_at} 
                    onChange={(e) => setForm({...form, pressure_reached_at: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Off Time</Label>
                  <Input 
                    type="time" 
                    value={form.ended_at} 
                    onChange={(e) => setForm({...form, ended_at: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Open Time</Label>
                  <Input 
                    type="time" 
                    value={form.opened_at} 
                    onChange={(e) => setForm({...form, opened_at: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Media Total</Label>
                  <Input 
                    type="number" 
                    value={form.media_volume} 
                    onChange={(e) => setForm({...form, media_volume: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bottles Count</Label>
                  <Input 
                    type="number" 
                    value={form.bottles_count} 
                    onChange={(e) => setForm({...form, bottles_count: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Temperature (°C)</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={form.temperature} 
                    onChange={(e) => setForm({...form, temperature: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pressure (PSI)</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={form.pressure} 
                    onChange={(e) => setForm({...form, pressure: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input 
                    type="number" 
                    value={form.duration} 
                    onChange={(e) => setForm({...form, duration: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="aborted">Aborted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Notes</Label>
                  <Input 
                    value={form.notes} 
                    onChange={(e) => setForm({...form, notes: e.target.value})} 
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="operators" className="space-y-4">
              {/* Operator management section */}
              <div className="space-y-4">
                <div className="text-base text-gray-600">
                  Manage operators assigned to this autoclave cycle
                </div>
                <div className="border rounded-md p-3 min-h-[60px]">
                  <Label className="text-base font-semibold mb-2 block">Currently Assigned</Label>
                  {form.operator_ids?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {form.operator_ids.map(operatorId => {
                        const operator = operators.find(op => op.id === operatorId);
                        return operator ? (
                          <Badge key={operatorId} variant="secondary">
                            {operator.short_name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-base">No operators assigned</span>
                  )}
                </div>
                
                <div>
                  <Label className="text-base font-semibold mb-2 block">Available Operators</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {operators.map((op: any) => (
                      <div key={op.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edit-operator-${op.id}`}
                          checked={form.operator_ids?.includes(op.id) || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                operator_ids: [...(form.operator_ids || []), op.id]
                              });
                            } else {
                              setForm({
                                ...form,
                                operator_ids: form.operator_ids?.filter(id => id !== op.id) || []
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <Label htmlFor={`edit-operator-${op.id}`} className="text-base cursor-pointer">
                          {op.short_name} ({op.first_name} {op.last_name})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        // Add Mode - Basic fields only
        <div>
          <h3 className="text-lg font-medium mb-4">Create Autoclave Cycle</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cycle Date *</Label>
              <Input 
                type="date" 
                value={form.cycle_date} 
                onChange={(e) => setForm({...form, cycle_date: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Media Code *</Label>
              <Select value={form.media_code} onValueChange={(v) => {
                const selectedBatch = pendingMediaBatches.find(b => b.media_code === v);
                setForm({...form, media_code: v, media_type: selectedBatch?.media_type || ''});
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pending media batch" />
                </SelectTrigger>
                <SelectContent>
                  {pendingMediaBatches.map((batch: any) => (
                    <SelectItem key={batch.id} value={batch.media_code}>
                      {batch.media_code} - {batch.prepared_date?.split('T')[0] || batch.date?.split('T')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Operators *</Label>
              <div className="border rounded-md p-3 min-h-[40px]">
                {form.operator_ids?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {form.operator_ids.map(operatorId => {
                      const operator = operators.find(op => op.id === operatorId);
                      return operator ? (
                        <Badge key={operatorId} variant="secondary" className="flex items-center gap-1">
                          {operator.short_name}
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-red-600" 
                            onClick={() => {
                              setForm({
                                ...form, 
                                operator_ids: form.operator_ids.filter(id => id !== operatorId)
                              });
                            }}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <span className="text-gray-500 text-base">No operators selected</span>
                )}
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {operators.map((op: any) => (
                  <div key={op.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`operator-${op.id}`}
                      checked={form.operator_ids?.includes(op.id) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({
                            ...form,
                            operator_ids: [...(form.operator_ids || []), op.id]
                          });
                        } else {
                          setForm({
                            ...form,
                            operator_ids: form.operator_ids?.filter(id => id !== op.id) || []
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <Label htmlFor={`operator-${op.id}`} className="text-base cursor-pointer">
                      {op.short_name} ({op.first_name} {op.last_name})
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type of Media</Label>
              <Input 
                value={form.media_type} 
                readOnly
                className="bg-gray-100"
                placeholder="Auto-filled from media batch"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Autoclave ON Time *</Label>
              <Input 
                type="time" 
                value={form.started_at} 
                onChange={(e) => setForm({...form, started_at: e.target.value})} 
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        
        {isEditMode && onDelete && (
          <Button variant="destructive" onClick={() => onDelete(form.id)}>
            <Trash2 className="w-4 h-4 mr-2" />Delete
          </Button>
        )}
        
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>
          {isEditMode ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
}
