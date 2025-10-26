# Phase 3 Implementation Plan: Building the RAG API

**Owner:** Sam  
**Status:** Ready to Start  
**Target:** Hackathon MVP  
**Date:** October 25, 2025

---

## 🎯 Overview

Phase 3 focuses on building a Python-based RAG (Retrieval-Augmented Generation) microservice using FastAPI. This service will power the AI-driven Q&A feature by retrieving relevant content from class documents stored in Supabase and generating contextual answers.

**Architecture:**
```
Next.js Frontend (Client) 
    ↓
Next.js Server Action/API Route (Server)
    ↓ HTTP Request
FastAPI Service (Python)
    ↓
Supabase (Storage + Database)
```

---

## 📋 Phase 3 Milestones

### Milestone 1: Foundation Setup (Day 1)
**Goal:** Get the Python service running with mock endpoints

- [ ] Project structure created
- [ ] FastAPI server responding to requests
- [ ] Environment variables configured
- [ ] API documentation accessible

### Milestone 2: Data Integration (Day 2)
**Goal:** Connect to Supabase and fetch real data

- [ ] Supabase client working
- [ ] Document metadata fetching from database
- [ ] Document content downloading from storage
- [ ] Document parsing (PDF, PPTX) functional

### Milestone 3: AI Pipeline (Day 3)
**Goal:** Implement the core RAG functionality

- [ ] Text splitting and chunking
- [ ] Embedding generation
- [ ] FAISS vector store creation
- [ ] Basic retrieval working

### Milestone 4: LLM Integration (Day 4)
**Goal:** Generate AI answers from retrieved context

- [ ] LangChain retrieval chain configured
- [ ] LLM integration (OpenAI or local model)
- [ ] Source citation working
- [ ] Response quality acceptable

### Milestone 5: Performance & Integration (Day 5)
**Goal:** Optimize and connect to frontend

- [ ] Vector store caching implemented
- [ ] Cache invalidation strategy
- [ ] Next.js integration working
- [ ] Error handling robust

---

## 🏗️ Detailed Implementation Steps

### Step 1: Project Setup
**Time Estimate:** 30 minutes

#### 1.1 Create Project Structure
```
studygroup-ai-service/
├── .env.example
├── .env                  # Git-ignored
├── .gitignore
├── requirements.txt
├── README.md
├── main.py              # FastAPI application
├── config.py            # Configuration management
├── supabase_client.py   # Supabase integration
├── rag/
│   ├── __init__.py
│   ├── document_loader.py
│   ├── embeddings.py
│   ├── vector_store.py
│   └── chain.py
├── utils/
│   ├── __init__.py
│   └── logging.py
├── vector_stores/       # Cached FAISS indexes (Git-ignored)
└── tests/
    └── test_api.py
```

#### 1.2 Create `requirements.txt`
```txt
# Web Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6

# Data Validation
pydantic==2.5.0
pydantic-settings==2.1.0

# Environment & Config
python-dotenv==1.0.0

# Supabase Integration
supabase==2.3.0
httpx==0.25.2

# AI/ML Stack
langchain==0.1.0
langchain-community==0.0.10
openai==1.6.1

# Vector Store
faiss-cpu==1.7.4

# Embeddings
sentence-transformers==2.2.2

# Document Processing
pypdf==3.17.4
python-pptx==0.6.23
python-docx==1.1.0

# Utilities
requests==2.31.0
```

#### 1.3 Create `.env.example`
```env
# Supabase Configuration
SUPABASE_URL=your_project_url_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# OpenAI Configuration (if using OpenAI)
OPENAI_API_KEY=your_openai_key_here

# App Configuration
VECTOR_STORE_PATH=./vector_stores
CACHE_ENABLED=true
LOG_LEVEL=INFO

# LLM Configuration
LLM_PROVIDER=openai  # or 'local' for open-source models
LLM_MODEL=gpt-3.5-turbo
LLM_TEMPERATURE=0.7
MAX_TOKENS=500
```

#### 1.4 Setup Commands
```powershell
# Navigate to parent directory
cd C:\Users\Lilly\Vault\Projects\Studygroup

# Create new project folder
mkdir studygroup-ai-service
cd studygroup-ai-service

# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir vector_stores, tests, rag, utils
```

---

### Step 2: FastAPI Server Skeleton
**Time Estimate:** 45 minutes

