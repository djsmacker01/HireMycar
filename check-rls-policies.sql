-- Check RLS policies for cars table
-- Run this script in your Supabase SQL editor

-- Check if RLS is enabled on cars table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'cars';

-- Check RLS policies for cars table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'cars';

-- Check if current user can insert into cars table
-- This will show if there are any permission issues
SELECT has_table_privilege('cars', 'INSERT') as can_insert;
SELECT has_table_privilege('cars', 'SELECT') as can_select;

-- Check current user and role
SELECT current_user, current_role;
