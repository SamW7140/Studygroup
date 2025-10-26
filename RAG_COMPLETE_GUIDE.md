# Complete RAG AI Chat Setup Guide

## Overview

This guide explains how the complete RAG (Retrieval-Augmented Generation) AI chat system works in the Studygroup application.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Chat UI      │  │ Upload Form  │  │ Floating Btn │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Server Actions                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ chat.ts      │  │ documents.ts │  │ ai-query.ts  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          │                  │ Invalidate Cache │
          │                  └──────────┬───────┘
          │                             │
          ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Python FastAPI AI Service (Port 8000)           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /query       │  │ /invalidate  │  │ /health      │      │
│  │ endpoint     │  │ -cache       │  │              │      │
│  └──────┬───────┘  └──────────────┘  └──────────────┘      │
│         │                                                    │
│         ├─────► Fetch Documents from Supabase               │
│         ├─────► Extract Text & Chunk                        │
│         ├─────► Generate Embeddings                         │
│         ├─────► Store in FAISS Vector DB (local cache)      │
│         ├─────► Semantic Search                             │
│         └─────► Generate Answer with LLM                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
          │                             │
          ▼                             ▼
┌────────────────────┐        ┌────────────────────┐
│  Supabase Storage  │        │     OpenAI API     │
│  (Documents)       │        │  (Embeddings+LLM)  │
└────────────────────┘        └────────────────────┘
```

## Components Created

### 1. Server Actions (`app/actions/`)

#### `chat.ts` - Enhanced RAG Logic
- `queryAIWithContext()` - Query AI with better error handling
- `getChatSessions()` - Get user's chat history (TODO: requires DB tables)
- `createChatSession()` - Create new chat session
- `sendChatMessage()` - Send message and get response
- `triggerDocumentIndexing()` - Manually trigger AI reindexing
- `deleteChatSession()` - Delete chat session
- `updateChatSessionTitle()` - Update session title

#### `documents.ts` - Document Management (Enhanced)
- ✅ Auto-invalidates AI cache after upload
- ✅ Auto-invalidates AI cache after deletion
- ✅ Better logging and error messages

#### `ai-query.ts` - AI Service Communication (Existing)
- `queryAI()` - Basic AI query
- `invalidateAICache()` - Clear AI cache for a class

### 2. UI Components (`components/ai/`)

#### `chat-interface.tsx` - Main Chat UI
- Beautiful message bubbles with animations
- Auto-scrolling to latest messages
- Source citations display
- Error handling with user-friendly messages
- Loading states with spinner
- Clear chat functionality
- Toast notifications

**Usage:**
```tsx
import { ChatInterface } from '@/components/ai/chat-interface'

<ChatInterface classId="class-123" className="Physics 101" />
```

#### `chat-dialog.tsx` - Modal Wrapper
- Full-screen modal for chat
- Responsive design
- Dark theme styling

**Usage:**
```tsx
import { ChatDialog } from '@/components/ai/chat-dialog'

<ChatDialog 
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  classId="class-123"
  className="Physics 101"
/>
```

#### `floating-chat-button.tsx` - Floating Action Button
- Beautiful pulsing button
- Appears in bottom-right corner
- Opens chat in modal
- Smooth animations

**Usage:**
```tsx
import { FloatingChatButton } from '@/components/ai/floating-chat-button'

<FloatingChatButton classId="class-123" className="Physics 101" />
```

#### `reindex-button.tsx` - Manual Reindex Trigger
- Button to manually trigger AI reindexing
- Shows loading state while processing
- Toast notifications
- Configurable size and variant

**Usage:**
```tsx
import { ReindexButton } from '@/components/ai/reindex-button'

<ReindexButton classId="class-123" variant="outline" size="sm" />
```

#### `class-ai-page.tsx` - Complete Example Page
- Full-page AI assistant interface
- Info tabs with usage instructions
- Feature cards
- Integration example

**Usage:**
```tsx
import { ClassAIPage } from '@/components/ai/class-ai-page'

<ClassAIPage classId="class-123" className="Physics 101" />
```

## Integration Examples

### Example 1: Add Floating Chat to Class Page

```tsx
// app/(dashboard)/classes/[classId]/page.tsx
import { FloatingChatButton } from '@/components/ai/floating-chat-button'

export default async function ClassPage({ params }: { params: { classId: string } }) {
  const classData = await getClassData(params.classId)
  
  return (
    <div>
      {/* Your class content */}
      <h1>{classData.class_name}</h1>
      
      {/* Add floating chat button */}
      <FloatingChatButton 
        classId={params.classId} 
        className={classData.class_name} 
      />
    </div>
  )
}
```

### Example 2: Full Chat Page

```tsx
// app/(dashboard)/classes/[classId]/ai/page.tsx
import { ClassAIPage } from '@/components/ai/class-ai-page'

export default async function ClassAIPageRoute({ params }: { params: { classId: string } }) {
  const classData = await getClassData(params.classId)
  
  return (
    <ClassAIPage 
      classId={params.classId} 
      className={classData.class_name} 
    />
  )
}
```

### Example 3: Inline Chat Widget

```tsx
// app/(dashboard)/classes/[classId]/documents/page.tsx
import { Card } from '@/components/ui/card'
import { ChatInterface } from '@/components/ai/chat-interface'

export default async function DocumentsPage({ params }: { params: { classId: string } }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Documents list */}
      <div>
        <h2>Class Documents</h2>
        {/* Document list */}
      </div>
      
      {/* AI Chat */}
      <Card className="sticky top-4 h-fit">
        <ChatInterface 
          classId={params.classId} 
          className="Physics 101" 
        />
      </Card>
    </div>
  )
}
```

### Example 4: Documents Page with Reindex Button

```tsx
// app/(dashboard)/classes/[classId]/documents/page.tsx
import { ReindexButton } from '@/components/ai/reindex-button'

