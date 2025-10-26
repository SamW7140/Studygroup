-- Diagnostic queries to check documents table status
-- Run these in Supabase SQL Editor to diagnose the issue

-- 1. Check if documents table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'documents'
ORDER BY ordinal_position;

-- 2. Check all documents in the database
SELECT 
    id,
    title,
    file_type,
    user_id,
    class_id,
    storage_path,
    created_at
FROM documents
ORDER BY created_at DESC;

-- 3. Check foreign key constraints on documents table
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'documents' 
    AND tc.constraint_type = 'FOREIGN KEY';

-- 4. Check RLS policies on documents table
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
WHERE tablename = 'documents';

-- 5. Check indexes on documents table
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'documents';
