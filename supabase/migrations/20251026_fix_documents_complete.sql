-- Complete fix for documents table
-- Run this in Supabase SQL Editor to fix the column name issues

BEGIN;

-- First, let's check and fix the documents table structure
DO $$ 
BEGIN
    -- Ensure class_id column exists and is properly configured
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'class_id'
    ) THEN
        -- Add class_id column if it doesn't exist
        ALTER TABLE documents 
        ADD COLUMN class_id UUID REFERENCES classes(class_id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added class_id column to documents table';
    ELSE
        RAISE NOTICE 'class_id column already exists in documents table';
    END IF;
END $$;

-- Drop any existing indexes
DROP INDEX IF EXISTS documents_class_id_idx;
DROP INDEX IF EXISTS documents_classroom_id_idx;

-- Drop any existing foreign key constraints
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_class_id_fkey;
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_classroom_id_fkey;

-- Re-add the foreign key constraint with correct column name
ALTER TABLE documents 
ADD CONSTRAINT documents_class_id_fkey 
FOREIGN KEY (class_id) 
REFERENCES classes(class_id) ON DELETE CASCADE;

-- Re-create the index with correct column name
CREATE INDEX documents_class_id_idx ON documents(class_id);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view documents from their enrolled classes" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Anyone can read documents" ON documents;
DROP POLICY IF EXISTS "Users can upload their own documents" ON documents;

-- Allow users to view documents from classes they're enrolled in
CREATE POLICY "Users can view documents from their enrolled classes"
  ON documents
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 
      FROM class_enrollments 
      WHERE class_enrollments.class_id = documents.class_id 
      AND class_enrollments.user_id = auth.uid()
    )
  );

-- Allow users to insert their own documents
CREATE POLICY "Users can insert their own documents"
  ON documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own documents
CREATE POLICY "Users can update their own documents"
  ON documents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
  ON documents
  FOR DELETE
  USING (auth.uid() = user_id);

COMMIT;

-- Verify the setup
DO $$
DECLARE
    doc_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO doc_count FROM documents;
    RAISE NOTICE '✅ Migration complete! Documents table has % documents', doc_count;
    RAISE NOTICE '✅ RLS policies updated';
    RAISE NOTICE '✅ Foreign key constraint added';
    RAISE NOTICE '✅ Index created on class_id';
END $$;
