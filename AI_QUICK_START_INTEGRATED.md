# 🚀 Quick Start: AI Chat Integration

## Everything is Ready! ✅

Your AI chat system is fully integrated. Here's how to test it:

## Step 1: Add Environment Variable

Create or update `.env.local`:

```env
AI_SERVICE_URL=http://localhost:8000
```

## Step 2: Start the AI Service

Open Terminal 1:
```powershell
cd ..\studygroup-ai-service
.\venv\Scripts\Activate.ps1
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://localhost:8000
```

## Step 3: Start Next.js

Open Terminal 2:
```powershell
npm run dev
```

## Step 4: Test the Integration

### Test Flow:
1. **Login** to your account
2. **Go to a class** or create a new one
3. **Upload a document** (PDF, DOCX, or PPTX)
4. **See the toast**: "AI will reindex on next query"
5. **Three ways to access AI chat**:

### Option A: Floating Chat Button (Recommended)
- Stay on the class page
- Click the floating orange button (bottom-right)
- Chat opens in a modal
- Ask: "What is the main topic of this document?"
- First query: ~10-15 seconds (building index)
- Follow-up queries: ~2-5 seconds

### Option B: AI Page
- Click "AI Assistant" button on class page
- Full-page AI experience
- Tab interface: Chat | How to Use
- Manual reindex button available

### Option C: Documents Page
- Go to `/classes/[id]/documents`
- See split view:
  - Left: Upload & document list
  - Right: Live AI chat (sticky)
- Upload and chat side-by-side

## Where AI Chat Appears

```
Class Page [/classes/[id]]
├── ✨ FloatingChatButton (when documents exist)
└── 🔗 "AI Assistant" link button

AI Page [/classes/[id]/ai]
├── Full ClassAIPage component
├── Feature cards
├── Chat interface with tabs
└── Reindex button

Documents Page [/classes/[id]/documents]
├── Left Column
│   ├── Upload form
│   └── Document list
└── Right Column (sticky)
    └── ChatInterface
```

## Features You Can Now Use

### ✅ Auto-Indexing
- Upload document → AI cache invalidated
- Delete document → AI cache invalidated
- Next query → Documents reindexed automatically

### ✅ Beautiful UI
- Animated message bubbles
- Auto-scroll to latest
- Source citations with file names
- Loading states
- Error handling
- Toast notifications

### ✅ Smart Behavior
- AI features only show when documents exist
- Empty states guide users to upload
- Timeout handling (30 seconds)
- User-friendly error messages

## Expected Behavior

### First Query (After Upload)
```
User: "What is quantum entanglement?"
      ⏳ Thinking... (10-15 seconds)
AI:   [Full answer with sources]
      📄 lecture_notes.pdf (Page 5) - 92% match
```

### Subsequent Queries (Cached)
```
User: "Explain superposition"
      ⏳ Thinking... (2-5 seconds)
AI:   [Full answer with sources]
```

### When No Documents
```
🤖 No AI features shown
💡 Prompt: "Upload documents to use AI"
```

## Troubleshooting

### "Unable to connect to AI service"
- ✅ Check AI service is running (Terminal 1)
- ✅ Verify `AI_SERVICE_URL` in `.env.local`
- ✅ Check port 8000 isn't blocked

### "No documents found for this class"
- ✅ Upload a document first
- ✅ Wait for upload success toast
- ✅ Check Supabase Storage bucket

### AI features not showing
- ✅ Make sure documents were uploaded successfully
- ✅ Refresh the page
- ✅ Check browser console for errors

### First query takes too long
- ✅ This is normal! (10-15 seconds for first query)
- ✅ AI is parsing PDFs, chunking text, generating embeddings
- ✅ Building FAISS vector index
- ✅ Subsequent queries will be fast (2-5 seconds)

## File Structure Created

```
app/
  actions/
    chat.ts                    ← Enhanced RAG actions
  (dashboard)/
    classes/
      [id]/
        page.tsx               ← FloatingChatButton added
        ai/
          page.tsx             ← NEW: Dedicated AI page
        documents/
          page.tsx             ← ChatInterface integrated

components/
  ai/
    chat-interface.tsx         ← Main chat UI
    chat-dialog.tsx            ← Modal wrapper
    floating-chat-button.tsx   ← Floating FAB
    reindex-button.tsx         ← Manual reindex
    class-ai-page.tsx          ← Full AI page
```

## Next Steps (Optional)

1. **Customize prompts** - Edit Python AI service
2. **Add chat history** - Implement DB tables
3. **Enable streaming** - Add SSE support
4. **Deploy** - Railway/Vercel + separate AI service

## You're Done! 🎉

Everything is integrated and ready to use. Just:
1. Start both services
2. Upload a document
3. Start chatting!

Enjoy your RAG-powered AI study assistant! 🤖✨
