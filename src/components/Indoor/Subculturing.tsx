import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CRUDTable } from './shared/CRUDTable';
import { Badge } from '../ui/badge';
import * as indoorApi from '../../services/indoorApi';

// Field configuration for subculturing form - defines all input fields and their properties
const FIELDS = [
  { key: 'transferDate', label: 'Transfer Date', type: 'date' },
  { key: 'stageNumber', label: 'Stage Number', placeholder: 'Stage 1' },
  { key: 'batchName', label: 'Batch Name', placeholder: 'B-2024-1145' },
  { key: 'mediaCode', label: 'Media Code', placeholder: 'MS-001' },
  { key: 'cropName', label: 'Crop Name', placeholder: 'Rose' },
  { key: 'noOfVessels', label: 'No. of Vessels', type: 'number', placeholder: '50' },
  { key: 'noOfShoots', label: 'No. of Shoots', type: 'number', placeholder: '1000' },
  { key: 'operatorName', label: 'Operator Name' },
  { key: 'mortality', label: 'Mortality', placeholder: 'Low/Medium/High' },
  { key: 'remark', label: 'Remark', type: 'textarea', span: 2 }
];

/**
 * Subculturing component - Manages subculturing records for tissue culture operations
 * Tracks transfer dates, stage numbers, batch details, crop info, vessel/shoot counts, and mortality
 */
export function Subculturing() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader><CardTitle>Subculturing Register</CardTitle></CardHeader>
        <CardContent>
          <CRUDTable
            title="Subculturing"
            fields={FIELDS}
            columns={['Transfer Date', 'Stage Number', 'Batch Name', 'Media Code', 'Crop Name', 'No. of Vessels', 'No. of Shoots', 'Operator Name', 'Mortality', 'Remark']}
            dataKeys={['transfer_date', 'stage_number', 'batch_name', 'media_code', 'crop_name', 'no_of_vessels', 'no_of_shoots', 'operator_name', 'mortality', 'remark']}
            api={{
              get: indoorApi.getSubculturing,      // Fetch all subculturing records
              create: indoorApi.createSubculturing, // Create new record
              update: indoorApi.updateSubculturing, // Update existing record
              delete: indoorApi.deleteSubculturing  // Delete record
            }}
            // Maps database record to form fields
            mapToForm={(r) => ({
              id: r.id,
              transferDate: r.transfer_date,
              stageNumber: r.stage_number,
              batchName: r.batch_name,
              mediaCode: r.media_code,
              cropName: r.crop_name,
              noOfVessels: String(r.no_of_vessels),
              noOfShoots: String(r.no_of_shoots),
              operatorName: r.operator_name,
              mortality: r.mortality,
              remark: r.remark
            })}
            // Maps form fields to API payload format
            mapToPayload={(f) => ({
              transferDate: f.transferDate,
              stageNumber: f.stageNumber,
              batchName: f.batchName,
              mediaCode: f.mediaCode,
              cropName: f.cropName,
              noOfVessels: parseInt(f.noOfVessels) || 0,
              noOfShoots: parseInt(f.noOfShoots) || 0,
              operatorName: f.operatorName,
              mortality: f.mortality,
              remark: f.remark
            })}
            // Custom cell rendering - displays media code as badge
            renderCell={(key, value) => {
              if (key === 'media_code') return <Badge variant="outline" className="bg-green-50 text-green-700">{value}</Badge>;
              return value;
            }}
            // Filter configuration - enables filtering by date and batch name
            filterFields={{ field1Key: 'transfer_date', field1Label: 'Date', field2Key: 'batch_name', field2Label: 'Batch Name' }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
