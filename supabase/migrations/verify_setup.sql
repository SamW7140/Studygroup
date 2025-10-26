-- Quick verification queries for Studygroup setup
-- Run these in Supabase SQL Editor to verify your setup

-- 1. Check if all tables exist
SELECT 
  tablename,
  CASE 
    WHEN tablename IN ('Profiles', 'classes', 'documents', 'class_enrollments') THEN '✅'
    ELSE '❌'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('Profiles', 'classes', 'documents', 'class_enrollments', 'document_flags')
ORDER BY tablename;

-- 2. Verify RLS is enabled on critical tables
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('Profiles', 'classes', 'documents', 'class_enrollments')
ORDER BY tablename;

-- 3. Check documents table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'documents'
ORDER BY ordinal_position;

-- 4. Check class_enrollments table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'class_enrollments'
ORDER BY ordinal_position;

-- 5. List all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('documents', 'class_enrollments')
ORDER BY tablename, policyname;

-- 6. Check storage buckets (requires storage schema access)
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name = 'documents';

-- 7. Count records (to see if data exists)
SELECT 
  'Profiles' as table_name, COUNT(*) as record_count FROM "Profiles"
UNION ALL
SELECT 'classes', COUNT(*) FROM classes
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'class_enrollments', COUNT(*) FROM class_enrollments;

-- 8. Sample data query (if you have data)
-- Uncomment to run:
-- SELECT 
--   c.class_name,
--   COUNT(DISTINCT d.id) as document_count,
--   COUNT(DISTINCT ce.user_id) as enrollment_count
-- FROM classes c
-- LEFT JOIN documents d ON c.class_id = d.class_id
-- LEFT JOIN class_enrollments ce ON c.class_id = ce.class_id
-- GROUP BY c.class_id, c.class_name
-- ORDER BY c.created_at DESC;

-- Expected Results:
-- 1. All 4 tables should show ✅
-- 2. All tables should have RLS ✅ Enabled
-- 3. documents table should have: id, user_id, title, storage_path, file_type, file_size, class_id, created_at, updated_at
-- 4. class_enrollments should have: id, class_id, user_id, enrolled_at
-- 5. Should show policies for SELECT, INSERT, UPDATE, DELETE on documents
-- 6. Should show 'documents' bucket with public = false
-- 7. Shows count of records in each table
