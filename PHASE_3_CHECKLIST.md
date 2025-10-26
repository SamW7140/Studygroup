---
modified: 2025-10-25
---
# Phase 3 Quick-Start Checklist

**Start Date:** ___________  
**Target Completion:** ___________  
**Current Status:** 🟡 Not Started

---

## Day 1: Foundation (3-4 hours)

### Morning Session
- [ ] Create `studygroup-ai-service` folder <!-- task-id: mh6u97y0 -->
- [ ] Set up Python virtual environment <!-- task-id: mh6u98nr -->
- [ ] Create `requirements.txt` and install dependencies <!-- task-id: mh6u98wz -->
- [ ] Create `.env` file with Supabase credentials <!-- task-id: mh6u9990 -->
- [ ] Test Python environment (run `python --version`) <!-- task-id: mh6u99s8 -->

### Afternoon Session
- [ ] Create `main.py` with FastAPI skeleton <!-- task-id: mh6u9a2y -->
- [ ] Run server: `uvicorn main:app --reload` <!-- task-id: mh6u9k1m -->
- [ ] Visit `http://localhost:8000/docs` - see Swagger UI <!-- task-id: mh6u9kbu -->
- [ ] Test `/health` endpoint <!-- task-id: mh6u9sqx -->
- [ ] Test `/query` endpoint (should return mock data) <!-- task-id: mh6u9acx -->

**✅ Day 1 Success Criteria:** Can call mock `/query` endpoint and get response

---

## Day 2: Data Connection (4-5 hours)

### Morning Session
- [ ] Create `supabase_client.py` <!-- task-id: mh6u9b5g -->
- [ ] Test Supabase connection with health check <!-- task-id: mh6u9bo7 -->
- [ ] Query documents table successfully <!-- task-id: mh6u9btr -->
- [ ] Verify RLS policies allow service role access <!-- task-id: mh6u9km6 -->

### Afternoon Session
- [ ] Create `rag/document_loader.py`
- [ ] Download a test PDF from Supabase storage <!-- task-id: mh6u9c3x -->
- [ ] Extract text from PDF successfully <!-- task-id: mh6u9clk -->
- [ ] Test with PPTX file <!-- task-id: mh6u9cqy -->
- [ ] Handle errors gracefully <!-- task-id: mh6u9cx4 -->

**✅ Day 2 Success Criteria:** Can fetch and parse real documents from Supabase

---

## Day 3: Vector Store (4-5 hours)

### Morning Session
- [ ] Create `rag/vector_store.py` <!-- task-id: mh6u9l93 -->
- [ ] Test text splitting with sample document
- [ ] Generate embeddings (wait for model download ~400MB) <!-- task-id: mh6u9dq5 -->
- [ ] Create FAISS index from test data <!-- task-id: mh6u9dvf -->

### Afternoon Session
- [ ] Implement caching (save/load from disk) <!-- task-id: mh6u9e5m -->
- [ ] Test cache with multiple queries <!-- task-id: mh6u9ehy -->
- [ ] Verify cache invalidation works <!-- task-id: mh6u9esi -->
- [ ] Optimize chunk size and overlap <!-- task-id: mh6u9exo -->

**✅ Day 3 Success Criteria:** Vector store creates and loads from cache successfully

---

## Day 4: AI Integration (4-5 hours)

### Morning Session
- [ ] Get OpenAI API key (or set up local LLM) <!-- task-id: mh6u9ng3 -->
- [ ] Create `rag/chain.py` <!-- task-id: mh6u9ffu -->
- [ ] Test retrieval (query vector store, get relevant docs) <!-- task-id: mh6u9fqn -->
- [ ] Test LLM call (generate answer from context) <!-- task-id: mh6u9g0u -->

### Afternoon Session
- [ ] Wire full pipeline in `main.py` <!-- task-id: mh6u9gjy -->
- [ ] Test end-to-end: question → answer <!-- task-id: mh6u9od6 -->
- [ ] Verify sources are returned correctly <!-- task-id: mh6u9oqc -->
- [ ] Tune prompt template for better answers <!-- task-id: mh6u9gp4 -->

