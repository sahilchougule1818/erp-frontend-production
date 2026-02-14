import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  field1?: FilterField;
  field2?: FilterField;
  field3?: FilterField;
  onSearch?: () => void;
  batchValue?: string;
  cropValue?: string;
  onBatchChange?: (value: string) => void;
  onCropChange?: (value: string) => void;
  batches?: FilterOption[];
  crops?: FilterOption[];
}

export function FilterBar({ 
  field1,
  field2,
  field3,
  onSearch,
  batchValue, 
  cropValue, 
  onBatchChange, 
  onCropChange,
  batches = [
    { value: 'b2024-1145', label: 'B-2024-1145' },
    { value: 'b2024-1144', label: 'B-2024-1144' },
    { value: 'b2024-1143', label: 'B-2024-1143' },
    { value: 'b2024-1142', label: 'B-2024-1142' }
  ],
  crops = [
    { value: 'rose', label: 'Rose' },
    { value: 'gerbera', label: 'Gerbera' },
    { value: 'carnation', label: 'Carnation' },
    { value: 'orchid', label: 'Orchid' },
    { value: 'anthurium', label: 'Anthurium' }
  ]
}: FilterBarProps) {
  const firstField = field1 || {
    label: 'Batch Name',
    value: batchValue,
    onChange: onBatchChange,
    options: batches,
    placeholder: 'Select batch'
  };

  const secondField = field2 || {
    label: 'Crop Name',
    value: cropValue,
    onChange: onCropChange,
    options: crops,
    placeholder: 'Select crop'
  };

  return (
    <Card className="p-4">
      <div className="flex gap-4 items-end">
        {firstField && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm mb-1.5">{firstField.label}</label>
            <Select value={firstField.value} onValueChange={firstField.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={firstField.placeholder || `Select ${firstField.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {firstField.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {secondField && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm mb-1.5">{secondField.label}</label>
            <Select value={secondField.value} onValueChange={secondField.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={secondField.placeholder || `Select ${secondField.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {secondField.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {field3 && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm mb-1.5">{field3.label}</label>
            <Select value={field3.value} onValueChange={field3.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={field3.placeholder || `Select ${field3.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field3.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Button 
            variant={null as any}
            style={{ backgroundColor: '#4CAF50', color: 'white' }}
            className="hover:bg-[#66BB6A] font-medium shadow-sm h-10 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-all px-4"
            onClick={onSearch}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
    </Card>
  );
}
