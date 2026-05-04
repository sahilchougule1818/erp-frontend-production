import { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Textarea } from '../../../shared/ui/textarea';
import { Skull, Save, X } from 'lucide-react';
import { indoorApi } from '../../services/indoorApi';
import { useNotify } from '../../../shared/hooks/useNotify';
import { Batch } from '../types';
import { ModalLayout } from '../../../shared/components/ModalLayout';

interface PreloadedRecord {
  id?: number;
  incubation_record_id?: number;
  rooted_batch_id?: number;
  batch_code: string;
  plant_name: string;
  stage: string;
  qty_contaminated: number;
  notes: string | null;
  qty_in: number;
  source_table?: string;
}

interface RecordContaminationModalProps {
  batch?: Batch;             // from batch master — will fetch active record
  preloaded?: PreloadedRecord; // from contamination page — data already loaded
  onClose: () => void;
  onSuccess: () => void;
}

export function RecordContaminationModal({ batch, preloaded, onClose, onSuccess }: RecordContaminationModalProps) {
  const [record, setRecord] = useState<PreloadedRecord | null>(preloaded ?? null);
  const [contaminationCount, setContaminationCount] = useState(preloaded?.qty_contaminated ?? 0);
  const [notes, setNotes] = useState(preloaded?.notes ?? '');
  const [loading, setLoading] = useState(!preloaded);
  const [saving, setSaving] = useState(false);
  const notify = useNotify();

  useEffect(() => {
    if (preloaded) return; // already have data
    if (!batch) return;

    let active = true;
    async function load() {
      try {
        const data = await (indoorApi.contamination.getActiveRecord(batch!.batch_code) as any);
        if (!active) return;
        setRecord(data);
        setContaminationCount(data.qty_contaminated ?? 0);
        setNotes(data.notes ?? '');
      } catch {
        if (!active) return;
        notify.error('No active incubation record found for this batch');
        onClose();
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    if (!record) return;
    if (contaminationCount < 0) {
      notify.error('Contamination cannot be negative');
      return;
    }
    if (contaminationCount > record.qty_in) {
      notify.error(`Contamination (${contaminationCount}) cannot exceed bottles entered (${record.qty_in})`);
      return;
    }
    
    const recordId = record.id || record.incubation_record_id || record.rooted_batch_id;
    if (!recordId) {
      notify.error('Invalid record ID');
      return;
    }
    
    setSaving(true);
    try {
      await indoorApi.contamination.update(recordId, {
        qty_contaminated: contaminationCount,
        contamination_count: contaminationCount,
        notes: notes || null,
        expected_contamination: record.qty_contaminated,
        source_table: record.source_table
      });
      notify.success('Contamination updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      notify.error(error.response?.data?.message || error.response?.data?.error || 'Failed to update contamination');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalLayout
      isOpen={true}
      onClose={() => !saving && onClose()}
      title="Record Contamination"
      icon={<Skull className="w-5 h-5 text-red-600" />}
      maxWidth="600px"
    >
      {loading ? (
        <div className="py-10 text-center text-base text-muted-foreground flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          Loading record...
        </div>
      ) : record ? (
        <>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 space-y-1 text-base">
              <div className="flex justify-between">
                <span className="text-gray-500">Batch</span>
                <span className="font-semibold">{record.batch_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Plant</span>
                <span className="font-semibold">{record.plant_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stage</span>
                <span className="font-semibold">{record.stage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bottles Entered</span>
                <span className="font-semibold">{record.qty_in}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Contamination Count
                <span className="text-gray-400 font-normal ml-1">(max {record.qty_in})</span>
              </Label>
              <Input
                type="number"
                min={0}
                max={record.qty_in}
                value={contaminationCount}
                onChange={(e) => setContaminationCount(parseInt(e.target.value) || 0)}
                className="text-red-800 font-bold border-red-200 focus:border-red-400"
                disabled={saving}
              />
              <div className="flex justify-between text-base px-1">
                <span className="text-gray-500">Remaining after contamination</span>
                <span className="font-bold text-green-700">
                  {Math.max(0, record.qty_in - contaminationCount)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Textarea
                placeholder="e.g. fungal contamination, drying, pest damage..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={saving}
                rows={3}
              />
            </div>
          </div>

          <div className="border-t bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={loading || saving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Contamination
                </>
              )}
            </Button>
          </div>
        </>
      ) : null}
    </ModalLayout>
  );
}
