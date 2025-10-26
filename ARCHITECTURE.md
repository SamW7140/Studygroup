# 🏗️ System Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Next.js Frontend (Port 3000)               │    │
│  │                                                     │    │
│  │  • React 18 + TypeScript                           │    │
│  │  • Tailwind CSS (Dark theme)                       │    │
│  │  • shadcn/ui components                            │    │
│  │  • Framer Motion animations                        │    │
│  │  • Zustand state management                        │    │
│  │                                                     │    │
│  │  Components:                                       │    │
│  │  ├─ Dashboard (hero search, tiles)                 │    │
│  │  ├─ Classes (CRUD, join codes)                     │    │
│  │  ├─ Documents (upload, list, filter)               │    │
│  │  ├─ AI Chat Interface                              │    │
│  │  └─ Settings (custom prompts)                      │    │
│  └──────────────┬──────────────────────────────────────┘    │
└─────────────────┼───────────────────────────────────────────┘
                  │
                  │ HTTP Requests
                  │
      ┌───────────▼────────────────────────────────────────┐
      │  Supabase Client (Frontend)                        │
      │  • Authentication (email/password)                 │
      │  • Database queries (classes, docs, users)         │
      │  • Storage (document uploads)                      │
      └───────────┬────────────────────────────────────────┘
                  │
                  │
   ┌──────────────▼───────────────────────────────────────────┐
   │           Python AI Service (Port 8000)                  │
   │                                                           │
   │  ┌─────────────────────────────────────────────────┐    │
   │  │         FastAPI Web Server                      │    │
   │  │  • REST API (/query, /health, /invalidate)      │    │
   │  │  • CORS enabled for localhost:3000              │    │
   │  │  • Pydantic models for validation               │    │
   │  └──────────────┬──────────────────────────────────┘    │
   │                 │                                         │
   │  ┌──────────────▼──────────────────────────────────┐    │
   │  │         RAG Pipeline Manager                     │    │
   │  │                                                  │    │
   │  │  Step 1: Document Fetching                      │    │
   │  │  └─ Supabase client fetches doc metadata       │    │
   │  │                                                  │    │
   │  │  Step 2: Document Processing                    │    │
   │  │  └─ PyPDF / python-docx / python-pptx          │    │
   │  │  └─ Extract text, chunk by page/section        │    │
   │  │                                                  │    │
   │  │  Step 3: Embeddings Generation                  │    │
   │  │  └─ Sentence Transformers (all-MiniLM-L6-v2)   │    │
   │  │  └─ Convert text chunks to 384-dim vectors     │    │
   │  │                                                  │    │
   │  │  Step 4: Vector Storage                         │    │
   │  │  └─ FAISS (Facebook AI Similarity Search)      │    │
   │  │  └─ Cached per class_id in ./vector_stores/    │    │
   │  │                                                  │    │
   │  │  Step 5: Similarity Search                      │    │
   │  │  └─ Query embedding vs document embeddings     │    │
   │  │  └─ Return top-k relevant chunks               │    │
   │  │                                                  │    │
   │  │  Step 6: LLM Generation                         │    │
   │  │  └─ Google Gemini 1.5 Flash                    │    │
   │  │  └─ Context: retrieved chunks + user question  │    │
   │  │  └─ Custom system prompt (optional)            │    │
   │  │                                                  │    │
   │  │  Step 7: Response Formatting                    │    │
   │  │  └─ Answer text + source citations             │    │
   │  └──────────────────────────────────────────────────┘    │
   └──────────────┬────────────────────────────────────────────┘
                  │
                  │ Supabase Client
                  │
   ┌──────────────▼────────────────────────────────────────────┐
   │                 Supabase Cloud Platform                   │
   │                                                            │
   │  ┌──────────────────────┐  ┌──────────────────────────┐  │
   │  │   PostgreSQL DB      │  │   Storage Buckets        │  │
   │  │                      │  │                          │  │
   │  │  Tables:             │  │  documents/              │  │
   │  │  • profiles          │  │  • PDF files             │  │
   │  │  • classes           │  │  • DOCX files            │  │
   │  │  • documents         │  │  • PPTX files            │  │
   │  │  • enrollments       │  │                          │  │
   │  │  • chat_history      │  │  Row-Level Security:     │  │
   │  │                      │  │  • User-scoped access    │  │
   │  │  Features:           │  │  • Private by default    │  │
   │  │  • Row Level Sec.    │  │                          │  │
   │  │  • Real-time         │  │                          │  │
   │  │  • Auth integration  │  │                          │  │
   │  └──────────────────────┘  └──────────────────────────┘  │
   └───────────────────────────────────────────────────────────┘
