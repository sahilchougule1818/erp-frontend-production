# DATABASE MIGRATION GUIDE
## Switching to New Database Schema

This guide helps you migrate from your current database to the new optimized schema.

---

## OPTION 1: FRESH INSTALLATION (Recommended for New Systems)

### Step 1: Backup Current Database (if exists)
```bash
# Create backup
mysqldump -u your_user -p your_database > backup_$(date +%Y%m%d).sql

# Or via Railway CLI
railway run mysqldump your_database > backup_$(date +%Y%m%d).sql
```

### Step 2: Apply New Schema
```bash
# Local MySQL
mysql -u your_user -p your_database < database/complete-schema.sql

# Railway/Cloud MySQL
mysql -h your_host -P your_port -u your_user -p your_database < database/complete-schema.sql
```

### Step 3: Verify Installation
```sql
-- Check all tables exist
SHOW TABLES;

-- Should show:
-- autoclave_cycles
-- cleaning_record
-- deep_cleaning_record
-- incubation
-- media_batches
-- mortality_record
-- operators
-- sampling
-- subculturing
-- users

-- Check sample data
SELECT * FROM operators;
-- Should show 5 sample operators
```

---

## OPTION 2: MIGRATION WITH DATA PRESERVATION

### Step 1: Backup Everything
```bash
mysqldump -u your_user -p your_database > full_backup_$(date +%Y%m%d).sql
```

### Step 2: Export Existing Data
```sql
-- Export operators
SELECT * INTO OUTFILE '/tmp/operators_export.csv'
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
FROM operators;

-- Export other tables similarly
SELECT * INTO OUTFILE '/tmp/autoclave_export.csv'
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
FROM autoclave_cycles;

-- Repeat for all tables
```

### Step 3: Apply New Schema
```bash
mysql -u your_user -p your_database < database/complete-schema.sql
```

### Step 4: Import Data Back
```sql
-- Import operators (adjust based on your old schema)
LOAD DATA INFILE '/tmp/operators_export.csv'
INTO TABLE operators
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
(first_name, last_name, short_name, role, sections, is_active);

-- Import other tables similarly
```

---

## OPTION 3: GRADUAL MIGRATION (For Production Systems)

### Phase 1: Add New Operators Table
```sql
-- Rename old operators table
RENAME TABLE operators TO operators_old;

-- Create new operators table
CREATE TABLE operators (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  short_name VARCHAR(10) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL,
  sections JSON NOT NULL,
  age INT,
  gender VARCHAR(10),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Migrate data
INSERT INTO operators (first_name, last_name, short_name, role, sections, is_active)
SELECT 
  SUBSTRING_INDEX(name, ' ', 1) as first_name,
  SUBSTRING_INDEX(name, ' ', -1) as last_name,
  UPPER(CONCAT(
    SUBSTRING(SUBSTRING_INDEX(name, ' ', 1), 1, 1),
    SUBSTRING(SUBSTRING_INDEX(name, ' ', -1), 1, 1)
  )) as short_name,
  'Lab Assistant' as role,
  '["Media Preparation", "Subculturing", "Incubation", "Cleaning Record", "Quality Control"]' as sections,
  TRUE as is_active
FROM operators_old;
```

### Phase 2: Update Other Tables (One at a Time)
```sql
-- Example: Update autoclave_cycles
RENAME TABLE autoclave_cycles TO autoclave_cycles_old;

CREATE TABLE autoclave_cycles (
  -- New schema from complete-schema.sql
);

INSERT INTO autoclave_cycles SELECT * FROM autoclave_cycles_old;

-- Verify data
SELECT COUNT(*) FROM autoclave_cycles;
SELECT COUNT(*) FROM autoclave_cycles_old;

-- If counts match, drop old table
DROP TABLE autoclave_cycles_old;
```

### Phase 3: Repeat for All Tables

---

## RAILWAY DEPLOYMENT SPECIFIC

### Step 1: Access Railway MySQL
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Get database credentials
railway variables

# Connect to database
railway connect mysql
```

### Step 2: Run Migration
```bash
# From your local machine
railway run mysql < database/complete-schema.sql

# Or connect and paste SQL
railway connect mysql
# Then paste the SQL from complete-schema.sql
```

### Step 3: Verify
```bash
railway run mysql -e "SHOW TABLES;"
railway run mysql -e "SELECT COUNT(*) FROM operators;"
```

---

## VERIFICATION CHECKLIST

After migration, verify:

### 1. Table Structure
```sql
-- Check each table has correct columns
DESCRIBE operators;
DESCRIBE autoclave_cycles;
DESCRIBE media_batches;
DESCRIBE subculturing;
DESCRIBE incubation;
DESCRIBE cleaning_record;
DESCRIBE deep_cleaning_record;
DESCRIBE mortality_record;
DESCRIBE sampling;
DESCRIBE users;
```

### 2. Indexes
```sql
-- Check indexes exist
SHOW INDEX FROM operators;
SHOW INDEX FROM autoclave_cycles;
-- Should show indexes on date, media_code, operator_name, etc.
```

### 3. Sample Data
```sql
-- Check operators
SELECT short_name, role, sections FROM operators;
-- Should show: RKS, AB, PDS, AP, SKV

