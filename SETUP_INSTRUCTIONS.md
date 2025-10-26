# Complete Setup Instructions

Follow these steps to fully set up your Studygroup application with document upload and enrollment features.

## Prerequisites
- Supabase account and project created
- Project credentials in `.env.local`

## Step 1: Apply Database Migrations

### 1.1 Document Storage Migration
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy the contents of `supabase/migrations/20251025_setup_document_storage.sql`
6. Paste and click **Run**
7. You should see: "Document storage migration completed!"

### 1.2 Enrollment System Migration
1. Still in SQL Editor, click **New Query**
2. Copy the contents of `supabase/migrations/20251025_add_enrollments.sql`
3. Paste and click **Run**
4. You should see: "Enrollment system migration completed!"

## Step 2: Create Storage Bucket

### 2.1 Create Documents Bucket
1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. Click **New bucket**
3. Configure:
   - **Name**: `documents`
   - **Public bucket**: ❌ **UNCHECKED** (must be private)
   - **File size limit**: 50 MB (or as desired)
   - **Allowed MIME types**: Leave empty for all types
4. Click **Create bucket**

### 2.2 Set Up Storage Policies
After creating the bucket:

1. Click on the `documents` bucket
2. Go to **Policies** tab
3. Click **New Policy**

#### Policy 1: Allow Authenticated Users to Upload
- **Policy name**: Allow authenticated uploads
- **Policy definition**: Custom
- **Target roles**: `authenticated`
- **Operation**: `INSERT`
- **Policy definition**:
```sql
bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
```
- This ensures users can only upload to their own folder

#### Policy 2: Allow Authenticated Users to Read
- **Policy name**: Allow authenticated reads
- **Policy definition**: Custom
- **Target roles**: `authenticated`
- **Operation**: `SELECT`
- **Policy definition**:
```sql
bucket_id = 'documents'
```
- This allows authenticated users to download any document (you can restrict this later)

#### Policy 3: Allow Users to Delete Their Own Files
- **Policy name**: Allow users to delete own files
- **Policy definition**: Custom
- **Target roles**: `authenticated`
- **Operation**: `DELETE`
- **Policy definition**:
```sql
bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
```

## Step 3: Verify Setup

### 3.1 Check Database Tables
In SQL Editor, run:
```sql
-- Check documents table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents';

-- Check class_enrollments table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'class_enrollments';

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('documents', 'class_enrollments');
```

### 3.2 Test Document Upload
1. Start your dev server: `npm run dev`
2. Log in as a professor
3. Create a class
4. Try uploading a document
5. Check that:
   - Upload completes successfully
   - Document appears in the list
   - You can download it
   - You can delete it

### 3.3 Test Enrollment System
1. Log in as a student
2. Browse to a class page
3. Click "Enroll in Class"
4. Verify the enrollment status banner appears
5. Log in as the professor
6. View the same class
7. Verify the student appears in the roster

## Step 4: Verify Storage in Supabase

1. Go to **Storage** > **documents** bucket
2. You should see folders named with user IDs
3. Inside each user folder, class folders
4. Inside class folders, your uploaded files

## Troubleshooting

### Upload Fails with "Failed to create a new bucket"
- Make sure the `documents` bucket exists in Storage
- Check the bucket name is exactly `documents` (lowercase, no spaces)

### Upload Fails with "new row violates row-level security policy"
- Verify RLS policies are set up correctly
- Make sure user is authenticated
- Check that the `auth.uid()` matches in policies

### "Cannot read documents" Error
- Check storage SELECT policy allows authenticated users
- Verify the user is logged in
- Try refreshing the page

### Enrollment Fails
- Verify the enrollment migration ran successfully
- Check that `class_enrollments` table exists
- Ensure RLS policies are enabled

### TypeScript Errors
- Run: `npm run build` to check for type errors
- Restart VS Code TypeScript server: Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"

## Features Ready to Use

After setup, you'll have:

✅ **Document Upload**
- Upload PDF, PPTX, DOCX, PNG, JPG, XLSX files
- Files stored in Supabase Storage
- Metadata saved in database
- Download and delete capabilities

✅ **Class Enrollment**
- Students can enroll in classes
- Professors can view enrolled students
- Enrollment counts on class cards

✅ **Role-Based Access**
- Professors can create classes
- Students can enroll
- Users can only delete their own documents

✅ **Real-Time Updates**
- Page refreshes after upload
- Enrollment status updates immediately

## Next Steps

1. **Test the AI Service**: Upload documents and try querying them
2. **Customize RLS Policies**: Restrict document access based on class enrollment
3. **Add More Features**: 
   - Document versioning
   - Collaborative annotations
   - AI-powered Q&A on uploaded documents

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs: Dashboard > Logs
3. Verify environment variables in `.env.local`
4. Ensure all migrations ran successfully
