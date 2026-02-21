import { useState, useMemo, useEffect } from 'react';
import { CRUDTable } from './shared/CRUDTable';
import { Badge } from '../ui/badge';
import * as indoorApi from '../../services/indoorApi';
import { useMediaCodes } from '../../hooks/useMediaCodes';
import { useIndoorBatches } from '../../hooks/useIndoorBatches';
import { Input } from '../ui/input';

export function Subculturing() {
  const { mediaCodes } = useMediaCodes();
  const { batches, reload: reloadBatches } = useIndoorBatches();
  const [currentQuantity, setCurrentQuantity] = useState(0);
  const [currentStageValue, setCurrentStageValue] = useState('New Batch');
  
  // Reload batches periodically to keep stage data fresh
  useEffect(() => {
    const interval = setInterval(() => {
      reloadBatches();
    }, 5000); // Reload every 5 seconds
    return () => clearInterval(interval);
  }, [reloadBatches]);
  
  // Filter batches based on selected current stage
  const filteredBatches = useMemo(() => {
    console.log('currentStageValue:', currentStageValue);
    console.log('all batches:', batches);
    if (currentStageValue === 'New Batch') return [];
    const filtered = batches.filter(batch => batch.stage === currentStageValue);
    console.log('filtered batches:', filtered);
    return filtered;
  }, [currentStageValue, batches]);
  
  // Generate fields dynamically
  const FIELDS = useMemo(() => {
    const baseFields = [
      { key: 'transferDate', label: 'Transfer Date', type: 'date' },
      { 
        key: 'currentStage', 
        label: 'Current Stage (Where Batch Is Now)', 
        type: 'select', 
        options: [
          {value: 'New Batch', label: 'New Batch (Create New)'},
          ...Array.from({length: 8}, (_, i) => ({value: `Stage-${i+1}`, label: `Stage-${i+1}`}))
        ],
        onChange: (value, setForm, form) => {
          setCurrentStageValue(value);
          setCurrentQuantity(0);
          if (value === 'New Batch') {
            setForm({transferDate: form.transferDate, currentStage: value, batchName: '', stageNumber: 'Stage-1', currentQuantity: 0, cropName: '', mediaCode: form.mediaCode, noOfBottles: form.noOfBottles, operatorName: form.operatorName, mortality: form.mortality, remark: form.remark});
          } else {
            setForm({transferDate: form.transferDate, currentStage: value, batchName: '', currentQuantity: 0, noOfShoots: '', cropName: '', mediaCode: form.mediaCode, noOfBottles: form.noOfBottles, operatorName: form.operatorName, mortality: form.mortality, remark: form.remark});
          }
        }
      },
      { 
        key: 'batchName', 
        label: 'Batch Name',
        type: currentStageValue === 'New Batch' ? 'text' : 'select',
        placeholder: currentStageValue === 'New Batch' ? 'Enter new batch name (e.g., SB-2024-001)' : 'Select batch',
        options: currentStageValue === 'New Batch' ? [] : filteredBatches,
        fieldKey: `batchName-${currentStageValue}`,
        onChange: currentStageValue === 'New Batch' ? undefined : async (value, setForm, form) => {
          const selected = filteredBatches.find(b => b.value === value);
          if (selected) {
            const cropName = selected.label.split('(')[1]?.replace(')', '') || '';
            try {
              const res = await indoorApi.getSubculturing();
              const data = res.data;
              console.log('All subculturing data:', data);
              console.log('Looking for batch:', value);
              const batchEntries = data.filter((entry: any) => entry.batch_code === value);
              console.log('Filtered entries for batch:', batchEntries);
              const latestEntry = batchEntries.sort((a: any, b: any) => new Date(b.transfer_date).getTime() - new Date(a.transfer_date).getTime())[0];
              console.log('Latest entry:', latestEntry);
              const qty = latestEntry?.no_of_shoots || 0;
              console.log('Quantity found:', qty);
              setCurrentQuantity(qty);
              setForm({...form, batchName: value, cropName, currentQuantity: String(qty)});
            } catch (error) {
              console.error('Error fetching batch quantity:', error);
              setForm({...form, batchName: value, cropName, currentQuantity: '0'});
            }
          }
        }
      },
      { 
        key: 'currentQuantity', 
        label: 'Current Quantity', 
        type: 'number',
        readOnly: true
      },
      { 
        key: 'stageNumber', 
        label: 'Next Stage (Where Batch Is Going)', 
        type: 'select',
        options: currentStageValue === 'New Batch' 
          ? [{value: 'Stage-1', label: 'Stage-1'}]
          : Array.from({length: 8}, (_, i) => ({value: `Stage-${i+1}`, label: `Stage-${i+1}`})),
        onChange: (value, setForm, form) => {
          setForm({...form, stageNumber: value});
        }
      },
      { key: 'mediaCode', label: 'Media Code', type: 'select', options: mediaCodes },
      { key: 'cropName', label: 'Crop Name', placeholder: 'Rose', readOnly: currentStageValue !== 'New Batch' },
      { key: 'noOfBottles', label: 'No. of Bottles', type: 'number', placeholder: '50' },
      { key: 'noOfShoots', label: currentStageValue === 'New Batch' ? 'Initial Shoots' : 'New Quantity (After Multiplication)', type: 'number', placeholder: currentStageValue === 'New Batch' ? '100' : '400' },
      { key: 'operatorName', label: 'Operator Name' },
      { key: 'mortality', label: 'Mortality', placeholder: 'Low/Medium/High' },
      { key: 'remark', label: 'Remark', type: 'textarea', span: 2 }
    ];
    
    return baseFields;
  }, [currentStageValue, filteredBatches, mediaCodes, currentQuantity]);
  
  // Filter out currentQuantity field for New Batch
  const filteredFields = useMemo(() => 
    currentStageValue === 'New Batch' 
      ? FIELDS.filter(f => f.key !== 'currentQuantity')
      : FIELDS,
    [currentStageValue, FIELDS]
  );
  return (
    <div className="p-6">
      <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-6">
        <div className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm bg-background text-foreground shadow-sm">
          Subculturing
        </div>
      </div>
      <CRUDTable
      title=""
      fields={filteredFields}
      columns={['Transfer Date', 'Stage Number', 'Batch Name', 'Media Code', 'Crop Name', 'No. of Bottles', 'No. of Shoots', 'Operator Name', 'Mortality', 'Remark']}
      dataKeys={['transfer_date', 'stage_number', 'batch_code', 'media_code', 'crop_name', 'no_of_bottles', 'no_of_shoots', 'operator_name', 'mortality', 'remark']}
      api={{
        get: indoorApi.getSubculturing,
        create: indoorApi.createSubculturing,
        update: indoorApi.updateSubculturing,
        delete: indoorApi.deleteSubculturing
      }}
      onModalClose={() => {
        setCurrentStageValue('New Batch');
        setCurrentQuantity(0);
      }}
      mapToForm={(r) => ({
        id: r.id,
        transferDate: r.transfer_date,
        stageNumber: r.stage_number,
        batchName: r.batch_code,
        mediaCode: r.media_code,
        cropName: r.crop_name,
        noOfBottles: String(r.no_of_bottles),
        noOfShoots: String(r.no_of_shoots),
        operatorName: r.operator_name,
        mortality: r.mortality,
        remark: r.remark
      })}
      mapToPayload={(f) => ({
        transferDate: f.transferDate,
        stageNumber: f.stageNumber,
        batchName: f.batchName,
        mediaCode: f.mediaCode,
        cropName: f.cropName,
        noOfBottles: parseInt(f.noOfBottles) || 0,
        noOfShoots: parseInt(f.noOfShoots) || 0,
        operatorName: f.operatorName,
        mortality: f.mortality,
        remark: f.remark,
        currentStage: f.currentStage
      })}
      renderCell={(key, value) => {
        if (key === 'transfer_date' && value) return value.split('T')[0];
        if (key === 'media_code') return <Badge variant="outline" className="bg-green-50 text-green-700">{value}</Badge>;
        return value;
      }}
      filterFields={{ field1Key: 'transfer_date', field1Label: 'Date', field2Key: 'batch_code', field2Label: 'Batch Name' }}
      section="Subculturing"
    />
    </div>
  );
}