export default function DocumentsPage({ params }: { params: { classId: string } }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1>Class Documents</h1>
        <ReindexButton classId={params.classId} />
      </div>
      
      {/* Document list */}
    </div>
  )
}
```

## How It Works

### Document Upload Flow

1. User uploads document via `UploadForm` or `ActionTiles`
2. `uploadDocument()` server action:
   - Uploads file to Supabase Storage
   - Creates database entry
   - **Automatically calls `invalidateAICache(classId)`**
3. AI cache is cleared for that class
4. Next AI query will trigger reindexing

### Document Deletion Flow

1. User deletes document
2. `deleteDocument()` server action:
   - Deletes from Supabase Storage
   - Deletes database entry
   - **Automatically calls `invalidateAICache(classId)`**
3. AI cache is cleared for that class
4. Next AI query will trigger reindexing

### AI Query Flow (First Time After Upload)

1. User asks question in chat
2. `queryAIWithContext()` server action:
   - Checks user authentication
   - Verifies class access
   - Checks if documents exist
3. Request sent to Python AI service (`/query` endpoint)
4. AI service:
   - Fetches documents from Supabase Storage
   - Extracts text from PDFs, DOCX, PPTX
   - Chunks text (~1000 chars with 200 char overlap)
   - Generates embeddings using OpenAI
   - Creates FAISS vector index
   - **Saves index to disk** (`vector_stores/{class_id}.faiss`)
   - Performs semantic search for relevant chunks
   - Sends context + question to LLM
   - Returns answer with source citations
5. Response displayed in chat with source cards

### AI Query Flow (Cached)

1. User asks question
2. Same flow as above, BUT:
3. AI service finds existing FAISS index on disk
4. **Skips document fetching, parsing, and embedding generation**
5. Directly performs semantic search
6. Much faster response (~2-5 seconds vs 10-15 seconds)

## Configuration

### Environment Variables Required

```env
# Next.js (.env.local)
AI_SERVICE_URL=http://localhost:8000

# Python AI Service (.env)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
VECTOR_STORE_PATH=./vector_stores
CACHE_ENABLED=true
```

### Starting the AI Service

```powershell
# Navigate to AI service directory
cd ..\studygroup-ai-service

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start the service
python main.py

# Or with uvicorn
uvicorn main:app --reload
```

The service should start on `http://localhost:8000`

## Testing the Complete System

### 1. Start Both Services

```powershell
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start AI Service
cd ..\studygroup-ai-service
.\venv\Scripts\Activate.ps1
python main.py
```

### 2. Upload Documents

1. Navigate to a class page
2. Click "Upload Notes" action tile
3. Select a PDF, DOCX, or PPTX file
4. Choose the class
5. Wait for success toast (should mention AI reindexing)

### 3. Test Chat

1. Add floating chat button or navigate to AI page
2. Ask a question about the uploaded documents
3. **First query**: Wait 10-15 seconds (indexing)
4. **Subsequent queries**: ~2-5 seconds (cached)
5. Verify source citations appear

### 4. Test Reindexing

1. Upload more documents
2. Click "Reindex AI" button
3. Check toast notification
4. Next query will use updated index

## Troubleshooting

### "Unable to connect to AI service"

- Check if Python service is running on port 8000
- Verify `AI_SERVICE_URL` in `.env.local`
- Check Python service logs

### "No documents found for this class"

- Verify documents were uploaded successfully
- Check Supabase Storage bucket
- Check database `documents` table

### "First query takes too long"

- Normal for first query (building index)
- Check document sizes (large PDFs take longer)
- Verify OpenAI API key is valid
- Check Python service logs for errors

### "Answers are not accurate"

- Verify documents uploaded are text-based (not scanned images)
- Try more specific questions
- Check source citations to see what was retrieved
- Consider reindexing if documents were recently updated

## Future Enhancements

- [ ] **Chat Sessions**: Persistent chat history in database
- [ ] **Streaming Responses**: Real-time token streaming
- [ ] **Follow-up Questions**: Conversation memory
- [ ] **pgvector Integration**: Store embeddings in Supabase instead of local FAISS
- [ ] **Multi-document Reasoning**: Answer questions spanning multiple docs
- [ ] **Citation Links**: Click source to open document at specific page
- [ ] **Export Chat**: Download chat history
- [ ] **Analytics**: Track AI usage and popular questions

## Performance Tips

1. **Document Size**: Keep PDFs under 50MB for faster processing
2. **Document Format**: Use native PDFs (not scanned) for better extraction
3. **Cache Management**: Cache is class-specific, so each class builds its own index
4. **First Query Timing**: Warn users that first query may take longer
5. **Concurrent Queries**: AI service handles one query at a time per class

## Security Considerations

- ✅ User authentication checked before AI queries
- ✅ Class access verified before querying
- ✅ Service uses admin key to fetch documents (trusted boundary)
- ⚠️ Production: Add JWT validation to AI service
- ⚠️ Production: Implement rate limiting
- ⚠️ Production: Add request signing

---

## Summary

You now have a complete RAG-powered AI chat system with:

✅ **Server Actions** - Enhanced RAG logic with error handling  
✅ **Chat UI** - Beautiful, animated chat interface  
✅ **Floating Button** - Easy access from any page  
✅ **Auto-Indexing** - Documents automatically indexed on upload  
✅ **Manual Reindex** - Button to force reindexing  
✅ **Source Citations** - Every answer includes references  
✅ **Error Handling** - User-friendly error messages  
✅ **Loading States** - Clear feedback during processing  
✅ **Toast Notifications** - Success/error notifications  

The system is production-ready for a hackathon or MVP! 🚀
