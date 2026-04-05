import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Label } from '../../shared/ui/label';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../shared/ui/dialog';
import { Trash2, AlertCircle } from 'lucide-react';

type FormValues = {
  prepared_date: string;
  media_code: string;
  media_type: string;
};

interface MediaBatchFormProps {
  open: boolean;
  initialData?: any;
  operators: any[];
  onSubmit: (data: any) => void;
  onDelete?: (id: number) => void;
  onClose: () => void;
}

export function MediaBatchForm({ open, initialData, operators, onSubmit, onDelete, onClose }: MediaBatchFormProps) {
  const status = initialData?.status || 'READY FOR AUTOCLAVE';
  const isEditable = status === 'READY FOR AUTOCLAVE';
  
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      prepared_date: '',
      media_code: '',
      media_type: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        prepared_date: initialData.prepared_date?.split('T')[0] || initialData.date?.split('T')[0] || '',
        media_code: initialData.media_code || '',
        media_type: initialData.media_type || ''
      });
    } else {
      reset({ prepared_date: '', media_code: '', media_type: '' });
    }
  }, [initialData, reset]);

  const statusInfo = useMemo(() => {
    const messages = {
      'READY FOR AUTOCLAVE': 'Ready for autoclave cycle - you can edit media code and media type',
      'IN AUTOCLAVE': 'Currently in autoclave process - editing disabled',
      'COMPLETED': 'Completed - editing disabled'
    };
    const colors = {
      'READY FOR AUTOCLAVE': 'bg-yellow-100 text-yellow-800',
      'IN AUTOCLAVE': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800'
    };
    return {
      message: messages[status as keyof typeof messages] || '',
      color: colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    };
  }, [status]);

  const onSubmitForm = (data: FormValues) => {
    if (!isEditable) return;
    onSubmit({
      ...(initialData?.id && { id: initialData.id }),
      ...data
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <DialogHeader className="pb-4 border-b">
            <DialogTitle>{initialData ? 'Edit Media Batch' : 'Create Media Batch'}</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {initialData && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Workflow Status</span>
                  <Badge className={statusInfo.color}>
                    {status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {statusInfo.message}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Controller
                  name="prepared_date"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input type="date" {...field} disabled={!isEditable} />
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Media Code *</Label>
                <Controller
                  name="media_code"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input {...field} disabled={!isEditable} placeholder="e.g., MS-001" />
                  )}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Media Type</Label>
                <Controller
                  name="media_type"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} disabled={!isEditable} placeholder="e.g., MS Medium, PDA Medium" />
                  )}
                />
              </div>
            </div>

            {!isEditable && (
              <p className="text-sm text-gray-500 text-center">
                Media batch cannot be edited once it enters the autoclave process
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            
            {initialData && onDelete && isEditable && (
              <Button type="button" variant="destructive" onClick={() => onDelete(initialData.id)}>
                <Trash2 className="w-4 h-4 mr-2" />Delete
              </Button>
            )}
            
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={!isEditable}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
