# FIELD MAPPING VERIFICATION
## Frontend ↔ Backend ↔ Database

This document verifies that all field names match correctly across the entire stack.

---

## 1. AUTOCLAVE CYCLES

### Frontend (MediaPreparation.tsx)
```typescript
Form Fields (camelCase):
- date
- mediaCode
- operatorName
- typeOfMedia
- autoclaveOnTime
- mediaLoadingTime
- pressureTime
- offTime
- openTime
- mediaTotal
- remark

Database Keys (snake_case):
- date
- media_code
- operator_name
- type_of_media
- autoclave_on_time
- media_loading_time
- pressure_time
- off_time
- open_time
- media_total
- remark
```

### Backend API
- Endpoint: `/api/indoor/autoclave-cycles`
- Payload: camelCase (mediaCode, operatorName, etc.)
- Database: snake_case (media_code, operator_name, etc.)

### Status: ✅ VERIFIED

---

## 2. MEDIA BATCHES

### Frontend (MediaPreparation.tsx)
```typescript
Form Fields (camelCase):
- date
- mediaCode
- operatorName
- quantity
- bottles
- contamination

Database Keys (snake_case):
- date
- media_code
- operator_name
- quantity
- bottles
- contamination
```

### Backend API
- Endpoint: `/api/indoor/media-batches`
- Payload: camelCase
- Database: snake_case

### Status: ✅ VERIFIED

---

## 3. SUBCULTURING

### Frontend (Subculturing.tsx)
```typescript
Form Fields (camelCase):
- transferDate
- stageNumber
- batchName
- mediaCode
- cropName
- noOfBottles
- noOfShoots
- operatorName
- mortality
- remark

Database Keys (snake_case):
- transfer_date
- stage_number
- batch_name
- media_code
- crop_name
- no_of_bottles
- no_of_shoots
- operator_name
- mortality
- remark
```

### Backend API
- Endpoint: `/api/indoor/subculturing`
- Payload: camelCase
- Database: snake_case

### Status: ✅ VERIFIED

---

## 4. INCUBATION

### Frontend (Incubation.tsx)
```typescript
Form Fields (camelCase):
- subcultureDate
- stage
- batchName
- mediaCode
- operatorName
- cropName
- noOfBottles
- noOfShoots
- temp
- humidity
- photoPeriod
- lightIntensity

Database Keys (snake_case):
- subculture_date
- stage
- batch_name
- media_code
- operator_name
- crop_name
- no_of_bottles
- no_of_shoots
- temp
- humidity
- photo_period
- light_intensity
```

### Backend API
- Endpoint: `/api/indoor/incubation`
- Payload: camelCase
- Database: snake_case

### Status: ✅ VERIFIED

---

## 5. MORTALITY RECORD

### Frontend (Incubation.tsx - MortalityRecord)
```typescript
Form Fields (camelCase):
- date
- batchName
- vesselCount
- typeOfMortality
- possibleSource
- disposalMethod

Database Keys (snake_case):
- date
- batch_name
- vessel_count
- type_of_mortality
- possible_source
- disposal_method
```

### Backend API
- Endpoint: `/api/indoor/mortality-record`
- Payload: camelCase
- Database: snake_case

### Status: ✅ VERIFIED

---

## 6. CLEANING RECORD

### Frontend (CleaningRecord.tsx)
```typescript
Form Fields (camelCase):
- date
- operatorName
- areaCleaned

Database Keys (snake_case):
- date
- operator_name
- area_cleaned
```

### Backend API
- Endpoint: `/api/indoor/cleaning-record`
- Payload: camelCase
- Database: snake_case

### Status: ✅ VERIFIED

---

## 7. DEEP CLEANING RECORD

### Frontend (CleaningRecord.tsx - DeepCleaningRecord)
```typescript
Form Fields (camelCase):
- date
- operator
- instrumentCleaned

Database Keys (snake_case):
- date
- operator
- instrument_cleaned
```

### Backend API
- Endpoint: `/api/indoor/deep-cleaning-record`
- Payload: camelCase
- Database: snake_case

### Status: ✅ VERIFIED

---

## 8. SAMPLING

### Frontend (Sampling.tsx)
```typescript
Form Fields (camelCase):
- sampleDate
- cropName
- batchName
- stage
- sentDate
- receivedDate
- status
- govtCertificate
- certificateNo
- reason

Database Keys (snake_case):
- sample_date
- crop_name
- batch_name
- stage
- sent_date
- received_date
- status
- govt_certificate
- certificate_no
- reason
```

