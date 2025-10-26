# 🚀 How to Start the AI Service

## The Problem & Solution
The AI service keeps shutting down because **running other commands in the same terminal interrupts it**. The service itself works perfectly - it just needs its own dedicated terminal window.

**Solution**: Use the provided startup scripts to run the service in a separate window!

## ⚡ Quick Start (EASIEST METHOD)

### Option 1: Double-Click the Startup Script
1. Open File Explorer
2. Navigate to: `C:\Users\Lilly\Vault\Projects\Studygroup\studygroup-ai-service\`
3. Double-click: `start_service.bat` (for Command Prompt) **OR** `start_service.ps1` (for PowerShell)
4. A new window will open with the AI service running ✅
5. **Keep this window open** - closing it stops the service

### Option 2: Run from Terminal
```powershell
cd ..\studygroup-ai-service
.\start_service.bat
```

That's it! The service will start in its own window and stay running.

## 🔧 Manual Start (if needed)

### Step 1: Open a **DEDICATED NEW Terminal**
Press `Ctrl + Shift + `` (backtick) or click Terminal → New Terminal

**IMPORTANT**: This terminal is ONLY for the AI service - don't run other commands in it!

### Step 2: Navigate to AI Service Directory
```powershell
cd ..\studygroup-ai-service
```

### Step 3: Activate Python Virtual Environment
```powershell
.\venv\Scripts\Activate.ps1
```

You should see `(venv)` appear in your prompt.

### Step 4: Start the Service
```powershell
python main.py
```

You should see:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

## Verify It's Working

Open another terminal and test:

```powershell
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "healthy",
  "supabase_connected": true,
  "gemini_configured": true,
  "vector_store_path": "./vector_stores"
}
```

## Now Try Your Chat Again!

1. Go to your class page in the Next.js app (running on port 3006)
2. Click the floating AI chat button (bottom right)
3. Ask a question about your documents
4. **First query takes 10-15 seconds** (downloads docs, builds vector index)
5. Subsequent queries are fast (2-5 seconds, uses cached index)

## Watch the AI Service Logs

In the terminal where the AI service is running, you'll see:

```
INFO:     Query received for class 'abc-123': What is...
INFO:     Fetching documents for class abc-123
INFO:     Found 5 documents
INFO:     Building vector store...
INFO:     Query completed successfully
```

## Troubleshooting

### If you get "python: command not found"
Try:
```powershell
python3 main.py
```

### If activation fails
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\venv\Scripts\Activate.ps1
```

### If venv doesn't exist
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```

### Port 8000 already in use
```powershell
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Then start the service again
python main.py
```

## Keep Both Servers Running

You need **TWO terminals running**:

1. **Terminal 1**: Next.js frontend (port 3006) - Already running ✅
2. **Terminal 2**: Python AI service (port 8000) - **Start this now** ❌

## Expected Behavior After Starting

When you ask a question in the chat:

1. **First time for each class** (10-15 seconds):
   - Downloads all PDFs from Supabase Storage
   - Extracts text from each PDF
   - Chunks text into ~1000 character pieces
   - Generates embeddings using Google Gemini
   - Creates FAISS vector index
   - Saves to `vector_stores/{class_id}.faiss`
   - Searches for relevant chunks
   - Generates answer with Google Gemini
   - Returns answer with source citations

2. **Subsequent queries** (2-5 seconds):
   - Loads cached vector index
   - Searches for relevant chunks
   - Generates answer
   - Returns answer

You'll see detailed logs in the AI service terminal showing each step.

## Summary

**DO THIS NOW:**
1. Open new terminal
2. `cd ..\studygroup-ai-service`
3. `.\venv\Scripts\Activate.ps1`
4. `python main.py`
5. Try your chat again!

The generic response you were getting is because your Next.js app couldn't reach the AI service (it wasn't running), so it fell back to a default message. Once you start the service, you'll get real answers from your documents! 🎉
