# AI Chat Implementation - Complete Guide

## 🎉 What's Been Implemented

The AI chat system is now fully integrated and will parse documents from the database. Here's what's been set up:

### Backend (AI Service)
1. **Document Fetching**: The AI service now correctly queries the `documents` table by `class_id`
2. **Document Processing**: Supports PDF, PPTX, and DOCX files
3. **Vector Store Caching**: FAISS indexes are cached per class for faster responses
4. **Google Gemini Integration**: Uses Gemini Pro for generating answers

### Frontend (Next.js)
1. **AI Assistant Component**: Enhanced UI with conversation history
2. **Cache Invalidation**: Automatically invalidates AI cache when documents are uploaded/deleted
3. **Class Integration**: AI assistant appears on class documents pages when documents exist
4. **Error Handling**: User-friendly error messages for connection issues

### Database Integration
1. **Query Optimization**: Added `getDocumentsByClassId()` helper function
2. **Document Metadata**: Properly fetches title, file_type, storage_path from documents table
3. **Class Linking**: Uses the `class_id` foreign key to link documents to classes

---

## 🚀 How to Test

### Step 1: Start the AI Service

```powershell
# Navigate to AI service directory
cd C:\Users\Lilly\Vault\Projects\Studygroup\studygroup-ai-service

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start the service
python main.py
```

The service should start on `http://localhost:8000`

You can verify it's running by visiting:
- http://localhost:8000 (API info)
- http://localhost:8000/health (health check)
- http://localhost:8000/docs (interactive API docs)

### Step 2: Start the Next.js App

```powershell
# Navigate to Next.js directory
cd C:\Users\Lilly\Vault\Projects\Studygroup\Studygroup

# Start development server
npm run dev
```

The app should start on `http://localhost:3000`

### Step 3: Test the Complete Flow

