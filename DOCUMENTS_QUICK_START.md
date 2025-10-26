# Document Upload & Storage - Quick Start

## What's Been Created

### ✅ Database Schema
- **Migration file**: `supabase/migrations/20251025_setup_document_storage.sql`
- Adds: `file_type`, `file_size`, `class_id`, `updated_at` to documents table
- Includes: RLS policies, indexes, auto-update trigger

### ✅ Server Actions
- **File**: `app/actions/documents.ts`
- Functions:
  - `uploadDocument()` - Upload to storage + DB
  - `getDocumentsByClass()` - Fetch documents by class
  - `getMyDocuments()` - Get user's documents
  - `getDocumentDownloadUrl()` - Generate signed URL
  - `deleteDocument()` - Delete (owner only)

### ✅ React Components
- **Upload Form**: `components/documents/upload-form.tsx`
  - Drag & drop file selection
  - Title input
  - Real-time feedback
  
- **Document List**: `components/documents/document-list.tsx`
  - Display documents with icons
  - Download button
  - Delete button (for owners)

### ✅ Test Page
- **Route**: `app/(dashboard)/classes/[id]/documents/page.tsx`
- Shows both upload form and documents list

### ✅ Updated Types
- **File**: `lib/supabase/types.ts`
- Updated documents table type definition
- Updated Profiles table with role fields

## To Get Started

### 1. Apply Migrations (Required)

**In Supabase SQL Editor**, run these in order:

1. **User Roles** (if not done already):
   ```sql
   -- Copy from: supabase/migrations/20251025_add_user_roles.sql
   ```

2. **Document Storage**:
   ```sql
   -- Copy from: supabase/migrations/20251025_setup_document_storage.sql
   ```

### 2. Create Storage Bucket

1. Go to Supabase → **Storage**
2. Click **"New Bucket"**
3. Name: `documents`
4. Public: **NO** ❌
5. Max size: 50 MB

### 3. Add Storage Policies

Add these 3 policies to the `documents` bucket:

```sql
-- 1. Upload (authenticated users)
(bucket_id = 'documents' AND auth.role() = 'authenticated')

-- 2. Read (authenticated users)
(bucket_id = 'documents' AND auth.role() = 'authenticated')

-- 3. Delete (own files only)
(bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1])
```

### 4. Test It Out

```powershell
# Start dev server
npm run dev

# Navigate to:
# http://localhost:3000/classes/{class-id}/documents
```

## Supported File Types

- 📄 PDF (`.pdf`)
- 📊 PowerPoint (`.pptx`)
- 📝 Word (`.docx`)
- 📈 Excel (`.xlsx`)
- 🖼️ Images (`.png`, `.jpg`, `.jpeg`)

## File Storage Structure

```
documents/
  └── {user_id}/
      └── {class_id}/
          └── {timestamp}_{filename}
```

## Security

✅ Row Level Security (RLS) enabled
✅ Only authenticated users can upload
✅ Users can only delete their own files
✅ Signed URLs for secure downloads (1-hour expiry)

## What's Next

After setup:
1. Create test users (professor/student)
2. Upload sample documents
3. Test download functionality
4. Integrate with AI service (documents are already in DB!)

---

📖 **Full Guide**: See `DOCUMENT_UPLOAD_SETUP.md` for detailed instructions
🔐 **Auth Setup**: See `AUTH_SETUP.md` for user authentication
🤖 **AI Service**: See `AI_SERVICE_README.md` for Q&A integration