```

---

## Data Flow: User Asks a Question

```
1. User Types Question
   │
   ├─> Frontend: Chat Interface Component
   │   └─> Validates input, shows loading state
   │
2. Frontend Makes API Call
   │
   ├─> POST http://localhost:8000/query
   │   Body: { class_id, question, user_id, system_prompt? }
   │
3. AI Service Receives Request
   │
   ├─> FastAPI endpoint /query
   │   └─> Pydantic validates request
   │
4. Fetch Documents from Supabase
   │
   ├─> Query: documents WHERE class_id = ?
   │   └─> Returns: [{file_name, storage_path, file_type, ...}]
   │
5. Download & Process Documents
   │
   ├─> For each document:
   │   ├─> Download binary from Supabase Storage
   │   ├─> Extract text (PyPDF/docx/pptx)
   │   └─> Chunk by page/section
   │
6. Check Vector Store Cache
   │
   ├─> Look for: ./vector_stores/{class_id}.faiss
   │   ├─> If exists: Load cached vectors (fast!)
   │   └─> If not: Generate embeddings (slow first time)
   │
7. Generate Query Embedding
   │
   ├─> Sentence Transformer encodes question
   │   └─> Result: 384-dimensional vector
   │
8. Similarity Search
   │
   ├─> FAISS finds top-k most similar document chunks
   │   └─> Returns: [(text, file_name, page, score), ...]
   │
9. Build LLM Prompt
   │
   ├─> System: Custom prompt OR default
   │   Context: Top-k relevant document chunks
   │   Question: User's question
   │
10. Call Google Gemini
    │
    ├─> Gemini 1.5 Flash API
    │   └─> Generates answer using context
    │
11. Format Response
    │
    ├─> Extract answer text
    │   Extract source citations
    │   Calculate confidence score
    │
12. Return to Frontend
    │
    ├─> JSON: { answer, sources[], confidence }
    │   └─> Frontend displays answer + citations
    │
13. User Sees Answer
    │
    └─> Chat interface shows response with source links
```

---

## Technology Stack Details

### Frontend (Next.js)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Next.js 14.2 | React framework with App Router |
| **Language** | TypeScript 5.5 | Type-safe JavaScript |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS |
| **UI Library** | shadcn/ui | Accessible component library |
| **Icons** | Lucide React | Icon set |
| **Animations** | Framer Motion | Smooth transitions |
| **State** | Zustand | Lightweight state management |
| **Backend** | Supabase JS | Database + Auth + Storage |

### AI Service (Python)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | FastAPI 0.104 | Modern Python web framework |
| **ASGI Server** | Uvicorn | High-performance server |
| **Validation** | Pydantic 2.5 | Data validation |
| **RAG** | LangChain 0.1 | RAG orchestration |
| **LLM** | Google Gemini 1.5 | Large language model |
| **Embeddings** | Sentence Transformers | Document encoding |
| **Vector Store** | FAISS | Similarity search |
| **PDF** | PyPDF 3.17 | PDF text extraction |
| **DOCX** | python-docx 1.1 | Word doc processing |
| **PPTX** | python-pptx 0.6 | PowerPoint processing |
| **Backend** | Supabase Python | Database client |

### Infrastructure (Supabase)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Database** | PostgreSQL 15 | Relational database |
| **Auth** | Supabase Auth | User authentication |
| **Storage** | Supabase Storage | File storage (S3-compatible) |
| **API** | PostgREST | Auto-generated REST API |
| **Security** | Row Level Security | User-scoped data access |
| **Real-time** | Supabase Realtime | Live subscriptions (optional) |

---

## Security Architecture

### Authentication Flow

```
1. User Signs Up
   └─> Supabase Auth creates user
       └─> Profile row auto-created (trigger)

2. User Logs In
   └─> Supabase issues JWT token
       └─> Token stored in httpOnly cookie
           └─> Middleware refreshes on each request

3. Database Access
   └─> Row Level Security policies enforce:
       • Users see only their data
       • Class members see class docs
       • Admins see everything in their classes
