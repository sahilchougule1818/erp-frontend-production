# ✅ CORRECTED SYSTEM MAPPING

## Frontend Modules → Database Tables → Sections

### 1. Media Preparation
**Frontend**: `MediaPreparation.tsx`  
**Database Tables**:
- `autoclave_cycles` (Autoclave Cycle tab)
- `media_batches` (Media Batch tab)

**Section Name**: `"Media Preparation"`

---

### 2. Subculturing
**Frontend**: `Subculturing.tsx`  
**Database Table**: `subculturing`  
**Section Name**: `"Subculturing"`

---

### 3. Incubation
**Frontend**: `Incubation.tsx`  
**Database Tables**:
- `incubation` (Incubation Register tab)
- `mortality_record` (Mortality Record tab)

**Section Name**: `"Incubation"`

---

### 4. Cleaning Record
**Frontend**: `CleaningRecord.tsx`  
**Database Tables**:
- `cleaning_record` (Cleaning Record tab)
- `deep_cleaning_record` (Deep Cleaning Record tab)

**Section Name**: `"Cleaning Record"`

---

### 5. Sampling (Quality Control)
**Frontend**: `Sampling.tsx`  
**Database Table**: `sampling`  
**Section Name**: `"Sampling"`

**Note**: This is the Quality Control module. Sampling handles government certification and quality checks.

---

### 6. Operator Master
**Frontend**: `OperatorMaster.tsx`  
**Database Table**: `operators`  
**Section Name**: N/A (manages all sections)

---

## Valid Section Names

Use these EXACT names in the operators.sections JSON field:

1. `"Media Preparation"`
2. `"Subculturing"`
3. `"Incubation"`
4. `"Cleaning Record"`
5. `"Sampling"`

❌ **REMOVED**: `"Quality Control"` (replaced with `"Sampling"`)

---

## Database Tables (10 Total)

1. **operators** - Operator master
2. **users** - Authentication
3. **autoclave_cycles** - Media Preparation > Autoclave Cycle
4. **media_batches** - Media Preparation > Media Batch
5. **subculturing** - Subculturing
6. **incubation** - Incubation > Incubation Register
7. **mortality_record** - Incubation > Mortality Record
8. **cleaning_record** - Cleaning Record > Cleaning Record
9. **deep_cleaning_record** - Cleaning Record > Deep Cleaning Record
10. **sampling** - Sampling (QC)

---

## What Was Fixed

### ❌ Old (Incorrect)
- Had "Quality Control" section but no QC module
- Had `operators_backup` and `quality_control` tables (unused)
- Section names didn't match actual modules

### ✅ New (Correct)
- Removed "Quality Control" section
- Added "Sampling" section (this IS the QC module)
- Cleaned up unused tables
- All section names match frontend modules exactly
- All components now have `section` prop for operator filtering

---

## Installation Command

**Copy and paste this into Railway console:**

```sql
-- Run the clean install script
\i railway-clean-install.sql
```

Or copy the entire content of `railway-clean-install.sql` and paste it.

---

## Verification

After running the script, verify:

```sql
-- Check tables (should show 10)
\dt

-- Check operators (should show 5 with correct sections)
SELECT short_name, sections FROM operators;

-- Expected output:
-- RKS  | ["Media Preparation", "Subculturing"]
-- AB   | ["Cleaning Record", "Sampling"]
-- PDS  | ["Media Preparation", "Incubation", "Sampling"]
-- AP   | ["Sampling"]
-- SKV  | ["Subculturing", "Incubation"]
```

---

## Files Updated

### Frontend
- ✅ `OperatorMaster.tsx` - Changed SECTIONS array
- ✅ `Subculturing.tsx` - Added section="Subculturing"
- ✅ `Incubation.tsx` - Added section="Incubation" to both tabs
- ✅ `CleaningRecord.tsx` - Added section="Cleaning Record" to both tabs
- ✅ `Sampling.tsx` - Added section="Sampling"
- ✅ `MediaPreparation.tsx` - Already had section="Media Preparation"

### Database
- ✅ `railway-clean-install.sql` - Clean PostgreSQL schema
- ✅ Removed unused tables
- ✅ Updated sample data with correct sections
- ✅ Added table comments for clarity

---

## Summary

**Total Modules**: 6 (5 data entry + 1 master)  
**Total Tables**: 10  
**Total Sections**: 5  
**Status**: ✅ All names match perfectly

**Ready to deploy!** 🚀