1. **Login** to your account
2. **Navigate to a class** (or create one if you don't have any)
3. **Go to the Documents tab** for that class
4. **Upload some documents**:
   - Supported formats: PDF, PPTX, DOCX
   - Upload at least 1-2 documents with actual content
5. **Wait for upload to complete**
6. **The AI Assistant should appear** at the top of the page
7. **Ask a question** about the content in your documents
8. **Wait 10-15 seconds** (first query builds the vector store)
9. **View the answer** with sources and confidence score
10. **Ask follow-up questions** (these should be faster, ~2-5 seconds)

---

## 📝 Example Questions to Test

Depending on what documents you upload, try questions like:

- "What are the main topics covered in these materials?"
- "Can you summarize the key points?"
- "What is [specific concept from your document]?"
- "How does [topic A] relate to [topic B]?"

---

## 🔍 How It Works

### Document Upload Flow

```
1. User uploads document via UI
   ↓
2. uploadDocument() action saves to Supabase Storage
   ↓
3. Document metadata saved to documents table (with class_id)
   ↓
4. invalidateAICache() called for that class
   ↓
5. AI service cache cleared (next query will rebuild)
```

### AI Query Flow

```
1. User asks question in AI Assistant
   ↓
2. queryAI() server action validates user and class
   ↓
3. Request sent to AI service /query endpoint
   ↓
4. AI service fetches documents from Supabase:
   - Query: SELECT * FROM documents WHERE class_id = ?
   - Download files from storage bucket
   ↓
5. Check if vector store cached:
   - If YES: Load from disk (fast)
   - If NO: Build new vector store:
     * Parse documents (extract text)
     * Split into chunks
     * Generate embeddings
     * Create FAISS index
     * Save to disk
   ↓
6. Retrieve relevant chunks for the question
   ↓
7. Send context + question to Google Gemini
   ↓
8. Return answer with sources
   ↓
9. Display in UI with conversation history
```

---

## 🎨 UI Features

### AI Assistant Component
- **Input field**: For asking questions
- **Submit button**: Disabled when loading
- **Loading indicator**: Shows "Thinking..." with animation
- **Conversation history**: Recent questions and answers displayed below
- **Answer display**: Blue card with formatted answer text
- **Sources**: List of documents and page numbers used
- **Confidence score**: Percentage showing AI confidence

### Conditional Display
- AI Assistant only shows if class has documents
- Empty state message shown if no documents uploaded
- Upload form always available

---

## 🐛 Troubleshooting

### AI Service Won't Start

**Error: "Module not found"**
```powershell
# Reinstall dependencies
pip install -r requirements.txt
```

**Error: "SUPABASE_URL not set"**
- Check `.env` file exists in AI service directory
- Verify all variables are set (see `.env.example`)

### "Unable to connect to AI service"

**Check if AI service is running:**
```powershell
# Visit in browser
http://localhost:8000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "supabase_connected": true,
  "gemini_configured": true,
  "vector_store_path": "./vector_stores"
}
```

**If not running:**
- Make sure you ran `python main.py` in AI service directory
- Check terminal for error messages
- Verify port 8000 is not in use

### "No documents found for this class"

**Verify documents uploaded:**
1. Check Supabase dashboard → Storage → documents bucket
2. Check documents table → verify `class_id` is set correctly
3. Try uploading a new document

**Check console logs:**
- Next.js terminal: Should show upload success
- AI service terminal: Should show "Found X documents for class..."

### Slow First Query

**This is normal!** First query for a class takes 10-15 seconds because:
1. Downloads documents from Supabase
2. Parses and extracts text
3. Generates embeddings
4. Builds FAISS vector store
5. Saves cache to disk

**Subsequent queries** should be much faster (2-5 seconds) because vector store is cached.

**To force rebuild:**
```powershell
# In AI service directory
Remove-Item -Recurse -Force .\vector_stores\*
```

### Poor Quality Answers

**Possible causes:**
1. **Documents have little text**: Upload documents with more content
2. **Question too vague**: Be more specific
3. **Topic not in documents**: AI can only answer based on uploaded materials

**To improve:**
- Upload more comprehensive documents
- Ask more specific questions
- Check that documents actually contain relevant information

---

## 📊 API Endpoints Reference

### POST /query
Query the AI about class documents

**Request:**
```json
{
  "class_id": "abc-123",
  "question": "What is quantum entanglement?",
  "user_id": "user-456" // optional
}
```

**Response:**
```json
{
  "answer": "Quantum entanglement is...",
  "sources": [
    {
      "file_name": "lecture_notes.pdf",
      "page": 5,
      "text_snippet": "..."
    }
  ],
  "confidence": 0.85
}
```

### POST /invalidate-cache/{class_id}
Clear cached vector store for a class

**Response:**
```json
{
  "status": "success",
  "message": "Cache invalidated for class abc-123"
}
```

### GET /health
Health check

**Response:**
```json
{
  "status": "healthy",
  "supabase_connected": true,
  "gemini_configured": true,
  "vector_store_path": "./vector_stores"
}
```

---

## 🔐 Environment Variables

### AI Service (.env)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOi...  # Service role key!
GOOGLE_API_KEY=AIzaSy...            # Get from Google AI Studio
VECTOR_STORE_PATH=./vector_stores
CACHE_ENABLED=true
LOG_LEVEL=INFO
LLM_TEMPERATURE=0.7
MAX_TOKENS=500
```

### Next.js App (.env.local)
```bash
AI_SERVICE_URL=http://localhost:8000  # Or production URL
```

---

## 📈 Performance Tips

### For Faster Responses:
- Keep `CACHE_ENABLED=true`
- Don't upload unnecessarily large documents
- Use PDF when possible (fastest to parse)

### For Better Accuracy:
- Upload comprehensive, well-structured documents
- Increase `MAX_TOKENS` for longer answers
- Lower `LLM_TEMPERATURE` (0.3-0.5) for more factual answers
- Higher `LLM_TEMPERATURE` (0.7-0.9) for more creative answers

---

## 🎯 What's Next?

Potential enhancements:
- [ ] Streaming responses (show answer as it's generated)
- [ ] Conversation memory (follow-up questions)
- [ ] Citation links (click source to view document)
- [ ] Highlight relevant sections in documents
- [ ] Support for images and tables
- [ ] Multi-class queries (search across multiple classes)
- [ ] Answer quality feedback (thumbs up/down)
- [ ] Export conversation history

---

## 📚 Code Files Changed

### AI Service
- `supabase_client.py`: Updated document fetching logic
- `main.py`: Main FastAPI app (already implemented)
- `rag/document_loader.py`: Document parsing (already implemented)
- `rag/vector_store.py`: FAISS vector store (already implemented)
- `rag/chain.py`: Gemini integration (already implemented)

### Next.js App
- `app/actions/ai-query.ts`: Added class validation and better error handling
- `app/actions/documents.ts`: Added cache invalidation on upload/delete
- `lib/supabase/queries.ts`: Added `getDocumentsByClassId()` helper
- `components/ai/ai-assistant.tsx`: Enhanced UI with conversation history
- `app/(dashboard)/classes/[id]/documents/page.tsx`: Integrated AI assistant

---

## ✅ Testing Checklist

- [ ] AI service starts without errors
- [ ] Health endpoint returns healthy status
- [ ] Can upload document to class
- [ ] AI assistant appears after upload
- [ ] Can ask question and get answer
- [ ] Sources are displayed correctly
- [ ] Second query is faster than first
- [ ] Upload new document invalidates cache
- [ ] Delete document invalidates cache
- [ ] Error messages are user-friendly
- [ ] Works with PDF files
- [ ] Works with PPTX files
- [ ] Works with DOCX files

---

## 🎉 You're Ready!

The AI chat system is fully implemented and ready to test. Just follow the steps above and you should be able to:

1. ✅ Upload documents to a class
2. ✅ Ask questions about those documents
3. ✅ Get AI-generated answers with sources
4. ✅ See conversation history
5. ✅ Have fast cached responses

Happy testing! 🚀
