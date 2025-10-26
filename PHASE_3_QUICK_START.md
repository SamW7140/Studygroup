# Phase 3: Quick Start Guide

## 🚀 Get Your AI Service Running in 5 Minutes

### Prerequisites Checklist
- ✅ Python 3.9+ installed
- ✅ Virtual environment created (`studygroup-ai-service/venv/`)
- ✅ Dependencies installed (`pip install -r requirements.txt`)
- ❌ API keys configured (you need to do this!)

---

## Step 1: Get Your API Keys

### Supabase Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **service_role** key (NOT the anon key!)

### Google Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Click **"Get API key"** or **"Create API key"**
3. Copy the key that starts with `AIza...`

---

## Step 2: Configure Environment Variables

Open the file: `studygroup-ai-service/.env`

Replace the placeholder values:

```env
# Your actual Supabase URL (already correct)
SUPABASE_URL=https://mymvecqdhmnputgxodfn.supabase.co

# REPLACE THIS with your service_role key
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_KEY_HERE

# REPLACE THIS with your Gemini API key
GOOGLE_API_KEY=AIzaSy_YOUR_ACTUAL_KEY_HERE

# These are fine as-is
VECTOR_STORE_PATH=./vector_stores
CACHE_ENABLED=true
LOG_LEVEL=INFO
LLM_TEMPERATURE=0.7
MAX_TOKENS=500
```

**⚠️ Important:** Never commit this file to Git! It's already in `.gitignore`.

---

## Step 3: Start the AI Service

Open PowerShell in the `studygroup-ai-service` folder:

```powershell
cd C:\Users\Lilly\Vault\Projects\Studygroup\studygroup-ai-service

# Run the service
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ **Success!** Your AI service is running!

---

## Step 4: Test the Service

### Option A: Use Your Browser

1. Open: http://localhost:8000/docs
2. You'll see the Swagger UI with all endpoints
3. Click on **GET /health** → **Try it out** → **Execute**
4. Should return:
   ```json
   {
     "status": "healthy",
     "supabase_connected": true,
     "gemini_configured": true
   }
   ```

### Option B: Test a Query

1. In the Swagger UI, click **POST /query**
2. Click **Try it out**
3. Enter this test data:
   ```json
   {
     "class_id": "test-class",
     "question": "What is quantum computing?"
   }
   ```
4. Click **Execute**

**Expected result:** Since you don't have documents yet, it will return a message saying no documents were found. That's normal!

---

## Step 5: Use AI in Your Next.js App

### Add the AI Assistant Component

In any class page, add:

```tsx
import { AIAssistant } from '@/components/ai/ai-assistant'

export default function ClassPage({ params }: { params: { id: string } }) {
  return (
    <div>
      {/* Your other content */}
      
      <AIAssistant classId={params.id} />
    </div>
  )
}
```

### Or Call the Server Action Directly

```tsx
'use client'

import { queryAI } from '@/app/actions/ai-query'
import { useState } from 'react'

export function MyComponent() {
  const [answer, setAnswer] = useState('')
  
  const handleAsk = async () => {
    const result = await queryAI({
      classId: 'your-class-id',
      question: 'What is the main topic?'
    })
    setAnswer(result.answer)
  }
  
  return (
    <div>
      <button onClick={handleAsk}>Ask AI</button>
      <p>{answer}</p>
    </div>
  )
}
```

---

## Step 6: Add Test Documents

For the AI to work, you need documents in Supabase:

1. **Upload documents** to Supabase Storage (bucket: `documents`)
2. **Add entries** to the `documents` table with:
   - `id` - UUID
   - `file_name` - e.g., "lecture-notes.pdf"
   - `file_type` - e.g., "application/pdf"
   - `storage_path` - Path in storage bucket
   - `user_id` - Your user ID

3. **Link to a class** through the `document_flags` table

---

## Common Issues

### "ModuleNotFoundError: No module named 'fastapi'"

**Fix:** Make sure you're in the virtual environment:
```powershell
cd studygroup-ai-service
.\venv\Scripts\Activate.ps1  # You should see (venv) in your prompt
python main.py
```

### "SUPABASE_URL must be set"

**Fix:** Check your `.env` file exists and has the correct values.

### "GOOGLE_API_KEY must be set"

**Fix:** You need to get a Gemini API key and add it to `.env`

### "Port 8000 is already in use"

**Fix:** Either:
- Kill the other process using port 8000
- Or run on a different port: `python main.py --port 8001`

### "No documents found for this class"

**Fix:** This is expected if you haven't uploaded any documents yet. The AI needs documents to answer questions!

---

## Testing Without Documents

If you want to test the AI service before adding real documents, you can:

1. Create a test endpoint that uses mock data
2. Or add a simple text file as a test document
3. Or skip ahead to uploading real course materials

---

## Next Steps

Once your AI service is running:

1. ✅ **Upload course documents** to Supabase
2. ✅ **Link documents to classes** in the database
3. ✅ **Test queries** in the Swagger UI
4. ✅ **Build a chat UI** in your Next.js app
5. ✅ **Deploy to production** (Railway, Render, etc.)

---

## Production Deployment (Optional)

### Deploy to Railway:

1. Create account at railway.app
2. New Project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Update `AI_SERVICE_URL` in Next.js `.env.local`

### Deploy to Render:

1. Create account at render.com
2. New → Web Service → Connect repository
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Update `AI_SERVICE_URL` in Next.js `.env.local`

---

## Files You Created

```
studygroup-ai-service/
├── main.py                 ✅ FastAPI server
├── supabase_client.py     ✅ Supabase integration
├── rag/
│   ├── document_loader.py ✅ Document parsing
│   ├── vector_store.py    ✅ Vector store
│   └── chain.py           ✅ RAG with Gemini
├── requirements.txt        ✅ Dependencies
├── .env                    ⚠️  Needs API keys
└── README.md              ✅ Documentation

Studygroup/ (Next.js)
├── app/actions/
│   └── ai-query.ts        ✅ Server action
└── components/ai/
    └── ai-assistant.tsx   ✅ UI component
```

---

## Help & Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **LangChain Docs**: https://python.langchain.com
- **Google Gemini**: https://ai.google.dev
- **Phase 3 Checklist**: See `PHASE_3_CHECKLIST.md`
- **Complete Summary**: See `PHASE_3_COMPLETE.md`

---

**You're all set!** 🎉

The AI service is ready to use once you add your API keys. Start the server, upload some documents, and try asking questions!
