
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'cars'
) as table_exists;

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cars' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT id FROM user_profiles LIMIT 1;

-- If you have a user, use their ID in the insert below
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from the query above
/*
INSERT INTO cars (
    owner_id, 
    make, 
    model, 
    year, 
    color, 
    license_plate, 
    daily_rate, 
    location, 
    city, 
    state
) VALUES (
    'YOUR_USER_ID_HERE', -- Use real user ID
    'Test',
    'Model',
    2020,
    'White',
    'TEST123',
    1000.00,
    'Test Location',
    'Test City',
    'Test State'
);

-- If the above works, delete the test record
DELETE FROM cars WHERE license_plate = 'TEST123';
*/
