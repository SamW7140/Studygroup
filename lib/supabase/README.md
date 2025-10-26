# Supabase Integration

This directory contains all Supabase-related code for the Study Group application.

## 🗄️ Database Schema

The application uses the following tables:

### Tables

#### `profiles`
User profiles extending Supabase Auth
- `id` (uuid, PK) - References auth.users.id
- `username` (text)
- `created_at` (timestampz)

#### `documents`
File metadata and content
- `id` (uuid, PK)
- `user_id` (uuid, FK) - References profiles.id
- `title` (text)
- `extracted_text` (text) - Full text content from file
- `storage_path` (text) - Path in Supabase Storage
- `created_at` (timestampz)

#### `flags`
Tags/categories for organizing documents
- `id` (bigint, PK)
- `user_id` (uuid, FK) - References profiles.id
- `name` (text) - e.g., 'CHEM101', 'Fall 2025', 'Exam'
- `type` (text) - e.g., 'Class', 'Semester', 'Type'

#### `document_flags`
Junction table for many-to-many relationship
- `document_id` (uuid, PK, FK)
- `flag_id` (bigint, PK, FK)

### Important Notes

- **Classes are represented as flags** with `type='Class'`
- Each document can have multiple flags
- Each flag can be applied to multiple documents
- Use flags to organize by: Class, Semester, Document Type, etc.

## 📁 File Structure

```
lib/supabase/
├── client.ts      # Client-side Supabase client
├── server.ts      # Server-side Supabase client
├── types.ts       # TypeScript types matching database schema
├── queries.ts     # Helper functions for database operations
├── storage.ts     # File upload/download utilities
├── index.ts       # Barrel exports
└── README.md      # This file
```

## 🚀 Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned

### 2. Set Up Database Tables

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  extracted_text TEXT,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create flags table
CREATE TABLE flags (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL
);

-- Create document_flags junction table
CREATE TABLE document_flags (
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  flag_id BIGINT REFERENCES flags(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, flag_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_flags_user_id ON flags(user_id);
CREATE INDEX idx_flags_type ON flags(type);
CREATE INDEX idx_document_flags_document_id ON document_flags(document_id);
CREATE INDEX idx_document_flags_flag_id ON document_flags(flag_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for documents
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for flags
CREATE POLICY "Users can view their own flags"
  ON flags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flags"
  ON flags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flags"
  ON flags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flags"
  ON flags FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for document_flags
CREATE POLICY "Users can view document_flags for their documents"
  ON document_flags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_flags.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert document_flags for their documents"
  ON document_flags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_flags.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete document_flags for their documents"
  ON document_flags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_flags.document_id
      AND documents.user_id = auth.uid()
    )
  );
```

### 3. Set Up Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `documents`
3. Set it to private
4. Add RLS policies:

```sql
-- Storage policies for documents bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 4. Configure Environment Variables

Copy `.env.local` and fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from: **Project Settings → API**

## 💻 Usage Examples

### Client Component Example

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserDocuments } from '@/lib/supabase/queries'

export default function DocumentList() {
  const [documents, setDocuments] = useState([])
  const supabase = createClient()

  useEffect(() => {
    async function loadDocuments() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await getUserDocuments(supabase, user.id)
        setDocuments(data || [])
      }
    }
    loadDocuments()
  }, [])

  return (
    <div>
      {documents.map(doc => (
        <div key={doc.id}>{doc.title}</div>
      ))}
    </div>
  )
}
```

### Server Component Example

```tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserDocuments } from '@/lib/supabase/queries'

export default async function DocumentsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Please log in</div>
  }

  const { data: documents } = await getUserDocuments(supabase, user.id)

  return (
    <div>
      {documents?.map(doc => (
        <div key={doc.id}>{doc.title}</div>
      ))}
    </div>
  )
}
```

### Creating a Document with Flags

```tsx
import { createClient } from '@/lib/supabase/client'
import { createDocument, addFlagToDocument } from '@/lib/supabase/queries'

async function createDocumentWithTags(
  userId: string,
  title: string,
  file: File,
  classFlag: number,
  semesterFlag: number
) {
  const supabase = createClient()

  // 1. Upload file to storage
  const filePath = `${userId}/${file.name}`
  await supabase.storage
    .from('documents')
    .upload(filePath, file)

  // 2. Create document record
  const { data: document } = await createDocument(supabase, {
    user_id: userId,
    title,
    extracted_text: '', // Add text extraction logic
    storage_path: filePath,
  })

  // 3. Add flags
  if (document) {
    await addFlagToDocument(supabase, {
      document_id: document.id,
      flag_id: classFlag,
    })
    await addFlagToDocument(supabase, {
      document_id: document.id,
      flag_id: semesterFlag,
    })
  }
}
```

## 🔑 Authentication

The middleware automatically handles session refresh. To implement authentication:

```tsx
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
