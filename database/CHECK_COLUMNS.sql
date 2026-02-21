-- Check all columns in each table
SELECT 'subculturing' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subculturing' 
ORDER BY ordinal_position;

SELECT 'incubation' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'incubation' 
ORDER BY ordinal_position;

SELECT 'sampling' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sampling' 
ORDER BY ordinal_position;

SELECT 'primary_hardening' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'primary_hardening' 
ORDER BY ordinal_position;

SELECT 'secondary_hardening' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'secondary_hardening' 
ORDER BY ordinal_position;

SELECT 'shifting' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'shifting' 
ORDER BY ordinal_position;

SELECT 'outdoor_mortality' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'outdoor_mortality' 
ORDER BY ordinal_position;

SELECT 'fertilization' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fertilization' 
ORDER BY ordinal_position;

SELECT 'holding_area' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'holding_area' 
ORDER BY ordinal_position;

SELECT 'outdoor_sampling' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'outdoor_sampling' 
ORDER BY ordinal_position;