#### 2.1 Create `main.py`
```python
"""
Studygroup AI Service - RAG API
FastAPI server for AI-powered document Q&A
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Studygroup AI Service",
    description="RAG-powered Q&A API for class documents",
    version="1.0.0"
)

# CORS configuration (allow Next.js frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class QueryRequest(BaseModel):
    class_id: str = Field(..., description="The ID of the class to query")
    question: str = Field(..., min_length=1, max_length=1000, description="User's question")
    user_id: Optional[str] = Field(None, description="User ID for logging (optional)")

class Source(BaseModel):
    file_name: str
    page: Optional[int] = None
    relevance_score: Optional[float] = None

class QueryResponse(BaseModel):
    answer: str
    sources: List[Source]
    confidence: Optional[float] = None

# --- API Endpoints ---
@app.get("/")
def root():
    """Root endpoint - API information"""
    return {
        "service": "Studygroup AI",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "supabase_connected": check_supabase_connection(),
        "vector_store_path": os.getenv("VECTOR_STORE_PATH")
    }

def check_supabase_connection() -> bool:
    """Verify Supabase credentials are set"""
    return bool(os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_SERVICE_KEY"))

@app.post("/query", response_model=QueryResponse)
async def handle_query(request: QueryRequest):
    """
    Main endpoint: Answer questions about class documents using RAG
    
    Flow:
    1. Validate class_id and question
    2. Fetch documents for the class from Supabase
    3. Load/create vector store (with caching)
    4. Retrieve relevant context
    5. Generate answer using LLM
    6. Return answer with sources
    """
    logger.info(f"Query received for class '{request.class_id}': {request.question[:50]}...")
    
    try:
        # TODO: Implement RAG pipeline
        # For now, return mock response
        
        mock_answer = (
            f"This is a placeholder response for your question about class {request.class_id}. "
            f"The RAG pipeline will be implemented next."
        )
        
        mock_sources = [
            Source(file_name="lecture_notes.pdf", page=5, relevance_score=0.92),
            Source(file_name="textbook_chapter3.pdf", page=42, relevance_score=0.85)
        ]
        
        return QueryResponse(
            answer=mock_answer,
            sources=mock_sources,
            confidence=0.75
        )
        
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/invalidate-cache/{class_id}")
async def invalidate_cache(class_id: str):
    """
    Invalidate the vector store cache for a specific class
    (Called when documents are updated)
    """
    logger.info(f"Cache invalidation requested for class: {class_id}")
    
    # TODO: Implement cache invalidation logic
    
    return {"status": "success", "message": f"Cache invalidated for {class_id}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

#### 2.2 Test the Server
```powershell
# Run the server
uvicorn main:app --reload

# Test endpoints (in browser or new terminal)
# Visit: http://127.0.0.1:8000/docs
# Try: http://127.0.0.1:8000/health
```

---

### Step 3: Supabase Integration
**Time Estimate:** 1 hour

#### 3.1 Create `supabase_client.py`
```python
"""
Supabase client and data fetching utilities
"""
import os
from typing import List, Dict, Optional
from supabase import create_client, Client
import logging

logger = logging.getLogger(__name__)

class SupabaseManager:
    """Manages Supabase connection and data operations"""
    
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        
        self.client: Client = create_client(self.url, self.key)
    
    async def fetch_documents_for_class(self, class_id: str) -> List[Dict]:
        """
        Fetch all documents associated with a class
        
        Query logic:
        1. Find the class in the 'classes' table
        2. Join through 'document_flags' junction table
        3. Get document metadata from 'documents' table
        """
        try:
            # Query using the junction table pattern from your schema
            # This assumes: documents -> document_flags -> flags (where flags link to classes)
            
            response = self.client.table("documents") \
                .select("""
                    id,
                    file_name,
                    file_type,
                    storage_path,
                    uploaded_at,
                    document_flags!inner(
                        flags!inner(
                            name,
                            class_id
                        )
                    )
                """) \
                .eq("document_flags.flags.class_id", class_id) \
                .execute()
            
            if response.data:
                logger.info(f"Found {len(response.data)} documents for class {class_id}")
                return response.data
            
            logger.warning(f"No documents found for class {class_id}")
            return []
            
        except Exception as e:
            logger.error(f"Error fetching documents: {str(e)}")
            raise
    
    async def download_document(self, storage_path: str) -> bytes:
        """
        Download document content from Supabase Storage
        
        Args:
            storage_path: Path in the 'documents' bucket (e.g., 'user_id/file.pdf')
        
        Returns:
            Document content as bytes
        """
        try:
            # Download from the 'documents' bucket
            response = self.client.storage.from_("documents").download(storage_path)
            
            if response:
                logger.info(f"Successfully downloaded {storage_path}")
                return response
            else:
                raise ValueError(f"Failed to download {storage_path}")
                
        except Exception as e:
            logger.error(f"Error downloading document: {str(e)}")
            raise
    
    async def get_class_info(self, class_id: str) -> Optional[Dict]:
        """Fetch class metadata"""
        try:
            response = self.client.table("classes") \
                .select("*") \
                .eq("id", class_id) \
                .single() \
                .execute()
            
            return response.data if response.data else None
            
        except Exception as e:
            logger.error(f"Error fetching class info: {str(e)}")
            return None

