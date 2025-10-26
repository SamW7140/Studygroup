# Phase 3: Getting Started Guide

**Your Mission:** Build the AI brain that answers questions from class documents.

**Time to First Working Demo:** ~8-10 hours spread over 2-3 days

---

## 🎯 What You're Building

A Python service that:
1. Takes a question like *"What is quantum entanglement?"*
2. Finds relevant sections in your uploaded PDFs/slides
3. Uses AI to generate an accurate answer
4. Returns the answer with source citations

---

## 📦 What You'll Need

### Software
- ✅ Python 3.9+ (check: `python --version`)
- ✅ Your Supabase project (already set up)
- ✅ Gemini APi Key

### Time
- **Day 1 (2-3 hours):** Set up Python environment and basic API
- **Day 2 (3-4 hours):** Connect to Supabase and process documents
- **Day 3 (3-4 hours):** Add AI and connect to frontend

---

## 🚀 Let's Start: Day 1 Setup

### Step 1: Create the Project Folder

Open PowerShell in your projects directory:

```powershell
# Go to your projects folder
cd C:\Users\Lilly\Vault\Projects\Studygroup

# Create the AI service folder
mkdir studygroup-ai-service
cd studygroup-ai-service

# Create initial structure
mkdir rag, utils, tests, vector_stores
```

### Step 2: Set Up Python Virtual Environment

```powershell
# Create virtual environment
python -m venv venv

# Activate it (you'll need to do this every time you work on the project)
.\venv\Scripts\Activate.ps1

# You should see (venv) at the start of your prompt now
```

> **Tip:** If you get an error about execution policy, run:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### Step 3: Create Requirements File

Create a file named `requirements.txt` in the `studygroup-ai-service` folder:

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
pydantic==2.5.0
supabase==2.3.0
langchain==0.1.0
langchain-community==0.0.10
openai==1.6.1
faiss-cpu==1.7.4
sentence-transformers==2.2.2
pypdf==3.17.4
python-pptx==0.6.23
httpx==0.25.2
```

### Step 4: Install Dependencies

```powershell
pip install -r requirements.txt
```

This will take 2-3 minutes. It's downloading ~400MB of AI models.

### Step 5: Create Environment Variables File

Create `.env` file:

```env
# Supabase (get from https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api)
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=your_openai_key_here

# App Config
VECTOR_STORE_PATH=./vector_stores
CACHE_ENABLED=true
LOG_LEVEL=INFO
LLM_MODEL=gpt-3.5-turbo-instruct
LLM_TEMPERATURE=0.7
MAX_TOKENS=500
```

**Important:** Replace the placeholder values with your actual keys!

### Step 6: Create Your First API File

Create `main.py`:

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Studygroup AI")

class QueryRequest(BaseModel):
    class_id: str
    question: str

class Source(BaseModel):
    file_name: str
    page: int = None

class QueryResponse(BaseModel):
    answer: str
    sources: List[Source]

@app.get("/")
def root():
    return {"message": "Studygroup AI Service", "status": "running"}

@app.get("/health")
def health():
    has_supabase = bool(os.getenv("SUPABASE_URL"))
    has_openai = bool(os.getenv("OPENAI_API_KEY"))
    return {
        "status": "ok",
        "supabase_configured": has_supabase,
        "openai_configured": has_openai
    }

@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    # Mock response for now
    return QueryResponse(
        answer=f"Mock answer for: {request.question}",
        sources=[
            Source(file_name="test.pdf", page=1)
        ]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Step 7: Test Your API! 🎉

```powershell
# Run the server
uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Now open your browser and go to: **http://localhost:8000/docs**

You should see a beautiful interactive API documentation page!

Try these:
1. Click on `GET /health` → Try it out → Execute
   - Should show `supabase_configured: true` if you set up .env correctly
2. Click on `POST /query` → Try it out
   - Enter: `{"class_id": "test", "question": "What is AI?"}`
   - Click Execute
   - Should get back a mock answer!

---

## ✅ Day 1 Success Checklist

- [ ] Virtual environment created and activated
- [ ] All packages installed without errors
- [ ] `.env` file created with your keys
- [ ] `main.py` file created
- [ ] Server runs with `uvicorn main:app --reload`
- [ ] Can access http://localhost:8000/docs
- [ ] `/health` endpoint returns success
- [ ] `/query` endpoint returns mock data

**If all checked:** Congratulations! 🎉 Day 1 is done. Take a break!

---

## 📅 What's Next?

### Day 2: Connect to Supabase
- Create `supabase_client.py` to fetch documents
- Test downloading a real PDF from your storage
- Parse the PDF and extract text

### Day 3: Add the AI
- Create vector store from documents
- Implement RAG chain with OpenAI
- Test real question → real answer flow

### Day 4: Connect to Frontend
- Create Next.js Server Action
- Call AI service from your app
- Display answers in the UI

---

## 🆘 Common Issues & Fixes

### "Python not found"
**Fix:** Install Python from python.org, make sure "Add to PATH" is checked

### "pip install fails"
**Fix:** Make sure virtual environment is activated (you should see `(venv)` in terminal)

### "Cannot activate virtual environment"
**Fix:** Run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "ImportError when running server"
**Fix:** 
```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### "Port 8000 already in use"
**Fix:** Either:
- Kill the other process using port 8000
- Or run on different port: `uvicorn main:app --reload --port 8001`

---

## 🎓 Quick Python/FastAPI Primer

If you're new to Python or FastAPI, here are the basics:

**Running commands:**
- Always activate venv first: `.\venv\Scripts\Activate.ps1`
- Run server: `uvicorn main:app --reload`
- Install packages: `pip install package_name`
- Stop server: Press `Ctrl + C`

**Editing code:**
- Server auto-reloads when you save files (thanks to `--reload` flag)
- Check terminal for errors
- Syntax is important (indentation matters in Python!)

**Testing:**
- Use the `/docs` page (Swagger UI) - it's your best friend
- Or use PowerShell:
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
  ```

---

## 📚 Helpful Links

- **Full Implementation Plan:** See `PHASE_3_IMPLEMENTATION_PLAN.md`
- **Checklist:** See `PHASE_3_CHECKLIST.md`
- **AI Service README:** See `AI_SERVICE_README.md`
- **FastAPI Tutorial:** https://fastapi.tiangolo.com/tutorial/
- **Python Basics:** https://docs.python.org/3/tutorial/

---

## 💡 Pro Tips

1. **Keep the terminal open** - you'll want to see logs
2. **Use the Swagger UI** at `/docs` - it's the easiest way to test
3. **Commit often** - after each working step
4. **Ask for help** - if stuck for >15 minutes, reach out
5. **Test incrementally** - don't write all code before testing

---

## 🎯 Your Goal Today

Just get Day 1 done. That's it. Don't worry about AI, RAG, or anything fancy yet.

**Goal:** See "Mock answer" when you test `/query` endpoint.

Once that works, you've built a real API service! The rest is just adding features to it.

---

**Ready? Let's go! 🚀**

Start with Step 1 above. Take it one step at a time. You got this!
