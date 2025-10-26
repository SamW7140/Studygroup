# Studygroup AI Service

> **Phase 3:** RAG-powered Q&A Microservice for Studygroup Application

This is a Python FastAPI service that provides AI-driven answers to student questions based on class documents stored in Supabase. It uses Retrieval-Augmented Generation (RAG) with LangChain, FAISS vector store, and OpenAI.

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Next.js App    │  (Frontend + Server Actions)
└────────┬────────┘
         │ HTTP Request
         ▼
┌─────────────────┐
│  FastAPI Service│  (This Service - Port 8000)
└────────┬────────┘
         │
         ├──────────────┐
         ▼              ▼
┌─────────────┐  ┌──────────────┐
│  Supabase   │  │   OpenAI     │
│  Database   │  │   API        │
│  + Storage  │  │              │
└─────────────┘  └──────────────┘
         │
         ▼
┌─────────────────┐
│ FAISS Vector DB │  (Local Cache)
└─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9 or higher
- Supabase project with documents uploaded
- OpenAI API key (or local LLM setup)

### Setup

1. **Create and activate virtual environment:**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1  # Windows PowerShell
   ```

2. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   ```powershell
   # Copy template
   cp .env.example .env
   
   # Edit .env with your credentials
   # - SUPABASE_URL
   # - SUPABASE_SERVICE_KEY
   # - OPENAI_API_KEY
   ```

4. **Run the server:**
   ```powershell
   uvicorn main:app --reload
   ```

5. **Test the API:**
   - Open http://localhost:8000/docs
   - Try the `/health` endpoint
   - Test `/query` with sample data

---

## 📁 Project Structure

```
studygroup-ai-service/
├── main.py                   # FastAPI app & endpoints
├── supabase_client.py        # Supabase integration
├── config.py                 # Configuration management
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables (gitignored)
├── .env.example              # Template for .env
├── README.md                 # This file
│
├── rag/                      # RAG pipeline modules
│   ├── __init__.py
│   ├── document_loader.py    # PDF/PPTX/DOCX parsing
│   ├── embeddings.py         # Text embedding generation
│   ├── vector_store.py       # FAISS vector store management
│   └── chain.py              # LangChain RAG chain
│
├── utils/                    # Utility functions
│   ├── __init__.py
│   └── logging.py            # Logging configuration
│
├── vector_stores/            # Cached FAISS indexes (gitignored)
│   └── {class_id}.faiss
│
└── tests/                    # Unit tests
    └── test_api.py
```

---

## 🔌 API Endpoints

### `GET /health`
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "supabase_connected": true,
  "vector_store_path": "./vector_stores"
}
```

---

### `POST /query`
Main endpoint: Ask questions about class documents.

**Request:**
```json
{
  "class_id": "quantum-physics-101",
  "question": "What is quantum entanglement?",
  "user_id": "optional-user-id"
}
```

**Response:**
```json
{
  "answer": "Quantum entanglement is a phenomenon where...",
  "sources": [
    {
      "file_name": "lecture_notes.pdf",
      "page": 5,
      "relevance_score": 0.92
    }
  ],
  "confidence": 0.85
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid request (missing fields, bad format)
- `404`: Class not found or no documents
- `500`: Server error

---

### `POST /invalidate-cache/{class_id}`
Clear the vector store cache for a specific class.

**Use Case:** Call this when documents are added/updated/deleted for a class.

**Response:**
```json
{
  "status": "success",
  "message": "Cache cleared for quantum-physics-101"
}
```

---

## 🧠 How the RAG Pipeline Works

1. **User asks question** via Next.js frontend
2. **Next.js Server Action** validates user authorization
3. **FastAPI receives request** with `class_id` and `question`
4. **Fetch documents** from Supabase database and storage
5. **Check cache**: Does vector store exist for this class?
   - **Yes** → Load from disk (fast)
   - **No** → Create new vector store:
     - Parse documents (PDF/PPTX/DOCX)
     - Split into chunks (~1000 chars)
     - Generate embeddings
     - Build FAISS index
     - Save to disk
6. **Retrieve context**: Find most relevant chunks for the question
7. **Generate answer**: Send context + question to LLM
8. **Return response** with answer and source citations

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Service role key (admin access) | `eyJhbGc...` |
| `OPENAI_API_KEY` | OpenAI API key for LLM | `sk-...` |
| `VECTOR_STORE_PATH` | Directory for cached indexes | `./vector_stores` |
| `CACHE_ENABLED` | Enable/disable caching | `true` |
| `LOG_LEVEL` | Logging verbosity | `INFO` |
| `LLM_PROVIDER` | LLM to use | `openai` |
| `LLM_MODEL` | Model name | `gpt-3.5-turbo` |
| `LLM_TEMPERATURE` | Response creativity (0-1) | `0.7` |
| `MAX_TOKENS` | Max response length | `500` |

### Tuning Performance

**For faster responses:**
- Keep `CACHE_ENABLED=true`
- Use smaller embedding model
- Reduce `chunk_size` in `vector_store.py`

**For better accuracy:**
- Increase `k` (number of retrieved chunks)
- Use larger embedding model
- Tune prompt template in `chain.py`

---

## 🧪 Testing

### Manual Testing
```powershell
# Test health endpoint
curl http://localhost:8000/health

