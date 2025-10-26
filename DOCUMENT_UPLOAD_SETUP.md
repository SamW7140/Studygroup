# Document Upload and Management Setup

## Overview

This guide will help you set up document upload and management features for your Studygroup application.

## Prerequisites

Before starting, make sure you have:
- ✅ User authentication set up (from AUTH_SETUP.md)
- ✅ User roles migration applied (professors and students)
- ✅ Supabase project configured

## Step 1: Apply Database Migration

Run the document storage migration in Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/migrations/20251025_setup_document_storage.sql`
3. Copy and paste the SQL into the editor
4. Click **Run** to execute

This migration will:
- Add `file_type`, `file_size`, `class_id`, and `updated_at` columns to `documents` table
- Create indexes for better performance
- Set up Row Level Security (RLS) policies
- Create auto-update trigger for `updated_at`

## Step 2: Create Storage Bucket

In Supabase Dashboard:

1. Navigate to **Storage** section
2. Click **"New Bucket"**
3. Configure the bucket:
   - **Bucket Name**: `documents`
   - **Public Bucket**: ❌ NO (keep private)
   - **File size limit**: 50 MB
   - **Allowed MIME types**:
     - `application/pdf`
     - `application/vnd.openxmlformats-officedocument.presentationml.presentation` (PPTX)
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)
     - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (XLSX)
     - `image/png`
     - `image/jpeg`

## Step 3: Set Up Storage Policies

After creating the bucket, add these Storage Policies:

### Policy 1: Allow Authenticated Users to Upload

- **Name**: Authenticated users can upload
- **Allowed operation**: INSERT
- **Policy definition**:
  ```sql
  (bucket_id = 'documents' AND auth.role() = 'authenticated')
  ```

### Policy 2: Allow Authenticated Users to Read

- **Name**: Authenticated users can read
- **Allowed operation**: SELECT
- **Policy definition**:
  ```sql
  (bucket_id = 'documents' AND auth.role() = 'authenticated')
  ```

### Policy 3: Allow Users to Delete Their Own Documents

- **Name**: Users can delete own documents
- **Allowed operation**: DELETE
- **Policy definition**:
  ```sql
  (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1])
  ```

## Step 4: Test the Upload Feature

1. **Start your dev server:**
   ```powershell
   npm run dev
   ```

2. **Sign in as a test user** (professor or student)

3. **Navigate to a class page:**
   - Go to `/classes/[class-id]/documents`
   - Or update your class page to include the upload form

4. **Test uploading:**
   - Select a file (PDF, PPTX, DOCX, etc.)
   - Enter a title
   - Click "Upload Document"

5. **Verify the upload:**
   - Check that the document appears in the list
   - Verify you can download it
   - If you're the owner, verify you can delete it

## File Structure

The uploaded files are organized as:
```
documents/
  {user_id}/
    {class_id}/
      {timestamp}_{filename}
```

Example:
```
documents/550e8400-e29b-41d4-a716-446655440000/123e4567-e89b-12d3-a456-426614174000/1698765432000_lecture_notes.pdf
```

## Features Included

### Upload Form (`components/documents/upload-form.tsx`)
- File selection with preview
- Title input
- Progress indication
- Error/success messages
- File type validation
- File size display

### Document List (`components/documents/document-list.tsx`)
- Display all documents with icons
- Show file type, size, and upload date
- Download button (generates signed URL)
- Delete button (only for document owner)
- Owner information display

### Server Actions (`app/actions/documents.ts`)
- `uploadDocument()` - Upload file and create DB entry
- `getDocumentsByClass()` - Get all documents for a class
- `getMyDocuments()` - Get current user's documents
- `getDocumentDownloadUrl()` - Generate signed download URL
- `deleteDocument()` - Delete document (owner only)
- `formatFileSize()` - Format bytes to human-readable

## Supported File Types

| Extension | Type | Icon Color |
|-----------|------|------------|
| .pdf | PDF Document | Red |
| .pptx | PowerPoint | Orange |
| .docx | Word Document | Blue |
| .xlsx | Excel Spreadsheet | Green |
| .png, .jpg, .jpeg | Images | Purple |

## Usage Examples

### Upload a Document

```tsx
import { DocumentUploadForm } from '@/components/documents/upload-form'

export default function Page() {
  return (
    <DocumentUploadForm 
      classId="123e4567-e89b-12d3-a456-426614174000"
      onUploadComplete={() => {
        console.log('Upload completed!')
        // Refresh page or update state
      }}
    />
  )
}
```

### Display Documents List

```tsx
import { DocumentList } from '@/components/documents/document-list'
import { getDocumentsByClass } from '@/app/actions/documents'
import { getCurrentUser } from '@/app/actions/auth'

export default async function Page() {
  const documents = await getDocumentsByClass('class-id')
  const user = await getCurrentUser()

  return (
    <DocumentList
      documents={documents}
      showOwner={true}
      showDelete={true}
      currentUserId={user?.id}
      onDocumentDeleted={() => {
        // Handle refresh
      }}
    />
  )
}
```

## Security Features

### Database (RLS Policies)
- ✅ Anyone can read documents (public within app)
- ✅ Authenticated users can upload documents
- ✅ Users can only update/delete their own documents

### Storage (Bucket Policies)
- ✅ Only authenticated users can upload
- ✅ Only authenticated users can download
- ✅ Users can only delete files in their own folders

### Application Logic
- ✅ User ID verification on upload
- ✅ Ownership check on delete
- ✅ File type validation
- ✅ File size limits (50MB)
- ✅ Signed URLs with expiry (1 hour)

## Troubleshooting

### "Upload failed: new row violates row-level security policy"
- Make sure you've applied the migration with RLS policies
- Verify you're authenticated
- Check that the user ID matches

### "Storage upload error: Bucket not found"
- Create the `documents` bucket in Supabase Storage
- Check the bucket name is exactly `documents`

### "Database error: column does not exist"
- Apply the migration: `20251025_setup_document_storage.sql`
- Verify columns exist in `documents` table

### Cannot download files
- Check storage policies are set correctly
- Make sure bucket is private (not public)
- Verify signed URL generation is working

### File type not allowed
- Check your file extension is in the allowed list
- Verify MIME type is configured in bucket settings

## Next Steps

### For Professors:
1. Upload lecture notes, slides, and assignments
2. Organize documents by class
3. Students can access and download materials

### For Students:
1. View and download course materials
2. Upload homework or project documents
3. Share notes with classmates

### Integration with AI Service:
- Documents are automatically available for AI Q&A
- The AI service reads from the same `documents` table
- Students can ask questions about uploaded PDFs/PPTX
- Professors can see what documents are being queried

## API Reference

See `app/actions/documents.ts` for full API documentation.

---

**Ready to upload! 📄** Start uploading documents and testing the feature.
