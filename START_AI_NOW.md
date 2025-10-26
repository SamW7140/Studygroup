# 🚀 START THE AI SERVICE NOW

## The Issue
The AI service keeps shutting down when started via VS Code terminal. You need to start it manually.

## Quick Fix (Do This Now)

### Open a NEW Windows PowerShell (Outside VS Code)

1. Press `Windows Key + R`
2. Type: `powershell`
3. Press Enter

### In the PowerShell window, run these commands:

```powershell
cd C:\Users\Lilly\Vault\Projects\Studygroup\studygroup-ai-service

.\venv\Scripts\Activate.ps1

python main.py
```

You should see:
```
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**KEEP THIS WINDOW OPEN!** Don't close it. The AI service needs to stay running.

## Then Test Your Chat

1. Go back to your browser
2. Navigate to your class page (e.g., `http://localhost:3006/classes/your-class-id`)
3. Click the floating AI chat button (bottom right)
4. Ask a question about your documents
5. **First query takes 10-15 seconds** (builds the index)
6. After that, queries are fast!

## What I Fixed

I upgraded these Python packages to fix compatibility issues:
- `supabase`: 2.3.0 → 2.22.2
- `httpx`: 0.24.1 → 0.27.2
- `storage3`: 0.7.7 → 2.22.2  
- `realtime`: 1.0.6 → 2.22.2
- `websockets`: 12.0 → 15.0.1
- `pydantic`: 2.5.0 → 2.12.3

The "Client.__init__() got an unexpected keyword argument 'proxy'" error is now fixed!

## Troubleshooting

If you still get the generic message after starting the service:

1. **Check the Python terminal shows the service is running**
2. **In your browser console** (F12), look for these logs:
   - "🤖 Querying AI service:"
   - "📡 AI service response status:"
   - "✅ AI service response:"

3. **In the Python terminal**, you should see when you query:
   ```
   INFO: Query received for class 'abc-123': What is...
   INFO: Fetching documents for class abc-123
   INFO: Found X documents
   ```

If you see "No documents found", make sure you've uploaded PDF documents to your class!

## Alternative: Use Windows Terminal

If PowerShell doesn't work, try Windows Terminal:

1. Open Windows Terminal
2. Run:
   ```powershell
   cd C:\Users\Lilly\Vault\Projects\Studygroup\studygroup-ai-service
   .\venv\Scripts\python.exe main.py
   ```

Keep that window open and try your chat again!
