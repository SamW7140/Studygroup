-- Instructions for setting up Supabase Storage Bucket

-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New Bucket"
-- 3. Bucket Name: documents
-- 4. Public Bucket: NO (keep private)
-- 5. File size limit: 50MB (recommended)
-- 6. Allowed MIME types: 
--    - application/pdf
--    - application/vnd.openxmlformats-officedocument.presentationml.presentation
--    - application/vnd.openxmlformats-officedocument.wordprocessingml.document
--    - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
--    - image/png
--    - image/jpeg

-- 7. After creating bucket, set up Storage Policies:

-- Policy 1: Allow authenticated users to upload documents
-- Name: Authenticated users can upload
-- Policy definition:
-- (bucket_id = 'documents' AND auth.role() = 'authenticated')

-- Policy 2: Allow authenticated users to read documents
-- Name: Authenticated users can read
-- Policy definition:
-- (bucket_id = 'documents' AND auth.role() = 'authenticated')

-- Policy 3: Allow users to delete their own documents
-- Name: Users can delete own documents
-- Policy definition:
-- (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1])

-- Storage path structure: {user_id}/{class_id}/{filename}
-- Example: 550e8400-e29b-41d4-a716-446655440000/123e4567-e89b-12d3-a456-426614174000/lecture_notes.pdf