# Test query endpoint
curl -X POST http://localhost:8000/query `
  -H "Content-Type: application/json" `
  -d '{
    "class_id": "test-class",
    "question": "What is the main topic?"
  }'
```

### Run Unit Tests
```powershell
pytest tests/
```

---

## 🔒 Security Considerations

### Current Security Model (Hackathon)
- **Trust Boundary:** Next.js Server Action validates user permissions
- **Service Key:** AI service uses Supabase service role (bypasses RLS)
- **Assumption:** Requests reaching this service are authorized

### Production Recommendations
1. **Add JWT validation:** Verify tokens from Next.js
2. **Implement rate limiting:** Prevent abuse
3. **Add request signing:** Ensure requests are from your frontend
4. **Use environment-based secrets:** Different keys for dev/prod
5. **Monitor usage:** Track API calls per user/class

---

## 🚢 Deployment

### Option 1: Railway.app (Recommended for Hackathon)
1. Connect GitHub repository
2. Add environment variables in dashboard
3. Railway auto-detects Python and deploys
4. Get public URL (e.g., `https://your-service.railway.app`)

### Option 2: Render.com
1. Create new Web Service
2. Connect repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

### Option 3: Docker (Any Platform)
```dockerfile
# Create Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```powershell
docker build -t studygroup-ai .
docker run -p 8000:8000 --env-file .env studygroup-ai
```

---

## 🐛 Troubleshooting

### Issue: "Supabase connection failed"
- Verify `.env` has correct `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Make sure you're using **service role key**, not anon key
- Check URL has no trailing slash

### Issue: "Module not found"
- Activate virtual environment: `.\venv\Scripts\Activate.ps1`
- Install dependencies: `pip install -r requirements.txt`

### Issue: "Out of memory"
- Reduce `chunk_size` in `rag/vector_store.py` (try 500)
- Use `faiss-cpu` not `faiss-gpu`
- Process fewer documents at once

### Issue: "Vector store loading error"
- Delete cached indexes: `Remove-Item -Recurse -Force .\vector_stores\*`
- Rebuild by querying the class again

### Issue: "Slow response times"
- First query: 10-15s (building index) - normal
- Cached queries: Should be < 5s
- Check network speed to Supabase
- Consider using smaller documents

---

## 📊 Performance Benchmarks

**Expected Response Times:**
- First query (cache miss): 10-15 seconds
- Cached query (cache hit): 2-5 seconds
- Health check: < 100ms

**Resource Usage:**
- Memory: ~500MB-1GB (depends on document size)
- Disk: ~10MB per class (cached vector stores)
- CPU: High during indexing, low during queries

---

## 🔄 Development Workflow

1. **Make changes** to Python files
2. **Server auto-reloads** (if using `--reload` flag)
3. **Test in Swagger UI** at `/docs`
4. **Check logs** in terminal
5. **Commit and push** to GitHub
6. **Deploy** (Railway/Render auto-deploys on push)

---

## 📚 Key Dependencies

- **FastAPI**: Web framework
- **LangChain**: RAG pipeline orchestration
- **FAISS**: Vector similarity search
- **sentence-transformers**: Text embeddings (local, no API)
- **pypdf, python-pptx**: Document parsing
- **supabase-py**: Supabase client
- **openai**: LLM integration

---

## 🎯 Next Steps

After getting basic RAG working:
- [ ] Add streaming responses (SSE)
- [ ] Implement conversation memory (follow-up questions)
- [ ] Add document chunking optimization
- [ ] Create admin dashboard for monitoring
- [ ] Add usage analytics
- [ ] Implement A/B testing for prompts

---

## 📖 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [LangChain Documentation](https://python.langchain.com/)
- [FAISS Wiki](https://github.com/facebookresearch/faiss/wiki)
- [Supabase Python Client](https://supabase.com/docs/reference/python/introduction)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

## 🤝 Contributing

This is a hackathon project, but improvements are welcome!

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📝 License

Part of the Studygroup project. See main repository for license.

---

**Questions?** Check `PHASE_3_IMPLEMENTATION_PLAN.md` for detailed implementation guide.
