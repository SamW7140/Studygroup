-- Migration to set up document storage and management
-- Run this after the user roles migration

-- Add file_type column to documents table for better filtering
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS file_type TEXT CHECK (file_type IN ('pdf', 'pptx', 'docx', 'png', 'jpg', 'jpeg', 'xlsx'));

-- Add file_size column to track document sizes
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- Add class_id to directly link documents to classes
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(class_id) ON DELETE CASCADE;

-- Add updated_at column to track modifications
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index on class_id for faster queries
CREATE INDEX IF NOT EXISTS documents_class_id_idx ON documents(class_id);

-- Create index on file_type for filtering
CREATE INDEX IF NOT EXISTS documents_file_type_idx ON documents(file_type);

-- Create index on user_id for faster user document queries
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents(user_id);

-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow users to read documents in classes they have access to
-- For now, allow anyone to read (we'll refine this later with class enrollment)
CREATE POLICY "Anyone can read documents" ON documents
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own documents
CREATE POLICY "Users can upload their own documents" ON documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own documents
CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for documents (if not exists)
-- Note: This needs to be run in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('documents', 'documents', false)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies for document bucket
-- These need to be created in Supabase Storage settings:
-- 1. Allow authenticated users to upload: bucket_id = 'documents' AND auth.role() = 'authenticated'
-- 2. Allow anyone to read: bucket_id = 'documents'

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Document storage migration completed! Remember to create the storage bucket in Supabase dashboard.';
END $$;
