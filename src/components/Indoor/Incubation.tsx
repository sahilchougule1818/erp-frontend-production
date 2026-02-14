import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { CRUDTable } from './shared/CRUDTable';
import * as indoorApi from '../../services/indoorApi';

// Field configuration for incubation register - tracks environmental conditions during incubation
const INCUBATION_FIELDS = [
  { key: 'subcultureDate', label: 'Subculture Date', type: 'date' },
  { key: 'stage', label: 'Stage', placeholder: 'Stage 1' },
  { key: 'batchName', label: 'Batch Name', placeholder: 'B-2024-1145' },
  { key: 'mediaCode', label: 'Media Code', placeholder: 'MS-001' },
  { key: 'operatorName', label: 'Operator Name' },
  { key: 'cropName', label: 'Crop Name', placeholder: 'Rose' },
  { key: 'noOfVessels', label: 'No. of Vessels', type: 'number', placeholder: '50' },
  { key: 'noOfShoots', label: 'No. of Shoots', type: 'number', placeholder: '1000' },
  { key: 'temp', label: 'Temp', placeholder: '25°C' },
  { key: 'humidity', label: 'Humidity', placeholder: '70%' },
  { key: 'photoPeriod', label: 'Photo Period', placeholder: '16/8' },
  { key: 'lightIntensity', label: 'Light Intensity', placeholder: '3000 lux' }
];

// Field configuration for mortality records - tracks vessel losses and disposal
const MORTALITY_FIELDS = [
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'batchName', label: 'Batch Name', placeholder: 'B-2024-1145' },
  { key: 'vesselCount', label: 'Vessel Count', type: 'number', placeholder: '10' },
  { key: 'typeOfMortality', label: 'Type of Mortality', placeholder: 'Contamination/Drying' },
  { key: 'possibleSource', label: 'Possible Source', type: 'textarea' },
  { key: 'disposalMethod', label: 'Disposal Method', type: 'textarea' }
];

/**
 * IncubationRegister component - Manages incubation records with environmental parameters
 * Tracks temperature, humidity, light conditions for each batch during incubation
 */
function IncubationRegister() {
  return (
    <CRUDTable
      title="Incubation Register"
      fields={INCUBATION_FIELDS}
      columns={['Subculture Date', 'Stage', 'Batch Name', 'Media Code', 'Operator Name', 'Crop Name', 'No. of Vessels', 'No. of Shoots', 'Temp', 'Humidity', 'Photo Period', 'Light Intensity']}
      dataKeys={['subculture_date', 'stage', 'batch_name', 'media_code', 'operator_name', 'crop_name', 'no_of_vessels', 'no_of_shoots', 'temp', 'humidity', 'photo_period', 'light_intensity']}
      api={{
        get: indoorApi.getIncubation,      // Fetch all incubation records
        create: indoorApi.createIncubation, // Create new incubation record
        update: indoorApi.updateIncubation, // Update existing record
        delete: indoorApi.deleteIncubation  // Delete incubation record
      }}
      // Maps database record to form fields
      mapToForm={(r) => ({
        id: r.id,
        subcultureDate: r.subculture_date,
        stage: r.stage,
        batchName: r.batch_name,
        mediaCode: r.media_code,
        operatorName: r.operator_name,
        cropName: r.crop_name,
        noOfVessels: String(r.no_of_vessels),
        noOfShoots: String(r.no_of_shoots),
        temp: r.temp,
        humidity: r.humidity,
        photoPeriod: r.photo_period,
        lightIntensity: r.light_intensity
      })}
      // Maps form fields to API payload format
      mapToPayload={(f) => ({
        subcultureDate: f.subcultureDate,
        stage: f.stage,
        batchName: f.batchName,
        mediaCode: f.mediaCode,
        operatorName: f.operatorName,
        cropName: f.cropName,
        noOfVessels: parseInt(f.noOfVessels) || 0,
        noOfShoots: parseInt(f.noOfShoots) || 0,
        temp: f.temp,
        humidity: f.humidity,
        photoPeriod: f.photoPeriod,
        lightIntensity: f.lightIntensity
      })}
      // Custom cell rendering - displays media code as badge
      renderCell={(key, value) => {
        if (key === 'media_code') return <Badge variant="outline" className="bg-green-50 text-green-700">{value}</Badge>;
        return value;
      }}
      // Filter configuration - enables filtering by date and batch name
      filterFields={{ field1Key: 'subculture_date', field1Label: 'Date', field2Key: 'batch_name', field2Label: 'Batch Name' }}
    />
  );
}

/**
 * MortalityRecord component - Manages mortality/loss records during incubation
 * Tracks vessel losses, causes, and disposal methods
 */
function MortalityRecord() {
  return (
    <CRUDTable
      title="Mortality Record"
      fields={MORTALITY_FIELDS}
      columns={['Date', 'Batch Name', 'Vessel Count', 'Type of Mortality', 'Possible Source', 'Disposal Method']}
      dataKeys={['date', 'batch_name', 'vessel_count', 'type_of_mortality', 'possible_source', 'disposal_method']}
      api={{
        get: indoorApi.getMortalityRecord,      // Fetch all mortality records
        create: indoorApi.createMortalityRecord, // Create new mortality record
        update: indoorApi.updateMortalityRecord, // Update existing record
        delete: indoorApi.deleteMortalityRecord  // Delete mortality record
      }}
      // Maps database record to form fields
      mapToForm={(r) => ({
        id: r.id,
        date: r.date,
        batchName: r.batch_name,
        vesselCount: String(r.vessel_count),
        typeOfMortality: r.type_of_mortality,
        possibleSource: r.possible_source,
        disposalMethod: r.disposal_method
      })}
      // Maps form fields to API payload format
      mapToPayload={(f) => ({
        date: f.date,
        batchName: f.batchName,
        vesselCount: parseInt(f.vesselCount) || 0,
        typeOfMortality: f.typeOfMortality,
        possibleSource: f.possibleSource,
        disposalMethod: f.disposalMethod
      })}
      // Filter configuration - enables filtering by date and batch name
      filterFields={{ field1Key: 'date', field1Label: 'Date', field2Key: 'batch_name', field2Label: 'Batch Name' }}
    />
  );
}

/**
 * Incubation component - Main component with tabs for incubation register and mortality records
 * Manages all incubation activities and tracks losses in the tissue culture lab
 */
export function Incubation() {
  // State to track active tab (incubation or mortality)
  const [tab, setTab] = useState('incubation');

  return (
    <div className="p-6">
      <Card>
        <CardHeader><CardTitle>Incubation</CardTitle></CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="incubation">Incubation Register</TabsTrigger>
              <TabsTrigger value="mortality">Mortality Record</TabsTrigger>
            </TabsList>
            <TabsContent value="incubation"><IncubationRegister /></TabsContent>
            <TabsContent value="mortality"><MortalityRecord /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