# Singleton instance
_supabase_manager = None

def get_supabase_manager() -> SupabaseManager:
    """Get or create SupabaseManager instance"""
    global _supabase_manager
    if _supabase_manager is None:
        _supabase_manager = SupabaseManager()
    return _supabase_manager
```

---

### Step 4: Document Processing
**Time Estimate:** 1.5 hours

#### 4.1 Create `rag/document_loader.py`
```python
"""
Document loading and text extraction
"""
import io
from typing import List, Dict
from pypdf import PdfReader
from pptx import Presentation
from docx import Document
import logging

logger = logging.getLogger(__name__)

class DocumentProcessor:
    """Processes different document types and extracts text"""
    
    @staticmethod
    def extract_text_from_pdf(content: bytes) -> List[Dict]:
        """
        Extract text from PDF with page numbers
        
        Returns:
            List of dicts: [{"page": 1, "text": "..."}, ...]
        """
        try:
            pdf = PdfReader(io.BytesIO(content))
            pages = []
            
            for page_num, page in enumerate(pdf.pages, start=1):
                text = page.extract_text()
                if text.strip():
                    pages.append({
                        "page": page_num,
                        "text": text
                    })
            
            logger.info(f"Extracted text from {len(pages)} PDF pages")
            return pages
            
        except Exception as e:
            logger.error(f"Error extracting PDF text: {str(e)}")
            raise
    
    @staticmethod
    def extract_text_from_pptx(content: bytes) -> List[Dict]:
        """Extract text from PowerPoint"""
        try:
            prs = Presentation(io.BytesIO(content))
            slides = []
            
            for slide_num, slide in enumerate(prs.slides, start=1):
                text_parts = []
                for shape in slide.shapes:
                    if hasattr(shape, "text"):
                        text_parts.append(shape.text)
                
                full_text = "\n".join(text_parts)
                if full_text.strip():
                    slides.append({
                        "page": slide_num,  # Using "page" for consistency
                        "text": full_text
                    })
            
            logger.info(f"Extracted text from {len(slides)} slides")
            return slides
            
        except Exception as e:
            logger.error(f"Error extracting PPTX text: {str(e)}")
            raise
    
    @staticmethod
    def extract_text_from_docx(content: bytes) -> List[Dict]:
        """Extract text from Word document"""
        try:
            doc = Document(io.BytesIO(content))
            paragraphs = []
            
            for para_num, para in enumerate(doc.paragraphs, start=1):
                if para.text.strip():
                    paragraphs.append({
                        "page": para_num,
                        "text": para.text
                    })
            
            logger.info(f"Extracted {len(paragraphs)} paragraphs from DOCX")
            return paragraphs
            
        except Exception as e:
            logger.error(f"Error extracting DOCX text: {str(e)}")
            raise
    
    @classmethod
    def process_document(cls, content: bytes, file_type: str, file_name: str) -> List[Dict]:
        """
        Route document to appropriate processor
        
        Args:
            content: Raw file bytes
            file_type: MIME type or extension
            file_name: Original filename
        
        Returns:
            List of text chunks with metadata
        """
        file_type = file_type.lower()
        
        if "pdf" in file_type or file_name.endswith(".pdf"):
            return cls.extract_text_from_pdf(content)
        elif "pptx" in file_type or "powerpoint" in file_type or file_name.endswith(".pptx"):
            return cls.extract_text_from_pptx(content)
        elif "docx" in file_type or "word" in file_type or file_name.endswith(".docx"):
            return cls.extract_text_from_docx(content)
        else:
            logger.warning(f"Unsupported file type: {file_type}")
            return []