```

### Data Privacy

- **Documents**: Stored in private Supabase bucket
- **Vector Store**: Cached locally, per-class
- **Queries**: Not logged by default (configurable)
- **API Keys**: Environment variables only
- **Sessions**: Secure httpOnly cookies

---

## Performance Optimizations

### Frontend

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Client State**: Zustand with localStorage persistence
- **Lazy Loading**: Framer Motion components lazy-loaded

### AI Service

- **Vector Caching**: FAISS indexes cached per class
- **Connection Pooling**: Supabase client reuses connections
- **Async Processing**: FastAPI async/await throughout
- **Chunking Strategy**: Optimal chunk size (500 tokens)

### Database

- **Indexes**: Primary keys, foreign keys indexed
- **RLS**: Row-level security policies optimized
- **Queries**: Minimal N+1 queries with joins
- **Storage**: CDN-backed file delivery

---

## Scalability Considerations

### Current Limitations

- **Vector Store**: Disk-based (single server)
- **Concurrency**: Limited by single Python process
- **Cache**: Local filesystem (not distributed)

### Production Upgrades

- **Vector Store**: Move to Pinecone or Weaviate
- **Deployment**: Containerize with Docker
- **Load Balancing**: Multiple AI service instances
- **Cache**: Redis for distributed caching
- **Queue**: Celery for background processing
- **Monitoring**: Sentry + Prometheus + Grafana

---

## API Endpoints

### Frontend (Next.js)

| Route | Type | Description |
|-------|------|-------------|
| `/` | Page | Dashboard |
| `/classes` | Page | Class list |
| `/classes/[id]` | Page | Class detail |
| `/docs` | Page | All documents |
| `/settings` | Page | User settings |
| `/auth/login` | Page | Login form |
| `/auth/signup` | Page | Signup form |
| `/api/user` | API | User info |

### AI Service (FastAPI)

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Service info |
| `/health` | GET | Health check |
| `/query` | POST | Ask a question (RAG) |
| `/invalidate-cache/{class_id}` | POST | Clear vector store |
| `/docs` | GET | API documentation |

---

## Environment Variables Reference

### Frontend (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# AI Service
AI_SERVICE_URL=http://localhost:8000
```

### AI Service (.env)

```env
# Supabase
SUPABASE_URL=<your-project-url>
SUPABASE_SERVICE_KEY=<your-service-role-key>

# Google Gemini
GOOGLE_API_KEY=<your-gemini-api-key>
GEMINI_MODEL=gemini-1.5-flash

# App Config
VECTOR_STORE_PATH=./vector_stores
CACHE_ENABLED=true
LOG_LEVEL=INFO

# LLM Config
LLM_TEMPERATURE=0.7
MAX_TOKENS=500
```

---

## File Structure

```
Studygroup/                        # Frontend Repository
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Dashboard layout
│   │   ├── page.tsx              # Home page
│   │   ├── classes/              # Classes pages
│   │   └── docs/                 # Documents pages
│   ├── actions/                  # Server actions
│   │   ├── ai-query.ts           # AI query action
│   │   ├── auth.ts               # Auth actions
│   │   ├── classes.ts            # Class CRUD
│   │   └── documents.ts          # Doc upload/list
│   ├── api/                      # API routes
│   └── auth/                     # Auth pages
├── components/
│   ├── ai/                       # AI components
│   │   ├── chat-interface.tsx
│   │   ├── floating-chat-button.tsx
│   │   └── class-ai-page.tsx
│   ├── classes/                  # Class components
│   ├── documents/                # Document components
│   └── ui/                       # shadcn/ui
├── lib/
│   └── supabase/                 # Supabase utilities
│       ├── client.ts             # Browser client
│       ├── server.ts             # Server client
│       ├── types.ts              # Database types
│       ├── queries.ts            # Helper queries
│       └── storage.ts            # File operations
├── middleware.ts                 # Auth middleware
├── .env.local                    # Environment vars
└── package.json

studygroup-ai-service/            # AI Backend Repository
├── rag/
│   ├── __init__.py
│   ├── chain.py                  # RAG chain logic
│   ├── document_loader.py        # Doc processors
│   └── vector_store.py           # FAISS wrapper
├── utils/
│   └── helpers.py                # Utility functions
├── tests/
│   └── test_service.py           # Unit tests
├── main.py                       # FastAPI app
├── supabase_client.py            # Supabase integration
├── .env                          # Environment vars
├── requirements.txt              # Python dependencies
└── README.md
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables set in production
- [ ] Supabase database schema deployed
- [ ] Storage bucket created and configured
- [ ] Google Gemini API key valid
- [ ] SSL certificates configured

### Frontend Deployment (Vercel/Netlify)

- [ ] Connect GitHub repository
- [ ] Set environment variables
- [ ] Configure build command: `npm run build`
- [ ] Set output directory: `.next`
- [ ] Deploy and test

### AI Service Deployment (Railway/Fly.io/AWS)

- [ ] Containerize with Docker
- [ ] Set environment variables
- [ ] Configure health check endpoint
- [ ] Persistent volume for vector_stores
- [ ] Deploy and test

### Post-Deployment

- [ ] Test authentication flow
- [ ] Test document upload
- [ ] Test AI query pipeline
- [ ] Monitor error rates
- [ ] Set up logging/monitoring

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **LangChain Docs**: https://python.langchain.com
- **Gemini API**: https://ai.google.dev/docs
- **FAISS Docs**: https://faiss.ai
