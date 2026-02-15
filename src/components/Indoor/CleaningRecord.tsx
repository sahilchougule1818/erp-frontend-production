import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CRUDTable } from './shared/CRUDTable';
import * as indoorApi from '../../services/indoorApi';

const CLEANING_FIELDS = [
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'operatorName', label: 'Operator Name' },
  { key: 'areaCleaned', label: 'Area Cleaned', type: 'textarea', span: 2 }
];

const DEEP_CLEANING_FIELDS = [
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'operator', label: 'Operator' },
  { key: 'instrumentCleaned', label: 'Instrument Cleaned', type: 'textarea', span: 2 }
];

function CleaningRecordTable() {
  return (
    <CRUDTable
      title=""
      fields={CLEANING_FIELDS}
      columns={['Date', 'Operator Name', 'Area Cleaned']}
      dataKeys={['date', 'operator_name', 'area_cleaned']}
      api={{
        get: indoorApi.getCleaningRecord,
        create: indoorApi.createCleaningRecord,
        update: indoorApi.updateCleaningRecord,
        delete: indoorApi.deleteCleaningRecord
      }}
      mapToForm={(r) => ({
        id: r.id,
        date: r.date,
        operatorName: r.operator_name,
        areaCleaned: r.area_cleaned
      })}
      mapToPayload={(f) => ({
        date: f.date,
        operatorName: f.operatorName,
        areaCleaned: f.areaCleaned
      })}
      renderCell={(key, value) => {
        if (key === 'date' && value) return value.split('T')[0];
        return value;
      }}
      filterFields={{ field1Key: 'date', field1Label: 'Date', field2Key: 'operator_name', field2Label: 'Operator Name' }}
      section="Cleaning Record"
    />
  );
}

function DeepCleaningRecord() {
  return (
    <CRUDTable
      title=""
      fields={DEEP_CLEANING_FIELDS}
      columns={['Date', 'Operator', 'Instrument Cleaned']}
      dataKeys={['date', 'operator', 'instrument_cleaned']}
      api={{
        get: indoorApi.getDeepCleaningRecord,
        create: indoorApi.createDeepCleaningRecord,
        update: indoorApi.updateDeepCleaningRecord,
        delete: indoorApi.deleteDeepCleaningRecord
      }}
      mapToForm={(r) => ({
        id: r.id,
        date: r.date,
        operator: r.operator,
        instrumentCleaned: r.instrument_cleaned
      })}
      mapToPayload={(f) => ({
        date: f.date,
        operator: f.operator,
        instrumentCleaned: f.instrumentCleaned
      })}
      renderCell={(key, value) => {
        if (key === 'date' && value) return value.split('T')[0];
        return value;
      }}
      filterFields={{ field1Key: 'date', field1Label: 'Date', field2Key: 'operator', field2Label: 'Operator' }}
      section="Cleaning Record"
    />
  );
}

export function CleaningRecord() {
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