```

---

### Step 5: Vector Store with Caching
**Time Estimate:** 2 hours

#### 5.1 Create `rag/vector_store.py`
```python
"""
Vector store management with FAISS and caching
"""
import os
import pickle
from typing import List, Dict, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document
import logging

logger = logging.getLogger(__name__)

class VectorStoreManager:
    """Manages FAISS vector stores with file-based caching"""
    
    def __init__(self):
        self.cache_dir = os.getenv("VECTOR_STORE_PATH", "./vector_stores")
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # Initialize embeddings model (runs locally, no API key needed)
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
    
    def _get_cache_path(self, class_id: str) -> str:
        """Get the file path for a cached vector store"""
        return os.path.join(self.cache_dir, f"{class_id}.faiss")
    
    def _cache_exists(self, class_id: str) -> bool:
        """Check if cached vector store exists"""
        path = self._get_cache_path(class_id)
        return os.path.exists(path) and os.path.exists(f"{path}.pkl")
    
    def load_from_cache(self, class_id: str) -> Optional[FAISS]:
        """Load vector store from cache"""
        if not self._cache_exists(class_id):
            logger.info(f"No cache found for class {class_id}")
            return None
        
        try:
            cache_path = self._get_cache_path(class_id)
            vector_store = FAISS.load_local(
                cache_path, 
                self.embeddings,
                allow_dangerous_deserialization=True
            )
            logger.info(f"Loaded vector store from cache for {class_id}")
            return vector_store
        except Exception as e:
            logger.error(f"Error loading cache: {str(e)}")
            return None
    
    def save_to_cache(self, class_id: str, vector_store: FAISS):
        """Save vector store to cache"""
        try:
            cache_path = self._get_cache_path(class_id)
            vector_store.save_local(cache_path)
            logger.info(f"Saved vector store to cache for {class_id}")
        except Exception as e:
            logger.error(f"Error saving cache: {str(e)}")
    
    def invalidate_cache(self, class_id: str):
        """Delete cached vector store"""
        try:
            cache_path = self._get_cache_path(class_id)
            if os.path.exists(cache_path):
                os.remove(cache_path)
            if os.path.exists(f"{cache_path}.pkl"):
                os.remove(f"{cache_path}.pkl")
            logger.info(f"Invalidated cache for {class_id}")
        except Exception as e:
            logger.error(f"Error invalidating cache: {str(e)}")
    
    def create_vector_store(
        self, 
        documents: List[Dict],  # From DocumentProcessor
        file_names: List[str]
    ) -> FAISS:
        """
        Create FAISS vector store from processed documents
        
        Args:
            documents: List of {"page": int, "text": str} dicts
            file_names: Corresponding file names for each document
        
        Returns:
            FAISS vector store
        """
        try:
            # Convert to LangChain Document format
            langchain_docs = []
            
            for doc_idx, doc_pages in enumerate(documents):
                for page_data in doc_pages:
                    # Split each page into chunks
                    chunks = self.text_splitter.split_text(page_data["text"])
                    
                    for chunk in chunks:
                        langchain_docs.append(Document(
                            page_content=chunk,
                            metadata={
                                "source": file_names[doc_idx],
                                "page": page_data["page"]
                            }
                        ))
            
            logger.info(f"Created {len(langchain_docs)} document chunks")
            
            # Create FAISS vector store
            vector_store = FAISS.from_documents(langchain_docs, self.embeddings)
            
            return vector_store
            
        except Exception as e:
            logger.error(f"Error creating vector store: {str(e)}")
            raise
    
    async def get_or_create_vector_store(
        self,
        class_id: str,
        documents: List[Dict],
        file_names: List[str],
        use_cache: bool = True
    ) -> FAISS:
        """
        Get vector store from cache or create new one
        
        This is the main entry point for the RAG pipeline
        """
        # Try to load from cache first
        if use_cache:
            cached_store = self.load_from_cache(class_id)
            if cached_store:
                return cached_store
        
        # Create new vector store
        logger.info(f"Creating new vector store for {class_id}")
        vector_store = self.create_vector_store(documents, file_names)
        
        # Save to cache
        if use_cache:
            self.save_to_cache(class_id, vector_store)
        
        return vector_store
