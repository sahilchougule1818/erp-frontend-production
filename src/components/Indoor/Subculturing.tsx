import { CRUDTable } from './shared/CRUDTable';
import { Badge } from '../ui/badge';
import * as indoorApi from '../../services/indoorApi';

const FIELDS = [
  { key: 'transferDate', label: 'Transfer Date', type: 'date' },
  { key: 'stageNumber', label: 'Stage Number', placeholder: 'Stage 1' },
  { key: 'batchName', label: 'Batch Name', placeholder: 'B-2024-1145' },
  { key: 'mediaCode', label: 'Media Code', placeholder: 'MS-001' },
  { key: 'cropName', label: 'Crop Name', placeholder: 'Rose' },
  { key: 'noOfBottles', label: 'No. of Bottles', type: 'number', placeholder: '50' },
  { key: 'noOfShoots', label: 'No. of Shoots', type: 'number', placeholder: '1000' },
  { key: 'operatorName', label: 'Operator Name' },
  { key: 'mortality', label: 'Mortality', placeholder: 'Low/Medium/High' },
  { key: 'remark', label: 'Remark', type: 'textarea', span: 2 }
];

export function Subculturing() {
  return (
    <CRUDTable
      title=""
      fields={FIELDS}
      columns={['Transfer Date', 'Stage Number', 'Batch Name', 'Media Code', 'Crop Name', 'No. of Bottles', 'No. of Shoots', 'Operator Name', 'Mortality', 'Remark']}
      dataKeys={['transfer_date', 'stage_number', 'batch_name', 'media_code', 'crop_name', 'no_of_bottles', 'no_of_shoots', 'operator_name', 'mortality', 'remark']}
      api={{
        get: indoorApi.getSubculturing,
        create: indoorApi.createSubculturing,
        update: indoorApi.updateSubculturing,
        delete: indoorApi.deleteSubculturing
      }}
      mapToForm={(r) => ({
        id: r.id,
        transferDate: r.transfer_date,
        stageNumber: r.stage_number,
        batchName: r.batch_name,
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
        remark: f.remark
      })}
      renderCell={(key, value) => {
        if (key === 'transfer_date' && value) return value.split('T')[0];
        if (key === 'media_code') return <Badge variant="outline" className="bg-green-50 text-green-700">{value}</Badge>;
        return value;
      }}
      filterFields={{ field1Key: 'transfer_date', field1Label: 'Date', field2Key: 'batch_name', field2Label: 'Batch Name' }}
    />
  );
}
