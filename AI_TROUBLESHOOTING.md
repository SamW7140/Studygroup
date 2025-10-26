# AI Service Diagnostic Guide

## Issue: Getting Generic "I can help you understand the course materials" Response

This means the AI service is responding but not retrieving your documents. Here's how to fix it:

## Step 1: Check AI Service is Running

In a terminal:
```powershell
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "healthy",
  "supabase_connected": true,
  "vector_store_path": "./vector_stores"
}
```

## Step 2: Check Python Service Logs

When you start the AI service (`python main.py`), look for these messages when you query:

**Good logs (working):**
```
INFO: Fetching documents for class: your-class-id
INFO: Found X documents for class
INFO: Loading/creating vector store for class
INFO: Retrieved Y relevant chunks
```

**Bad logs (problem):**
```
WARNING: No documents found for class: your-class-id
ERROR: Failed to fetch documents
ERROR: Supabase connection failed
```

## Step 3: Check Environment Variables

In `studygroup-ai-service/.env`, verify you have:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...  (long key starting with eyJ)
OPENAI_API_KEY=sk-...
```

**Critical:** Use the **SERVICE_ROLE_KEY** (not anon key!)

## Step 4: Test Direct API Call

Test the AI service directly:

```powershell
$body = @{
    class_id = "your-actual-class-id-here"
    question = "What is this document about?"
    user_id = "test-user"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/query" -Method POST -Body $body -ContentType "application/json"
```

### Expected Response (Working):
```json
{
  "answer": "Based on the documents, [actual answer about your content]...",
  "sources": [
    {
      "file_name": "your-document.pdf",
      "page": 5,
      "relevance_score": 0.92
    }
  ],
  "confidence": 0.85
}
```

### Problem Response (Not Working):
```json
{
  "answer": "I can help you understand the course materials. What would you like to know?",
  "sources": [],
  "confidence": null
}
```

## Step 5: Common Fixes

### Fix 1: Supabase Service Key
The AI service needs admin access to read documents. In Supabase dashboard:
1. Go to Settings → API
2. Copy the **service_role** key (not anon key!)
3. Update `.env` in `studygroup-ai-service/`

### Fix 2: Check Documents Table
The Python service looks for documents in the `documents` table:

```python
# It queries: SELECT * FROM documents WHERE classroom_id = 'your-class-id'
```

Make sure your documents have `classroom_id` set (not `class_id`).

### Fix 3: Storage Bucket Permissions
Documents must be readable by the service role:

In Supabase → Storage → documents bucket:
- Make sure "Allow service role to bypass RLS" is enabled
- Or add RLS policy allowing service role to read

### Fix 4: Clear Vector Cache
Sometimes the cache gets stale:

```powershell
cd ..\studygroup-ai-service
Remove-Item -Recurse -Force .\vector_stores\*
```

Then restart AI service and query again (will rebuild index).

## Step 6: Debug with Better Logging

In the Python service, add this to see what's happening:

```python
# In main.py or wherever the query endpoint is
print(f"Received query for class: {request.class_id}")
print(f"Fetching documents from Supabase...")
documents = fetch_documents(request.class_id)
print(f"Found {len(documents)} documents")
for doc in documents:
    print(f"  - {doc['title']} ({doc['file_type']})")
```

## Quick Test Checklist

- [ ] AI service running on port 8000
- [ ] `/health` endpoint returns `supabase_connected: true`
- [ ] `.env` has correct `SUPABASE_SERVICE_KEY`
- [ ] `.env` has valid `OPENAI_API_KEY`
- [ ] Documents exist in Supabase `documents` table
- [ ] Documents have `classroom_id` matching your class
- [ ] Storage bucket allows service role access
- [ ] Test direct API call shows real content (not generic message)
- [ ] Python logs show "Found X documents"

## If Still Not Working

Check these in Python service logs:

### Problem: "No documents found"
```
✅ Check: documents.classroom_id = your-class-id
✅ Check: Documents uploaded successfully
✅ Check: Supabase service key is correct
```

### Problem: "Failed to fetch from storage"
```
✅ Check: Storage bucket RLS allows service role
✅ Check: storage_path in documents table is correct
✅ Check: Files actually exist in Supabase Storage
```

### Problem: Generic AI response despite finding docs
```
✅ Check: OpenAI API key is valid
✅ Check: Documents are text-based (not images)
✅ Check: Vector store was built successfully
✅ Clear cache and rebuild: rm -rf vector_stores/*
```

## Expected First Query Flow

1. User asks question in UI
2. Next.js calls `/query` on Python service
3. Python service:
   - Connects to Supabase ✅
   - Queries: `SELECT * FROM documents WHERE classroom_id = ?` ✅
   - Downloads PDFs from Storage ✅
   - Parses text from PDFs ✅
   - Chunks text (~1000 chars) ✅
   - Generates embeddings (OpenAI) ✅
   - Creates FAISS vector index ✅
   - Saves to `vector_stores/{class_id}.faiss` ✅
   - Searches for relevant chunks ✅
   - Sends chunks + question to GPT ✅
   - Returns answer with sources ✅
4. UI displays answer

If any step fails, you'll see the generic response.

## Next Steps

1. Check AI service logs when you query
2. Verify environment variables
3. Test direct API call
4. Check documents exist in Supabase
5. Clear cache and try again

The most common issue is using the wrong Supabase key or documents not having the correct `classroom_id` field.
