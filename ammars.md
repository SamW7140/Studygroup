# Database Column Rename and Fixes - October 26, 2025

## Issue
Fixed file upload functionality by addressing the column name mismatch between code and database (`class_id` vs `classroom_id`).

## Changes Made

### 1. Database Changes
- Renamed column from `class_id` to `classroom_id` in the documents table
- Updated foreign key constraints and indexes
- Fixed Row Level Security (RLS) policies

### 2. Code Changes
File: `app/actions/documents.ts`
- Updated all database queries to use `classroom_id`
- Fixed document interface definition
- Updated document upload function
- Fixed document deletion function
- Added better error handling

### 3. Migration Files

#### RLS Policy Fix (`20251026_fix_documents_rls.sql`):
```sql
-- Enable RLS
alter table "public"."documents" enable row level security;

-- Drop existing policies
drop policy if exists "Users can view documents from their enrolled classes" on "public"."documents";
drop policy if exists "Users can insert their own documents" on "public"."documents";
drop policy if exists "Users can update their own documents" on "public"."documents";
drop policy if exists "Users can delete their own documents" on "public"."documents";
drop policy if exists "Anyone can read documents" on "public"."documents";
drop policy if exists "Users can upload their own documents" on "public"."documents";

-- Allow users to view documents from classes they're enrolled in
create policy "Users can view documents from their enrolled classes"
  on "public"."documents"
  for select
  using (
    auth.uid() = user_id
    or
    exists (
      select 1 
      from class_enrollments 
      where class_enrollments.class_id = documents.classroom_id 
      and class_enrollments.user_id = auth.uid()
    )
  );

-- Allow users to insert their own documents
create policy "Users can insert their own documents"
  on "public"."documents"
  for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own documents
create policy "Users can update their own documents"
  on "public"."documents"
  for update
  using (auth.uid() = user_id);

-- Allow users to delete their own documents
create policy "Users can delete their own documents"
  on "public"."documents"
  for delete
  using (auth.uid() = user_id);
```

#### Column Rename and Constraints (`20251026_rename_class_id_to_classroom_id.sql`):
```sql
-- Fix documents table constraints
BEGIN;

-- Drop any existing indexes
DROP INDEX IF EXISTS documents_class_id_idx;
DROP INDEX IF EXISTS documents_classroom_id_idx;

-- Drop any existing foreign key constraints
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_class_id_fkey;
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_classroom_id_fkey;

-- Re-add the foreign key constraint
ALTER TABLE documents 
ADD CONSTRAINT documents_classroom_id_fkey 
FOREIGN KEY (classroom_id) 
REFERENCES classes(class_id);

-- Re-create the index with new name
CREATE INDEX documents_classroom_id_idx ON documents(classroom_id);

COMMIT;
```

## Application of Changes

To apply these changes:

1. Run the RLS policy fix first (`20251026_fix_documents_rls.sql`)
2. Then run the column constraints fix (`20251026_rename_class_id_to_classroom_id.sql`)
3. Restart the Next.js development server

## Verification

After applying the changes:
- File uploads should work correctly
- Documents should be properly associated with classes
- Security policies should function as intended
- Database constraints should maintain data integrity

## Notes

- The column rename was already completed in a previous migration
- These changes ensure consistency between code and database schema
- RLS policies have been updated to use the new column name
- Added proper indexes and foreign key constraints

---

# File Upload Implementation Summary

## Overview
We implemented a complete file upload system that allows users to upload documents to specific classes in the Studygroup application. The implementation includes a user-friendly interface, proper error handling, and secure file storage using Supabase.

## Key Components Added/Modified

### 1. Action Tiles Component
Modified the dashboard's action tiles to handle the file upload process in two steps:
- First step: File selection
- Second step: Class selection via a dialog

### 2. New Components
Created two new components:
- `SelectClassDialog`: A modal dialog for choosing which class to upload to
- Base `Dialog` component using Radix UI for reusable modal functionality

### 3. Environment Configuration
Added Supabase configuration in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## User Flow
1. User clicks "Upload Notes" on the dashboard
2. File picker opens to select a document
3. After selecting a file:
   - Shows a success toast that file was selected
   - Opens the class selection dialog
4. User selects a class to upload to
5. File uploads to Supabase storage
6. Success/error message appears
7. Form clears on successful upload

## Technical Details

### File Upload Process
The upload uses FormData with three key pieces:
- `file`: The actual document
- `title`: Name of the file
- `classId`: The selected class identifier

### Supported File Types
```
- PDF (.pdf)
- Word Documents (.doc, .docx)
- PowerPoint (.ppt, .pptx)
- Text Files (.txt)
- Markdown (.md)
```

### Error Handling
- Client-side validation of file selection
- Server-side validation of:
  - File types
  - User authentication
  - Class existence
  - Storage permissions
- Clear error messages via toast notifications

### Storage Implementation
- Files are stored in Supabase storage
- Each file gets a unique path: `{classId}/{timestamp}_{filename}`
- Database entry created for each uploaded document

## Required Setup

1. Environment Variables
   - Add Supabase credentials to `.env.local`
   - Never commit this file to version control

2. Dependencies
   - Ensure @radix-ui/react-dialog is installed
   - Required for the class selection modal

3. Supabase Configuration
   - Storage bucket named 'documents' must exist
   - Proper storage permissions must be set
   - RLS (Row Level Security) policies should be configured

## Testing the Implementation
1. Set up environment variables
2. Restart the Next.js development server
3. Try uploading a file:
   - Click "Upload Notes"
   - Select a supported file type
   - Choose a class
   - Check for success message

## Troubleshooting
If upload fails, check:
1. Environment variables are properly set
2. Supabase storage bucket exists
3. File size is within limits
4. File type is supported
5. User is authenticated
6. Class ID is valid

## Security Considerations
- Files are stored securely in Supabase
- Environment variables protect API keys
- Client-side validation prevents invalid uploads
- Server-side validation ensures data integrity
- User authentication required for uploads
