import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { CRUDTable } from './shared/CRUDTable';
import * as indoorApi from '../../services/indoorApi';

const AUTOCLAVE_FIELDS = [
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'mediaCode', label: 'Media Code', placeholder: 'MS-001' },
  { key: 'operatorName', label: 'Operator Name' },
  { key: 'typeOfMedia', label: 'Type of Media', placeholder: 'MS Medium' },
  { key: 'autoclaveOnTime', label: 'Autoclave ON Time', type: 'time' },
  { key: 'mediaLoadingTime', label: 'Media Loading Time', type: 'time' },
  { key: 'pressureTime', label: 'Pressure Time', type: 'time' },
  { key: 'offTime', label: 'Off Time', type: 'time' },
  { key: 'openTime', label: 'Open Time', type: 'time' },
  { key: 'mediaTotal', label: 'Media Total', placeholder: '3:00' },
  { key: 'remark', label: 'Remark', type: 'textarea', span: 2 }
];

const BATCH_FIELDS = [
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'mediaCode', label: 'Media Code', placeholder: 'MS-001' },
  { key: 'operatorName', label: 'Operator Name' },
  { key: 'quantity', label: 'Quantity', placeholder: '5L' },
  { key: 'bottles', label: 'Bottles', type: 'number', placeholder: '120' },
  { key: 'contamination', label: 'Contamination', type: 'textarea' }
];

function AutoclaveCycle() {
  return (
    <CRUDTable
      title=""
      fields={AUTOCLAVE_FIELDS}
      columns={['Date', 'Media Code', 'Operator Name', 'Type of Media', 'Autoclave ON Time', 'Media Loading Time', 'Pressure Time', 'Off Time', 'Open Time', 'Media Total', 'Remark']}
      dataKeys={['date', 'media_code', 'operator_name', 'type_of_media', 'autoclave_on_time', 'media_loading_time', 'pressure_time', 'off_time', 'open_time', 'media_total', 'remark']}
      api={{
        get: indoorApi.getAutoclaveCycles,
        create: indoorApi.createAutoclaveCycle,
        update: indoorApi.updateAutoclaveCycle,
        delete: indoorApi.deleteAutoclaveCycle
      }}
      mapToForm={(r) => ({
        id: r.id, date: r.date, mediaCode: r.media_code, operatorName: r.operator_name,
        typeOfMedia: r.type_of_media, autoclaveOnTime: r.autoclave_on_time,
        mediaLoadingTime: r.media_loading_time, pressureTime: r.pressure_time,
        offTime: r.off_time, openTime: r.open_time, mediaTotal: r.media_total, remark: r.remark
      })}
      mapToPayload={(f) => ({
        date: f.date, mediaCode: f.mediaCode, operatorName: f.operatorName,
        typeOfMedia: f.typeOfMedia, autoclaveOnTime: f.autoclaveOnTime,
        mediaLoadingTime: f.mediaLoadingTime, pressureTime: f.pressureTime,
        offTime: f.offTime, openTime: f.openTime, mediaTotal: f.mediaTotal, remark: f.remark
      })}
      renderCell={(key, value) => {
        if (key === 'media_code') return <Badge variant="outline" className="bg-green-50 text-green-700">{value}</Badge>;
        return value;
      }}
      filterFields={{ field1Key: 'date', field1Label: 'Date', field2Key: 'media_code', field2Label: 'Media Code' }}
    />
  );
}

function MediaBatch() {
  return (
    <CRUDTable
      title=""
      fields={BATCH_FIELDS}
      columns={['Date', 'Media Code', 'Operator Name', 'Quantity', 'Bottles', 'Contamination']}
      dataKeys={['date', 'media_code', 'operator_name', 'quantity', 'bottles', 'contamination']}
      api={{
        get: indoorApi.getMediaBatches,
        create: indoorApi.createMediaBatch,
        update: indoorApi.updateMediaBatch,
        delete: indoorApi.deleteMediaBatch
      }}
      mapToForm={(r) => ({
        id: r.id, date: r.date, mediaCode: r.media_code, operatorName: r.operator_name,
        quantity: r.quantity, bottles: String(r.bottles), contamination: r.contamination
      })}
      mapToPayload={(f) => ({
        date: f.date, mediaCode: f.mediaCode, operatorName: f.operatorName,
        quantity: f.quantity, bottles: parseInt(f.bottles) || 0, contamination: f.contamination
      })}
      renderCell={(key, value) => {
        if (key === 'media_code') return <Badge variant="outline" className="bg-green-50 text-green-700">{value}</Badge>;
        if (key === 'contamination') return <Badge className={value === 'None' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{value}</Badge>;
        return value;
      }}
      filterFields={{ field1Key: 'date', field1Label: 'Date', field2Key: 'media_code', field2Label: 'Media Code' }}
    />
  );
}

export function MediaPreparation() {
  const [tab, setTab] = useState('autoclave');

  return (
    <div className="p-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="autoclave">Autoclave Cycle</TabsTrigger>
          <TabsTrigger value="batch">Media Batch</TabsTrigger>
        </TabsList>
        <TabsContent value="autoclave"><AutoclaveCycle /></TabsContent>
        <TabsContent value="batch"><MediaBatch /></TabsContent>
      </Tabs>
    </div>
  );
}