```

---

### Step 6: RAG Chain Implementation
**Time Estimate:** 2 hours

#### 6.1 Create `rag/chain.py`
```python
"""
LangChain RAG pipeline
"""
import os
from typing import List, Dict
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_community.llms import OpenAI
from langchain_community.vectorstores import FAISS
import logging

logger = logging.getLogger(__name__)

class RAGChain:
    """Manages the retrieval-augmented generation chain"""
    
    def __init__(self):
        # Initialize LLM
        llm_provider = os.getenv("LLM_PROVIDER", "openai")
        
        if llm_provider == "openai":
            self.llm = OpenAI(
                temperature=float(os.getenv("LLM_TEMPERATURE", "0.7")),
                max_tokens=int(os.getenv("MAX_TOKENS", "500")),
                model_name=os.getenv("LLM_MODEL", "gpt-3.5-turbo-instruct")
            )
        else:
            # TODO: Add support for local models (e.g., Ollama)
            raise NotImplementedError("Only OpenAI is supported in this version")
        
        # Define the prompt template
        self.prompt_template = PromptTemplate(
            template="""You are a helpful AI teaching assistant for a university course.
Use the following context from class materials to answer the student's question.
If you cannot find the answer in the context, say so honestly.
Always cite which document(s) you used.

Context:
{context}

Question: {question}

Answer (be concise and accurate):""",
            input_variables=["context", "question"]
        )
    
    async def query(
        self, 
        vector_store: FAISS, 
        question: str,
        k: int = 4
    ) -> Dict:
        """
        Query the RAG chain
        
        Args:
            vector_store: FAISS vector store with document chunks
            question: User's question
            k: Number of documents to retrieve
        
        Returns:
            Dict with 'answer' and 'sources'
        """
        try:
            # Create retrieval chain
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=vector_store.as_retriever(search_kwargs={"k": k}),
                return_source_documents=True,
                chain_type_kwargs={"prompt": self.prompt_template}
            )
            
            # Run the query
            result = qa_chain({"query": question})
            
            # Extract sources
            sources = []
            seen_sources = set()
            
            for doc in result.get("source_documents", []):
                source_key = f"{doc.metadata['source']}_{doc.metadata.get('page', 0)}"
                if source_key not in seen_sources:
                    sources.append({
                        "file_name": doc.metadata["source"],
                        "page": doc.metadata.get("page"),
                        "text_snippet": doc.page_content[:100]  # First 100 chars
                    })
                    seen_sources.add(source_key)
            
            logger.info(f"Generated answer with {len(sources)} sources")
            
            return {
                "answer": result["result"],
                "sources": sources
            }
            
        except Exception as e:
            logger.error(f"Error in RAG query: {str(e)}")
            raise
```

---

### Step 7: Wire Everything Together
**Time Estimate:** 1 hour

#### 7.1 Update `main.py` with Full Pipeline
```python
# Add to imports in main.py
from supabase_client import get_supabase_manager
from rag.document_loader import DocumentProcessor
from rag.vector_store import VectorStoreManager
from rag.chain import RAGChain

# Initialize singletons
supabase_manager = get_supabase_manager()
doc_processor = DocumentProcessor()
vector_store_manager = VectorStoreManager()
rag_chain = RAGChain()

# Update the handle_query endpoint
@app.post("/query", response_model=QueryResponse)
async def handle_query(request: QueryRequest):
    """Main RAG endpoint - now with full implementation"""
    logger.info(f"Query for class '{request.class_id}': {request.question[:50]}...")
    
    try:
        # Step 1: Fetch document metadata
        doc_metadata = await supabase_manager.fetch_documents_for_class(request.class_id)
        
        if not doc_metadata:
            return QueryResponse(
                answer="I couldn't find any documents for this class yet.",
                sources=[],
                confidence=0.0
            )
        
        # Step 2: Download and process documents
        processed_docs = []
        file_names = []
        
        for doc in doc_metadata:
            try:
                # Download from storage
                content = await supabase_manager.download_document(doc["storage_path"])
                
                # Extract text
                pages = doc_processor.process_document(
                    content, 
                    doc["file_type"], 
                    doc["file_name"]
                )
                
                processed_docs.append(pages)
                file_names.append(doc["file_name"])
                
            except Exception as e:
                logger.warning(f"Skipping document {doc['file_name']}: {str(e)}")
        
        if not processed_docs:
            return QueryResponse(
                answer="I couldn't process any documents for this class.",
                sources=[],
                confidence=0.0
            )
        
        # Step 3: Get or create vector store
        vector_store = await vector_store_manager.get_or_create_vector_store(
            class_id=request.class_id,
            documents=processed_docs,
            file_names=file_names,
            use_cache=os.getenv("CACHE_ENABLED", "true").lower() == "true"
        )
        
        # Step 4: Query the RAG chain
        result = await rag_chain.query(vector_store, request.question)
        
        # Step 5: Format response
        sources = [
            Source(
                file_name=s["file_name"],
                page=s.get("page"),
                relevance_score=None  # Could add similarity scores here
            )
            for s in result["sources"]
        ]
        
        return QueryResponse(
            answer=result["answer"],
            sources=sources,
            confidence=0.85  # Could calculate based on retrieval scores
        )
        
    except Exception as e:
        logger.error(f"Error in query pipeline: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to process query: {str(e)}"
        )

