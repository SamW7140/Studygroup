# Migration Guide: Mock Data to Supabase

This guide explains how to migrate from the current mock data structure to the Supabase backend.

## 📊 Data Structure Changes

### Classes → Flags with type='Class'

The database doesn't have a dedicated `classes` table. Instead, classes are represented as **flags** with `type='Class'`.

#### Current Structure
```typescript
interface Class {
  id: string
  name: string          // e.g., "CMPSC 461"
  professor: string     // e.g., "Dr. Sarah Johnson"
  members: number       // e.g., 45
  joinCode: string      // e.g., "CS461-F23"
  lastActivity: Date
  color: string
  avatar?: string
}
```

#### Database Structure
```typescript
interface Flag {
  id: number            // bigint primary key
  user_id: string       // uuid foreign key
  name: string          // "CMPSC 461"
  type: string          // "Class"
}
```

#### Additional Metadata
You may need to extend the database schema to store class-specific metadata:

**Option 1: JSON Column (Quick Solution)**
```sql
ALTER TABLE flags ADD COLUMN metadata JSONB;

-- Store as:
{
  "professor": "Dr. Sarah Johnson",
  "members": 45,
  "joinCode": "CS461-F23",
  "color": "#4f46e5",
  "avatar": null
}
```

**Option 2: Dedicated Classes Table (Recommended)**
```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_id BIGINT UNIQUE REFERENCES flags(id) ON DELETE CASCADE,
  professor TEXT,
  members INTEGER DEFAULT 0,
  join_code TEXT UNIQUE,
  color TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Documents Structure

Documents map well to the database structure:

#### Current Frontend Model
```typescript
interface Document {
  id: string
  title: string
  type: 'pdf' | 'pptx' | 'docx' | 'png' | 'jpg' | 'xlsx'
  classId: string
  className: string
  owner: string
  lastEdited: Date
  thumbnail?: string
  size?: string
  tags?: string[]
}
```

#### Database Model
```typescript
interface Document {
  id: string          // uuid primary key
  user_id: string     // uuid foreign key to profiles
  title: string       // text
  extracted_text: string  // text content from file
  storage_path: string    // path in Supabase Storage
  created_at: string      // timestampz
}
```

#### Derived Fields
- `type`: Store as flag with type='FileType'
- `classId` / `className`: Get from related flags with type='Class'
- `owner`: Join with profiles table
- `lastEdited`: Use created_at or add updated_at column
- `thumbnail`: Generate or derive from storage
- `size`: Get from Storage metadata
- `tags`: Get from all related flags

## 🔄 Migration Steps

### Step 1: Set Up Supabase Project

1. Follow instructions in `lib/supabase/README.md`
2. Run the SQL schema setup
3. Configure RLS policies
4. Create the `documents` storage bucket

### Step 2: Create Helper Functions

Create utility functions to transform database records to frontend models:

```typescript
// lib/transforms/documents.ts
import type { Document as DbDocument, Flag } from '@/lib/supabase/types'
import type { Document as FrontendDocument } from '@/app/_data/documents'

export function transformDocument(
  dbDoc: DbDocument,
  flags: Flag[],
  ownerUsername: string
): FrontendDocument {
  const classFlag = flags.find(f => f.type === 'Class')
  const typeFlag = flags.find(f => f.type === 'FileType')
  const tagFlags = flags.filter(f => f.type === 'Tag')

  return {
    id: dbDoc.id,
    title: dbDoc.title,
    type: typeFlag?.name.toLowerCase() as FrontendDocument['type'] || 'pdf',
    classId: classFlag?.id.toString() || '',
    className: classFlag?.name || 'Unknown',
    owner: ownerUsername,
    lastEdited: new Date(dbDoc.created_at),
    tags: tagFlags.map(f => f.name),
  }
}
```

### Step 3: Create API Layer

Create server actions or API routes to fetch data:

```typescript
// app/actions/documents.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserDocuments, getDocumentWithFlags } from '@/lib/supabase/queries'
import { transformDocument } from '@/lib/transforms/documents'

