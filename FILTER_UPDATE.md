# Filter Feature Added to Indoor Modules

## What Changed

Updated `CRUDTable.tsx` to include:
- Crop Name and Batch Name filter dropdowns (like outdoor modules)
- Shows only 5 most recent entries by default
- Shows all matching data when filtered
- "Back to Main Data" button to reset filters

## How It Works

1. **Default View**: Shows 5 most recent entries
2. **Filter View**: Select crop/batch and click Search to see all matching records
3. **Reset**: Click "Back to Main Data" to return to default view

## Requirements

For filters to appear, your database tables need:
- `crop_name` or `cropName` column
- `batch_name` or `batchName` column

If these columns don't exist, the filters won't show (graceful fallback).

## Next Steps

To enable filters on indoor tables, add these columns to your database:

```sql
-- Example for autoclave_cycles table
ALTER TABLE autoclave_cycles ADD COLUMN crop_name VARCHAR(100);
ALTER TABLE autoclave_cycles ADD COLUMN batch_name VARCHAR(100);

-- Repeat for other indoor tables:
-- media_batches, subculturing, incubation, cleaning_record, sampling
```

## Deploy

```bash
git add .
git commit -m "Add filter functionality to indoor modules"
git push
```