-- Check sections JSON
SELECT short_name, JSON_EXTRACT(sections, '$') as sections FROM operators;
```

### 4. Views
```sql
-- Check views exist
SHOW FULL TABLES WHERE TABLE_TYPE LIKE 'VIEW';
-- Should show: v_operators_by_section, v_recent_activity

-- Test views
SELECT * FROM v_operators_by_section;
SELECT * FROM v_recent_activity LIMIT 10;
```

### 5. Stored Procedures
```sql
-- Check procedures exist
SHOW PROCEDURE STATUS WHERE Db = 'your_database';
-- Should show: sp_get_operators_by_section, sp_get_dashboard_stats

-- Test procedures
CALL sp_get_operators_by_section('Media Preparation');
CALL sp_get_dashboard_stats('2024-01-01', '2024-12-31');
```

---

## ROLLBACK PLAN

If something goes wrong:

### Quick Rollback
```bash
# Restore from backup
mysql -u your_user -p your_database < backup_YYYYMMDD.sql
```

### Partial Rollback
```sql
-- If you renamed tables instead of dropping
RENAME TABLE operators TO operators_new;
RENAME TABLE operators_old TO operators;

-- Repeat for other tables
```

---

## POST-MIGRATION TASKS

### 1. Update Backend Connection
```javascript
// Ensure backend uses correct database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### 2. Test All Endpoints
```bash
# Test operators
curl https://your-api.com/api/operators

# Test section filtering
curl https://your-api.com/api/operators/section/Media%20Preparation

# Test CRUD operations
curl -X POST https://your-api.com/api/indoor/autoclave-cycles \
  -H "Content-Type: application/json" \
  -d '{"date":"2024-01-15","mediaCode":"MS-001",...}'
```

### 3. Update Frontend Environment
```bash
# .env or .env.production
VITE_API_URL=https://your-api.com/api
```

### 4. Clear Frontend Cache
```bash
# Clear build cache
rm -rf dist/
npm run build

# Or in Vercel, trigger new deployment
git commit --allow-empty -m "Trigger rebuild"
git push
```

---

## PERFORMANCE OPTIMIZATION

After migration, optimize:

### 1. Analyze Tables
```sql
ANALYZE TABLE operators;
ANALYZE TABLE autoclave_cycles;
ANALYZE TABLE media_batches;
-- Repeat for all tables
```

### 2. Optimize Tables
```sql
OPTIMIZE TABLE operators;
OPTIMIZE TABLE autoclave_cycles;
-- Repeat for all tables
```

### 3. Check Query Performance
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Check slow queries after a day
SELECT * FROM mysql.slow_log;
```

---

## TROUBLESHOOTING

### Issue: "Table doesn't exist"
```sql
-- Check database
SHOW DATABASES;
USE your_database;
SHOW TABLES;
```

### Issue: "JSON_CONTAINS not working"
```sql
-- Check MySQL version (needs 5.7+)
SELECT VERSION();

-- Test JSON functions
SELECT JSON_EXTRACT('["test"]', '$');
```

### Issue: "Access denied"
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON your_database.* TO 'your_user'@'%';
FLUSH PRIVILEGES;
```

### Issue: "Data not showing in frontend"
1. Check backend logs
2. Verify API endpoints return data
3. Check browser console for errors
4. Verify field name mappings (see FIELD_MAPPING_VERIFICATION.md)

---

## SUPPORT

If you encounter issues:

1. Check logs: Backend server logs, MySQL error log
2. Verify: Field mappings in FIELD_MAPPING_VERIFICATION.md
3. Test: Each API endpoint individually
4. Rollback: Use backup if needed

---

## MIGRATION TIMELINE

**Estimated Time**: 30-60 minutes

- Backup: 5 minutes
- Schema application: 5 minutes
- Data migration (if needed): 10-20 minutes
- Verification: 10-15 minutes
- Testing: 10-15 minutes

**Recommended**: Perform during low-traffic hours

---

## FINAL CHECKLIST

Before going live:

- [ ] Database backup created
- [ ] New schema applied successfully
- [ ] All tables exist with correct structure
- [ ] Sample operators inserted
- [ ] Indexes created
- [ ] Views working
- [ ] Stored procedures working
- [ ] Backend connected to new database
- [ ] All API endpoints tested
- [ ] Frontend displays data correctly
- [ ] Operator filtering works
- [ ] Date formatting correct
- [ ] CRUD operations work
- [ ] Export functionality works
- [ ] No console errors
- [ ] Performance acceptable

**Status**: Ready for production! ✅
