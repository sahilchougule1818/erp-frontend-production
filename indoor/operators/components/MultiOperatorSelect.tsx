import { useState } from 'react';
import { Input } from '../../shared/ui/input';
import { Label } from '../../shared/ui/label';

interface MultiOperatorSelectProps {
  operators: any[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function MultiOperatorSelect({ operators, selectedIds, onChange }: MultiOperatorSelectProps) {
  const [search, setSearch] = useState('');

  const filteredOperators = operators.filter(op =>
    op.short_name?.toLowerCase().includes(search.toLowerCase()) ||
    op.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    op.last_name?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOperator = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Operators *</Label>
      <Input
        type="text"
        placeholder="Search operators..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {search && filteredOperators.length > 0 && (
        <div className="border rounded-md max-h-48 overflow-y-auto bg-white">
          {filteredOperators.map((op: any) => {
            const isSelected = selectedIds.includes(String(op.id));
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => {
                  toggleOperator(String(op.id));
                  setSearch('');
                }}
                className="w-full text-left px-3 py-2 text-base hover:bg-blue-50 flex items-center justify-between"
              >
                <span>{op.short_name} ({op.first_name} {op.last_name})</span>
                {isSelected && <span className="text-blue-600">✓</span>}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border rounded-md bg-gray-50">
        {selectedIds.length === 0 ? (
          <span className="text-base text-gray-400">No operators selected</span>
        ) : (
          selectedIds.map((id: string) => {
            const op = operators.find((o: any) => String(o.id) === id);
            if (!op) return null;
            return (
              <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-base">
                {op.short_name}
                <button type="button" onClick={() => toggleOperator(id)} className="hover:text-blue-900">×</button>
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}
