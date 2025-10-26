# 🚀 AI Chat Quick Start Guide

## Quick Setup (5 minutes)

### 1. Start AI Service
```powershell
cd C:\Users\Lilly\Vault\Projects\Studygroup\studygroup-ai-service
.\venv\Scripts\Activate.ps1
python main.py
```

Wait for: `"Uvicorn running on http://0.0.0.0:8000"`

### 2. Start Next.js App
```powershell
cd C:\Users\Lilly\Vault\Projects\Studygroup\Studygroup
npm run dev
```

Wait for: `"Ready on http://localhost:3000"`

### 3. Test It!
1. Go to http://localhost:3000
2. Login to your account
3. Go to any class → Documents tab
4. Upload a PDF/PPTX/DOCX file
5. Ask a question in the AI Assistant box
6. Wait ~10 seconds for first answer
7. Ask more questions (should be faster now!)

---

## What's Working

✅ Documents are fetched from `documents` table by `class_id`  
✅ PDF, PPTX, DOCX parsing  
✅ Vector store caching (fast subsequent queries)  
✅ Google Gemini integration  
✅ Conversation history in UI  
✅ Auto cache invalidation on upload/delete  
✅ Source citations with page numbers  

---

## Troubleshooting

### "Unable to connect to AI service"
→ Make sure AI service is running on port 8000

### "No documents found"
→ Upload at least one document to the class

### First query is slow (10-15 seconds)
→ This is normal! Building vector store for the first time

### Questions not being answered well
→ Upload documents with more content  
→ Ask more specific questions

---

## File Structure

### AI Service (Python/FastAPI)
```
studygroup-ai-service/
├── main.py                    # FastAPI endpoints
├── supabase_client.py         # ✅ UPDATED: Queries documents by class_id
├── rag/
│   ├── document_loader.py     # PDF/PPTX/DOCX parsing
│   ├── vector_store.py        # FAISS caching
│   └── chain.py               # Gemini integration
└── vector_stores/             # Cached indexes (auto-created)
```

### Next.js (TypeScript/React)
```
Studygroup/
├── app/actions/
│   ├── ai-query.ts            # ✅ UPDATED: Better error handling
│   └── documents.ts           # ✅ UPDATED: Cache invalidation
├── components/ai/
│   └── ai-assistant.tsx       # ✅ UPDATED: Conversation history
└── lib/supabase/
    └── queries.ts             # ✅ UPDATED: getDocumentsByClassId()
```

---

## Environment Setup

### AI Service `.env`
Already configured at:
`C:\Users\Lilly\Vault\Projects\Studygroup\studygroup-ai-service\.env`

Key variables:
- `SUPABASE_URL`: ✅ Set
- `SUPABASE_SERVICE_KEY`: ✅ Set  
- `GOOGLE_API_KEY`: ✅ Set

### Next.js `.env.local`
Add if not present:
```bash
AI_SERVICE_URL=http://localhost:8000
```

---

## Testing Checklist

- [ ] AI service starts without errors
- [ ] Can visit http://localhost:8000/health
- [ ] Next.js app starts
- [ ] Can login
- [ ] Can upload document to class
- [ ] AI assistant appears
- [ ] Can ask question and get answer
- [ ] Sources show correct file names
- [ ] Second query is faster

---

## Need Help?

See full documentation: `AI_IMPLEMENTATION_COMPLETE.md`

Common issues:
- Port 8000 in use → Kill other processes on that port
- Module errors → Run `pip install -r requirements.txt`
- Build errors → Run `npm install`

---

**That's it! The AI chat is fully implemented and ready to use! 🎉**
