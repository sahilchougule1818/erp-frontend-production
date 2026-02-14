import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CRUDTable } from './shared/CRUDTable';
import * as indoorApi from '../../services/indoorApi';

// Field configuration for regular cleaning records - tracks daily cleaning activities
const CLEANING_FIELDS = [
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'operatorName', label: 'Operator Name' },
  { key: 'areaCleaned', label: 'Area Cleaned', type: 'textarea', span: 2 }
];

// Field configuration for deep cleaning records - tracks instrument sterilization
const DEEP_CLEANING_FIELDS = [
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'operator', label: 'Operator' },
  { key: 'instrumentCleaned', label: 'Instrument Cleaned', type: 'textarea', span: 2 }
];

/**
 * CleaningRecordTable component - Manages regular cleaning activity records
 * Tracks which areas were cleaned and by whom
 */
function CleaningRecordTable() {
  return (
    <CRUDTable
      title=""
      fields={CLEANING_FIELDS}
      columns={['Date', 'Operator Name', 'Area Cleaned']}
      dataKeys={['date', 'operator_name', 'area_cleaned']}
      api={{
        get: indoorApi.getCleaningRecord,      // Fetch all cleaning records
        create: indoorApi.createCleaningRecord, // Create new cleaning record
        update: indoorApi.updateCleaningRecord, // Update existing record
        delete: indoorApi.deleteCleaningRecord  // Delete cleaning record
      }}
      // Maps database record to form fields
      mapToForm={(r) => ({
        id: r.id,
        date: r.date,
        operatorName: r.operator_name,
        areaCleaned: r.area_cleaned
      })}
      // Maps form fields to API payload format
      mapToPayload={(f) => ({
        date: f.date,
        operatorName: f.operatorName,
        areaCleaned: f.areaCleaned
      })}
      // Filter configuration - enables filtering by date and operator name
      filterFields={{ field1Key: 'date', field1Label: 'Date', field2Key: 'operator_name', field2Label: 'Operator Name' }}
    />
  );
}

/**
 * DeepCleaningRecord component - Manages deep cleaning and instrument sterilization records
 * Tracks which instruments were cleaned and sterilized
 */
function DeepCleaningRecord() {
  return (
    <CRUDTable
      title=""
      fields={DEEP_CLEANING_FIELDS}
      columns={['Date', 'Operator', 'Instrument Cleaned']}
      dataKeys={['date', 'operator', 'instrument_cleaned']}
      api={{
        get: indoorApi.getDeepCleaningRecord,      // Fetch all deep cleaning records
        create: indoorApi.createDeepCleaningRecord, // Create new deep cleaning record
        update: indoorApi.updateDeepCleaningRecord, // Update existing record
        delete: indoorApi.deleteDeepCleaningRecord  // Delete deep cleaning record
      }}
      // Maps database record to form fields
      mapToForm={(r) => ({
        id: r.id,
        date: r.date,
        operator: r.operator,
        instrumentCleaned: r.instrument_cleaned
      })}
      // Maps form fields to API payload format
      mapToPayload={(f) => ({
        date: f.date,
        operator: f.operator,
        instrumentCleaned: f.instrumentCleaned
      })}
      // Filter configuration - enables filtering by date and operator
      filterFields={{ field1Key: 'date', field1Label: 'Date', field2Key: 'operator', field2Label: 'Operator' }}
    />
  );
}

/**
 * CleaningRecord component - Main component with tabs for regular and deep cleaning records
 * Manages all cleaning and sterilization activities in the tissue culture lab
 */
export function CleaningRecord() {
  // State to track active tab (cleaning or deep cleaning)
  const [tab, setTab] = useState('cleaning');

  return (
    <div className="p-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="cleaning">Cleaning Record</TabsTrigger>
          <TabsTrigger value="deep">Deep Cleaning Record</TabsTrigger>
        </TabsList>
        <TabsContent value="cleaning"><CleaningRecordTable /></TabsContent>
        <TabsContent value="deep"><DeepCleaningRecord /></TabsContent>
      </Tabs>
    </div>
  );
}
