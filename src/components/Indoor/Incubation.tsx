import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { CRUDTable } from './shared/CRUDTable';
import * as indoorApi from '../../services/indoorApi';
import { useIndoorBatches } from '../../hooks/useIndoorBatches';
import { useMediaCodes } from '../../hooks/useMediaCodes';

function IncubationRegister() {
  const { batches } = useIndoorBatches();
  const { mediaCodes } = useMediaCodes();
  
  const INCUBATION_FIELDS = [
    { key: 'subcultureDate', label: 'Subculture Date', type: 'date' },
    { key: 'stage', label: 'Stage', type: 'select', options: Array.from({length: 8}, (_, i) => ({value: `Stage-${i+1}`, label: `Stage-${i+1}`})) },
    { 
      key: 'batchName', 
      label: 'Batch Name', 
      type: 'select', 
      options: batches,
      onChange: (value, setForm, form) => {
        const selected = batches.find(b => b.value === value);
        if (selected) {
          const cropName = selected.label.split('(')[1]?.replace(')', '') || '';
          setForm({...form, batchName: value, cropName});
        }
      }
    },
    { key: 'mediaCode', label: 'Media Code', type: 'select', options: mediaCodes },
    { key: 'operatorName', label: 'Operator Name' },
    { key: 'cropName', label: 'Crop Name', readOnly: true },
    { key: 'noOfBottles', label: 'No. of Bottles', type: 'number', placeholder: '50' },
    { key: 'noOfShoots', label: 'No. of Shoots', type: 'number', placeholder: '1000' },
    { key: 'temp', label: 'Temp', placeholder: '25°C' },
    { key: 'humidity', label: 'Humidity', placeholder: '70%' },
    { key: 'photoPeriod', label: 'Photo Period', placeholder: '16/8' },
    { key: 'lightIntensity', label: 'Light Intensity', placeholder: '3000 lux' }
  ];

  return (
    <CRUDTable
      title=""
      fields={INCUBATION_FIELDS}
      columns={['Subculture Date', 'Stage', 'Batch Name', 'Media Code', 'Operator Name', 'Crop Name', 'No. of Bottles', 'No. of Shoots', 'Temp', 'Humidity', 'Photo Period', 'Light Intensity']}
      dataKeys={['subculture_date', 'stage', 'batch_code', 'media_code', 'operator_name', 'crop_name', 'no_of_bottles', 'no_of_shoots', 'temp', 'humidity', 'photo_period', 'light_intensity']}
      api={{
        get: indoorApi.getIncubation,
        create: indoorApi.createIncubation,
        update: indoorApi.updateIncubation,
        delete: indoorApi.deleteIncubation
      }}
      mapToForm={(r) => ({
        id: r.id,
        subcultureDate: r.subculture_date,
        stage: r.stage,
        batchName: r.batch_code,
        mediaCode: r.media_code,
        operatorName: r.operator_name,
        cropName: r.crop_name,
        noOfBottles: String(r.no_of_bottles),
        noOfShoots: String(r.no_of_shoots),
        temp: r.temp,
        humidity: r.humidity,
        photoPeriod: r.photo_period,
        lightIntensity: r.light_intensity
      })}
      mapToPayload={(f) => ({
        subcultureDate: f.subcultureDate,
        stage: f.stage,
        batchName: f.batchName,
        mediaCode: f.mediaCode,
        operatorName: f.operatorName,
        cropName: f.cropName,
        noOfBottles: parseInt(f.noOfBottles) || 0,
        noOfShoots: parseInt(f.noOfShoots) || 0,
        temp: f.temp,
        humidity: f.humidity,
        photoPeriod: f.photoPeriod,
        lightIntensity: f.lightIntensity
      })}
      renderCell={(key, value) => {
        if (key === 'subculture_date' && value) return value.split('T')[0];
        if (key === 'media_code') return <Badge variant="outline" className="bg-green-50 text-green-700">{value}</Badge>;
        return value;
      }}
      filterFields={{ field1Key: 'subculture_date', field1Label: 'Date', field2Key: 'batch_code', field2Label: 'Batch Name' }}
      section="Incubation"
    />
  );
}

function MortalityRecord() {
  const { batches } = useIndoorBatches();
  
  const MORTALITY_FIELDS = [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'batchName', label: 'Batch Name', type: 'select', options: batches },
    { key: 'vesselCount', label: 'Vessel Count', type: 'number', placeholder: '10' },
    { key: 'typeOfMortality', label: 'Type of Mortality', placeholder: 'Contamination/Drying' },
    { key: 'possibleSource', label: 'Possible Source', type: 'textarea' },
    { key: 'disposalMethod', label: 'Disposal Method', type: 'textarea' }
  ];

  return (
    <CRUDTable
      title=""
      fields={MORTALITY_FIELDS}
      columns={['Date', 'Batch Name', 'Vessel Count', 'Type of Mortality', 'Possible Source', 'Disposal Method']}
      dataKeys={['date', 'batch_code', 'vessel_count', 'type_of_mortality', 'possible_source', 'disposal_method']}
      api={{
        get: indoorApi.getMortalityRecord,
        create: indoorApi.createMortalityRecord,
        update: indoorApi.updateMortalityRecord,
        delete: indoorApi.deleteMortalityRecord
      }}
      mapToForm={(r) => ({
        id: r.id,
        date: r.date,
        batchName: r.batch_code,
        vesselCount: String(r.vessel_count),
        typeOfMortality: r.type_of_mortality,
        possibleSource: r.possible_source,
        disposalMethod: r.disposal_method
      })}
      mapToPayload={(f) => ({
        date: f.date,
        batchName: f.batchName,
        vesselCount: parseInt(f.vesselCount) || 0,
        typeOfMortality: f.typeOfMortality,
        possibleSource: f.possibleSource,
        disposalMethod: f.disposalMethod
      })}
      renderCell={(key, value) => {
        if (key === 'date' && value) return value.split('T')[0];
        return value;
      }}
      filterFields={{ field1Key: 'date', field1Label: 'Date', field2Key: 'batch_code', field2Label: 'Batch Name' }}
      section="Incubation"
    />
  );
}

export function Incubation() {
  const [tab, setTab] = useState('incubation');

  return (
    <div className="p-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="incubation">Incubation Register</TabsTrigger>
          <TabsTrigger value="mortality">Mortality Record</TabsTrigger>
        </TabsList>
        <TabsContent value="incubation"><IncubationRegister /></TabsContent>
        <TabsContent value="mortality"><MortalityRecord /></TabsContent>
      </Tabs>
    </div>
  );
}