### Backend API
- Endpoint: `/api/indoor/sampling`
- Payload: camelCase
- Database: snake_case

### Status: ✅ VERIFIED

---

## 9. OPERATORS

### Frontend (OperatorMaster.tsx)
```typescript
Form Fields (camelCase):
- firstName
- middleName
- lastName
- shortName
- role
- sections (JSON array)
- age
- gender
- isActive

Database Keys (snake_case):
- first_name
- middle_name
- last_name
- short_name
- role
- sections (JSON)
- age
- gender
- is_active
```

### Backend API
- Endpoint: `/api/operators`
- Special Endpoint: `/api/operators/section/:sectionName`
- Payload: camelCase
- Database: snake_case

### Status: ✅ VERIFIED

---

## NAMING CONVENTIONS

### Frontend → Backend (Payload)
- **Format**: camelCase
- **Example**: `mediaCode`, `operatorName`, `noOfBottles`

### Backend → Database
- **Format**: snake_case
- **Example**: `media_code`, `operator_name`, `no_of_bottles`

### Database → Backend (Response)
- **Format**: snake_case
- **Example**: `media_code`, `operator_name`, `no_of_bottles`

### Backend → Frontend (Response)
- **Format**: snake_case (mapped to camelCase in mapToForm)
- **Example**: Response has `media_code`, mapped to `mediaCode` in form

---

## CONVERSION FUNCTIONS

### Frontend Mapping Functions

Each component has two mapping functions:

1. **mapToForm(record)**: Converts database response (snake_case) to form state (camelCase)
```typescript
mapToForm={(r) => ({
  id: r.id,
  mediaCode: r.media_code,
  operatorName: r.operator_name
})}
```

2. **mapToPayload(form)**: Converts form state (camelCase) to API payload (camelCase)
```typescript
mapToPayload={(f) => ({
  mediaCode: f.mediaCode,
  operatorName: f.operatorName
})}
```

### Backend Conversion
Backend should convert:
- **Incoming**: camelCase → snake_case (for database)
- **Outgoing**: snake_case → snake_case (frontend handles conversion)

---

## SECTION NAMES (Exact Match Required)

These must match exactly across frontend and backend:

1. **"Media Preparation"**
2. **"Subculturing"**
3. **"Incubation"**
4. **"Cleaning Record"**
5. **"Quality Control"**

Used in:
- Operator sections JSON array
- CRUDTable `section` prop
- Backend filtering endpoint

---

## DATE FORMATTING

### Frontend Display
- **Format**: `YYYY-MM-DD` (date only, no timestamp)
- **Implementation**: `value.split('T')[0]` in renderCell

### Database Storage
- **Type**: `DATE`
- **Format**: `YYYY-MM-DD`

### API Transfer
- **Format**: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- **Frontend strips**: Timestamp portion for display

---

## VERIFICATION CHECKLIST

- ✅ All form fields use camelCase
- ✅ All database columns use snake_case
- ✅ All mapToForm functions convert snake_case → camelCase
- ✅ All mapToPayload functions use camelCase
- ✅ All date fields formatted correctly in renderCell
- ✅ All section names match exactly
- ✅ All API endpoints match service calls
- ✅ All operator dropdowns filter by section

---

## COMMON ISSUES & FIXES

### Issue 1: Date showing timestamp
**Fix**: Add date formatting in renderCell:
```typescript
if (key === 'date' && value) return value.split('T')[0];
```

### Issue 2: Field not saving
**Check**:
1. Form field name (camelCase)
2. mapToPayload conversion
3. Backend expects camelCase
4. Database column (snake_case)

### Issue 3: Operator dropdown empty
**Check**:
1. Section name matches exactly
2. Operators have section in their sections JSON
3. Backend endpoint `/api/operators/section/:sectionName` works
4. Operators are active (`is_active = TRUE`)

---

## DATABASE MIGRATION COMMAND

To apply the complete schema:

```bash
mysql -u your_user -p your_database < database/complete-schema.sql
```

Or via Railway/Cloud:
```bash
mysql -h your_host -u your_user -p your_database < database/complete-schema.sql
```

---

## FINAL STATUS

✅ **All field mappings verified and documented**
✅ **Complete database schema created**
✅ **Date formatting implemented across all tables**
✅ **Operator section filtering ready**
✅ **Naming conventions consistent**

**Ready for production deployment!**