export async function fetchDocuments() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data: documents } = await getUserDocuments(supabase, user.id)
  if (!documents) return []

  // Transform each document
  return Promise.all(
    documents.map(async (doc) => {
      const { data: docWithFlags } = await getDocumentWithFlags(supabase, doc.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', doc.user_id)
        .single()

      return transformDocument(
        doc,
        docWithFlags?.flags || [],
        profile?.username || 'Unknown'
      )
    })
  )
}
```

### Step 4: Update Components

Replace mock data with real data:

```typescript
// Before (using mock data)
import { documents } from '@/app/_data/documents'

export default function DocumentsPage() {
  return (
    <div>
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  )
}

// After (using Supabase)
import { fetchDocuments } from '@/app/actions/documents'

export default async function DocumentsPage() {
  const documents = await fetchDocuments()
  
  return (
    <div>
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  )
}
```

### Step 5: Implement File Upload

```typescript
// app/actions/upload.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createDocument, addFlagToDocument, createFlag } from '@/lib/supabase/queries'

export async function uploadDocument(
  formData: FormData,
  classId: number,
  fileType: string
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const file = formData.get('file') as File
  const title = formData.get('title') as string

  // 1. Upload to storage
  const filePath = `${user.id}/${Date.now()}-${file.name}`
  await supabase.storage
    .from('documents')
    .upload(filePath, file)

  // 2. Create document record
  const { data: document } = await createDocument(supabase, {
    user_id: user.id,
    title: title || file.name,
    extracted_text: '', // Implement text extraction
    storage_path: filePath,
  })

  if (!document) throw new Error('Failed to create document')

  // 3. Add class flag
  await addFlagToDocument(supabase, {
    document_id: document.id,
    flag_id: classId,
  })

  // 4. Add file type flag
  const { data: typeFlag } = await createFlag(supabase, {
    user_id: user.id,
    name: fileType,
    type: 'FileType',
  })

  if (typeFlag) {
    await addFlagToDocument(supabase, {
      document_id: document.id,
      flag_id: typeFlag.id,
    })
  }

  return document
}
```

## 🏗️ Recommended Extended Schema

To fully support the frontend features, consider adding these tables:

```sql
-- Classes table for additional metadata
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_id BIGINT UNIQUE REFERENCES flags(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  professor TEXT,
  join_code TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#4f46e5',
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class members table
CREATE TABLE class_members (
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (class_id, user_id)
);

-- Document activity tracking
CREATE TABLE document_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'updated', 'viewed', 'downloaded'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_classes_flag_id ON classes(flag_id);
CREATE INDEX idx_class_members_user_id ON class_members(user_id);
CREATE INDEX idx_document_activity_document_id ON document_activity(document_id);
```

## 🔐 Authentication Flow

Implement authentication pages:

### Sign Up Page
```typescript
// app/auth/signup/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { upsertProfile } from '@/lib/supabase/queries'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const supabase = createClient()

  async function handleSignUp() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (data.user) {
      // Create profile
      await upsertProfile(supabase, {
        id: data.user.id,
        username,
      })
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSignUp() }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Sign Up</button>
    </form>
  )
}
```

## 📋 Testing Checklist

- [ ] Supabase project created and configured
- [ ] Database tables created with RLS policies
- [ ] Storage bucket created with policies
- [ ] Environment variables set in .env.local
- [ ] Can sign up new users
- [ ] Can sign in existing users
- [ ] Profile created on signup
- [ ] Can upload documents
- [ ] Can view user's documents
- [ ] Can create flags (classes, tags)
- [ ] Can link flags to documents
- [ ] Can search documents
- [ ] Can delete documents
- [ ] RLS prevents unauthorized access
- [ ] Middleware refreshes sessions correctly

## 🚀 Deployment

When deploying to production:

1. Set environment variables in your hosting platform
2. Enable email confirmations in Supabase Auth settings
3. Configure custom SMTP for email (optional)
4. Set up proper CORS policies
5. Enable database backups
6. Monitor API usage and quotas
7. Set up error tracking (e.g., Sentry)

## 📚 Next Steps

1. Implement authentication UI
2. Create profile page
3. Build class management features
4. Add document upload with progress
5. Implement search functionality
6. Add real-time updates with Supabase Realtime
7. Implement collaborative features
8. Add notifications
9. Build analytics dashboard