**✅ Day 4 Success Criteria:** AI returns accurate answers with source citations

---

## Day 5: Integration & Polish (3-4 hours)

### Morning Session
- [ ] Create Next.js Server Action (`app/actions/ai-query.ts`) <!-- task-id: mh6u9hfx -->
- [ ] Test calling AI service from Next.js <!-- task-id: mh6u9hp5 -->
- [ ] Add user authorization check <!-- task-id: mh6u9q0e -->
- [ ] Handle errors in frontend <!-- task-id: mh6u9ian -->

### Afternoon Session
- [ ] Create simple UI component to test AI <!-- task-id: mh6u9il2 -->
- [ ] Test with multiple classes <!-- task-id: mh6u9j1h -->
- [ ] Verify caching performance <!-- task-id: mh6u9j99 -->
- [ ] Add loading states and error messages <!-- task-id: mh6u9jjy -->

**✅ Day 5 Success Criteria:** Frontend can ask questions and display AI answers

---

## Testing Checklist

### Functional Tests
- [ ] Query with no documents → graceful error <!-- task-id: mh6u9slm -->
- [ ] Query with 1 document → gets answer <!-- task-id: mh6ua364 -->
- [ ] Query with multiple documents → cites sources <!-- task-id: mh6u9uxn -->
- [ ] Query with irrelevant question → "I don't know" <!-- task-id: mh6u9vks -->
- [ ] Second query to same class → uses cache (faster) <!-- task-id: mh6u9vvd -->

### Document Types
- [ ] PDF document works <!-- task-id: mh6u9wcs -->
- [ ] PPTX document works <!-- task-id: mh6uq565 -->
- [ ] DOCX document works <!-- task-id: mh6u9wqe -->
- [ ] Mixed document types work together <!-- task-id: mh6u9wv6 -->

### Edge Cases
- [ ] Very long question (500+ characters) <!-- task-id: mh6v3fn8 -->
- [ ] Question with special characters
- [ ] Empty class (no documents)
- [ ] Malformed PDF (corrupted file)
- [ ] Network timeout handling

### Performance
- [ ] First query to class < 15 seconds
- [ ] Cached query < 5 seconds
- [ ] Memory usage acceptable
- [ ] No memory leaks after 10+ queries

---

## Common Issues & Solutions

### "ModuleNotFoundError"
**Solution:** Activate virtual environment
```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### "Supabase connection failed"
**Solution:** Check `.env` file
- Use SERVICE_ROLE_KEY (not anon key)
- Verify URL has no trailing slash

### "Out of memory"
**Solution:** Reduce chunk size in `vector_store.py`
```python
chunk_size=500,  # Instead of 1000
chunk_overlap=100  # Instead of 200
```

### "Model download too slow"
**Solution:** Download embeddings model manually
```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
```

---

## Quick Commands Reference

### Start AI Service
```powershell
cd studygroup-ai-service
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

### Test Endpoint
```powershell
curl -X POST http://localhost:8000/query `
  -H "Content-Type: application/json" `
  -d '{"class_id":"test-class","question":"What is the main topic?"}'
```

### Clear Cache
```powershell
Remove-Item -Recurse -Force .\vector_stores\*
```

### View Logs
Server logs appear in terminal running uvicorn

---

## Next Steps After Phase 3

1. **Add streaming responses** (show answer as it's generated)
2. **Implement follow-up questions** (conversation memory)
3. **Add document upload trigger** (auto-invalidate cache)
4. **Deploy to Railway/Render** (production hosting)
5. **Add usage analytics** (track popular questions)

---

**Questions or Stuck?**
- Check `PHASE_3_IMPLEMENTATION_PLAN.md` for detailed code
- Review FastAPI docs: https://fastapi.tiangolo.com
- Review LangChain docs: https://python.langchain.com

**Remember:** Progress over perfection! Get it working first, optimize later. 🚀
