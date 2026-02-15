# DATABASE QUICK REFERENCE

## 🗄️ All Tables at a Glance

### 1. OPERATORS
```sql
id, first_name, middle_name, last_name, short_name, role, 
sections (JSON), age, gender, is_active, created_at, updated_at
```
**Purpose**: Operator master with section assignments  
**Key Fields**: short_name (unique), sections (JSON array)  
**Indexes**: short_name, is_active

---

### 2. AUTOCLAVE_CYCLES
```sql
id, date, media_code, operator_name, type_of_media, 
autoclave_on_time, media_loading_time, pressure_time, 
off_time, open_time, media_total, remark, created_at, updated_at
```
**Purpose**: Track autoclave sterilization cycles  
**Key Fields**: date, media_code, operator_name  
**Indexes**: date, media_code, operator_name, (date+media_code)

---

### 3. MEDIA_BATCHES
```sql
id, date, media_code, operator_name, quantity, bottles, 
contamination, created_at, updated_at
```
**Purpose**: Track media batch preparation  
**Key Fields**: date, media_code, bottles  
**Indexes**: date, media_code, operator_name, (date+media_code)

---

### 4. SUBCULTURING
```sql
id, transfer_date, stage_number, batch_name, media_code, 
crop_name, no_of_bottles, no_of_shoots, operator_name, 
mortality, remark, created_at, updated_at
```
**Purpose**: Track plant subculturing operations  
**Key Fields**: transfer_date, batch_name, stage_number  
**Indexes**: transfer_date, batch_name, operator_name, (transfer_date+batch_name)

---

### 5. INCUBATION
```sql
id, subculture_date, stage, batch_name, media_code, 
operator_name, crop_name, no_of_bottles, no_of_shoots, 
temp, humidity, photo_period, light_intensity, 
created_at, updated_at
```
**Purpose**: Track incubation conditions  
**Key Fields**: subculture_date, batch_name, environmental params  
**Indexes**: subculture_date, batch_name, operator_name, (subculture_date+batch_name)

---

### 6. MORTALITY_RECORD
```sql
id, date, batch_name, vessel_count, type_of_mortality, 
possible_source, disposal_method, created_at, updated_at
```
**Purpose**: Track plant mortality and disposal  
**Key Fields**: date, batch_name, vessel_count  
**Indexes**: date, batch_name

---

### 7. CLEANING_RECORD
```sql
id, date, operator_name, area_cleaned, created_at, updated_at
```
**Purpose**: Daily cleaning log  
**Key Fields**: date, operator_name, area_cleaned  
**Indexes**: date, operator_name

---

### 8. DEEP_CLEANING_RECORD
```sql
id, date, operator, instrument_cleaned, created_at, updated_at
```
**Purpose**: Deep cleaning and instrument sterilization log  
**Key Fields**: date, operator, instrument_cleaned  
**Indexes**: date, operator

---

### 9. SAMPLING
```sql
id, sample_date, crop_name, batch_name, stage, sent_date, 
received_date, status, govt_certificate, certificate_no, 
reason, created_at, updated_at
```
**Purpose**: Quality control sampling and certification  
**Key Fields**: sample_date, batch_name, status, certificate_no  
**Indexes**: sample_date, batch_name, crop_name, (sample_date+batch_name)

---

### 10. USERS
```sql
id, username, password, role, created_at, updated_at
```
**Purpose**: User authentication  
**Key Fields**: username (unique), password (hashed), role  
**Indexes**: username

---

## 🔍 Views

### v_operators_by_section
```sql
SELECT id, short_name, full_name, role, sections, is_active
FROM operators WHERE is_active = TRUE
```
**Purpose**: Quick lookup of active operators

### v_recent_activity
```sql
UNION of recent records from autoclave_cycles, media_batches, subculturing
```
**Purpose**: Dashboard recent activity feed

---

## ⚙️ Stored Procedures

### sp_get_operators_by_section(section_name)
```sql
CALL sp_get_operators_by_section('Media Preparation');
```
**Returns**: Operators assigned to specified section

### sp_get_dashboard_stats(from_date, to_date)
```sql
CALL sp_get_dashboard_stats('2024-01-01', '2024-12-31');
```
**Returns**: Count of records across all modules

---

## 📊 Field Types Reference

### Date Fields
- **Type**: `DATE`
- **Format**: `YYYY-MM-DD`
- **Examples**: date, transfer_date, sample_date, sent_date, received_date, subculture_date

### Time Fields
- **Type**: `TIME`
- **Format**: `HH:MM:SS`
- **Examples**: autoclave_on_time, media_loading_time, pressure_time, off_time, open_time

### Text Fields
- **Type**: `TEXT`
- **Use**: Long text content
- **Examples**: remark, contamination, area_cleaned, instrument_cleaned, possible_source, disposal_method, reason

### JSON Fields
- **Type**: `JSON`
- **Use**: Array storage
- **Examples**: sections (in operators table)
- **Format**: `["Media Preparation", "Subculturing"]`