# Update cache invalidation
@app.post("/invalidate-cache/{class_id}")
async def invalidate_cache(class_id: str):
    """Invalidate vector store cache"""
    try:
        vector_store_manager.invalidate_cache(class_id)
        return {"status": "success", "message": f"Cache cleared for {class_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

### Step 8: Next.js Integration
**Time Estimate:** 1 hour

#### 8.1 Create Next.js Server Action
Create `app/actions/ai-query.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

interface AIQueryRequest {
  classId: string
  question: string
}

interface AIQueryResponse {
  answer: string
  sources: Array<{
    file_name: string
    page?: number
    relevance_score?: number
  }>
  confidence?: number
}

export async function queryAI(data: AIQueryRequest): Promise<AIQueryResponse> {
  // Get authenticated user
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  // Verify user has access to this class
  const { data: enrollment } = await supabase
    .from('class_members')
    .select('id')
    .eq('class_id', data.classId)
    .eq('user_id', user.id)
    .single()
  
  if (!enrollment) {
    throw new Error('You are not enrolled in this class')
  }
  
  // Call the AI service
  const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'
  
  const response = await fetch(`${AI_SERVICE_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      class_id: data.classId,
      question: data.question,
      user_id: user.id,
    }),
  })
  
  if (!response.ok) {
    throw new Error('AI service request failed')
  }
  
  return response.json()
}
```

#### 8.2 Add Environment Variable
In your `.env.local`:
```
AI_SERVICE_URL=http://localhost:8000
```

---

## 🚀 Deployment Considerations

### For Hackathon (Quick & Easy)
1. **Railway.app** or **Render.com**: Free tier, automatic deployments
2. Keep using FAISS with file storage (simple, no external DB needed)
3. Use OpenAI API (fast to implement, pay-per-use)

### For Production (Later)
1. Replace FAISS with **Pinecone** or **Qdrant** (managed vector DBs)
2. Add authentication between Next.js and AI service (JWT validation)
3. Implement proper rate limiting
4. Add monitoring and error tracking (Sentry)
5. Consider using **Vercel Edge Functions** for the AI service

---

## 📊 Success Metrics

**Phase 3 is complete when:**
- [ ] AI service returns accurate answers to test questions
- [ ] Response time < 5 seconds for cached queries
- [ ] Response time < 15 seconds for new class documents
- [ ] Frontend can successfully call and display AI responses
- [ ] At least 3 different file types (PDF, PPTX, DOCX) work
- [ ] Cache invalidation works when documents are updated

---

## 🎓 Testing Strategy

1. **Unit Tests:** Test each component (document loader, embeddings, etc.)
2. **Integration Tests:** Test the full pipeline with sample documents
3. **Manual Testing:** Ask questions you know the answer to from your docs
4. **Edge Cases:** Empty classes, malformed PDFs, very long questions

---

## 🔧 Troubleshooting Guide

### Issue: "Module not found" errors
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`

### Issue: Supabase connection fails
- Check `.env` file has correct credentials
- Verify service role key (not anon key)

### Issue: Vector store loading errors
- Delete `vector_stores/` folder and rebuild
- Check file permissions

### Issue: Out of memory
- Reduce `chunk_size` in text splitter
- Process fewer documents at once
- Use `faiss-cpu` not `faiss-gpu`

---

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [LangChain Documentation](https://python.langchain.com/)
- [FAISS Guide](https://github.com/facebookresearch/faiss/wiki)
- [Supabase Python Client](https://supabase.com/docs/reference/python/introduction)

---

**Ready to start? Begin with Step 1! 🚀**
