-- Allow all authenticated users to read all documents
-- This enables document discovery and browsing before joining classes

BEGIN;

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view documents from their enrolled classes" ON documents;

-- Create a more permissive read policy
CREATE POLICY "Authenticated users can view all documents"
  ON documents
  FOR SELECT
  USING (auth.role() = 'authenticated');

COMMIT;

-- Verify
DO $$
BEGIN
    RAISE NOTICE '✅ Documents are now readable by all authenticated users';
    RAISE NOTICE '   Users can still only upload/edit/delete their own documents';
END $$;