### Integer Fields
- **Type**: `INT`
- **Examples**: bottles, no_of_bottles, no_of_shoots, vessel_count, age

### String Fields
- **Type**: `VARCHAR(n)`
- **Examples**: media_code, batch_name, crop_name, operator_name, short_name

---

## 🔑 Primary Keys

All tables use:
```sql
id INT PRIMARY KEY AUTO_INCREMENT
```

---

## 📅 Timestamps

All tables include:
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

---

## 🎯 Common Queries

### Get all active operators
```sql
SELECT * FROM operators WHERE is_active = TRUE;
```

### Get operators for specific section
```sql
SELECT * FROM operators 
WHERE JSON_CONTAINS(sections, '"Media Preparation"')
AND is_active = TRUE;
```

### Get recent autoclave cycles
```sql
SELECT * FROM autoclave_cycles 
ORDER BY date DESC, created_at DESC 
LIMIT 5;
```

### Get records by date range
```sql
SELECT * FROM media_batches 
WHERE date BETWEEN '2024-01-01' AND '2024-12-31';
```

### Get records by batch name
```sql
SELECT * FROM subculturing 
WHERE batch_name = 'B-2024-1145';
```

### Get contaminated batches
```sql
SELECT * FROM media_batches 
WHERE contamination IS NOT NULL 
AND contamination != 'None';
```

### Get mortality by date
```sql
SELECT * FROM mortality_record 
WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);
```

### Dashboard stats
```sql
SELECT 
  (SELECT COUNT(*) FROM autoclave_cycles WHERE date >= CURDATE() - INTERVAL 7 DAY) as weekly_autoclave,
  (SELECT COUNT(*) FROM media_batches WHERE date >= CURDATE() - INTERVAL 7 DAY) as weekly_batches,
  (SELECT COUNT(*) FROM subculturing WHERE transfer_date >= CURDATE() - INTERVAL 7 DAY) as weekly_subculture;
```

---

## 🔗 Relationships

### Logical Relationships (No Foreign Keys)

**operators.short_name** → Used in:
- autoclave_cycles.operator_name
- media_batches.operator_name
- subculturing.operator_name
- incubation.operator_name
- cleaning_record.operator_name
- deep_cleaning_record.operator

**batch_name** → Shared across:
- subculturing.batch_name
- incubation.batch_name
- mortality_record.batch_name
- sampling.batch_name

**media_code** → Shared across:
- autoclave_cycles.media_code
- media_batches.media_code
- subculturing.media_code
- incubation.media_code

---

## 💾 Storage Estimates

### Per Record (Approximate)
- operators: ~200 bytes
- autoclave_cycles: ~300 bytes
- media_batches: ~200 bytes
- subculturing: ~350 bytes
- incubation: ~350 bytes
- mortality_record: ~250 bytes
- cleaning_record: ~200 bytes
- deep_cleaning_record: ~200 bytes
- sampling: ~300 bytes

### For 1 Year (Estimated)
- Daily records: ~365 records/table
- Total records: ~3,650 records
- Total storage: ~1-2 MB
- With indexes: ~3-5 MB

---

## 🚀 Performance Tips

1. **Use Indexes**: All date and name fields are indexed
2. **Limit Results**: Use LIMIT for large datasets
3. **Date Ranges**: Use BETWEEN for date filtering
4. **JSON Queries**: Use JSON_CONTAINS for section filtering
5. **Analyze Tables**: Run ANALYZE TABLE periodically
6. **Optimize Tables**: Run OPTIMIZE TABLE monthly

---

## 🔒 Security Notes

1. **Password Hashing**: Use bcrypt for user passwords
2. **SQL Injection**: Use prepared statements
3. **Access Control**: Implement role-based permissions
4. **Backup**: Daily automated backups recommended
5. **Audit Log**: Consider adding audit trail table

---

## 📱 Quick Commands

### Backup
```bash
mysqldump -u user -p database > backup.sql
```

### Restore
```bash
mysql -u user -p database < backup.sql
```

### Check Size
```sql
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES
WHERE table_schema = 'your_database'
ORDER BY (data_length + index_length) DESC;
```

### Count Records
```sql
SELECT 
  'operators' as table_name, COUNT(*) as count FROM operators
UNION ALL
SELECT 'autoclave_cycles', COUNT(*) FROM autoclave_cycles
UNION ALL
SELECT 'media_batches', COUNT(*) FROM media_batches
UNION ALL
SELECT 'subculturing', COUNT(*) FROM subculturing
UNION ALL
SELECT 'incubation', COUNT(*) FROM incubation
UNION ALL
SELECT 'mortality_record', COUNT(*) FROM mortality_record
UNION ALL
SELECT 'cleaning_record', COUNT(*) FROM cleaning_record
UNION ALL
SELECT 'deep_cleaning_record', COUNT(*) FROM deep_cleaning_record
UNION ALL
SELECT 'sampling', COUNT(*) FROM sampling;
```

---

**Quick Reference Version**: 1.0  
**Last Updated**: 2024  
**Database Engine**: MySQL 5.7+ / MariaDB 10.2+
