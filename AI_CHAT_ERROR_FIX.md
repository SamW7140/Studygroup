# AI Chat Error Fix - "An unexpected error occurred"

## Problem
You were getting "An unexpected error occurred while querying the AI" when trying to use the AI chat feature.

## What Was Fixed

### 1. **Enhanced Error Handling in Server Action** (`app/actions/chat.ts`)
   - Added detailed error logging with proper error categorization
   - Improved error messages for common failure scenarios:
     - **Connection failures**: "Unable to connect to AI service"
     - **Timeout errors**: "Request timed out"
     - **No documents**: "No documents found for this class"
     - **Invalid class ID**: "Invalid class ID. Please try refreshing the page"
     - **Database errors**: Specific error messages for UUID issues and missing data
   - Added structured error response parsing from the AI service
   - Added detailed console logging at each step for debugging

### 2. **Improved Client-Side Error Reporting** (`components/ai/chat-interface.tsx`)
   - Enhanced console logging to show exactly what's being sent and received
   - Better error message display in the chat interface
   - More detailed error information in toasts

## How to Debug

### Step 1: Check if AI Service is Running
```powershell
# Check if port 8000 is listening
netstat -ano | findstr "LISTENING" | findstr ":8000"

# Test health endpoint
curl http://localhost:8000/health -UseBasicParsing
```

### Step 2: Check Dev Server
```powershell
# Make sure Next.js is running on port 3000
npm run dev
```

### Step 3: Check Browser Console
1. Open the page: `http://localhost:3000/classes/[your-class-id]/ai`
2. Open DevTools (F12)
3. Go to Console tab
4. Try sending a message
5. Look for these log messages:
   - `📤 Sending query to AI:` - Client sending request
   - `🤖 Querying AI service:` - Server received request
   - `📡 AI service response status:` - AI service responded
   - `✅ AI service response:` - Success
   - `❌` - Any errors

### Step 4: Check Server Console
Look in the terminal running `npm run dev` for:
- `🤖 Querying AI service:` logs
- `❌ AI service error response:` logs
- Any error stack traces

### Step 5: Test AI Service Directly
```powershell
# Replace YOUR_CLASS_ID with actual UUID
$headers = @{'Content-Type' = 'application/json'}
$body = '{"class_id": "YOUR_CLASS_ID", "question": "What is this class about?", "user_id": "test"}'
Invoke-RestMethod -Uri http://localhost:8000/query -Method POST -Headers $headers -Body $body
```

## Common Error Scenarios & Solutions

### Error: "Unable to connect to AI service"
**Cause**: AI service is not running on port 8000
**Solution**:
```powershell
cd ..\studygroup-ai-service
.\venv\Scripts\python.exe main.py
```

### Error: "No documents found for this class"
**Cause**: Class has no uploaded documents
**Solution**: Upload PDFs, DOCX, or PPTX files to the class first

### Error: "Invalid class ID"
**Cause**: Class ID is not a valid UUID or doesn't exist
**Solution**: 
- Check that you're on a valid class page
- Try refreshing the page
- Check the URL includes a proper UUID format class ID

### Error: "Request timed out"
**Cause**: First query is indexing documents (can take 30+ seconds for large files)
**Solution**: Wait and try again. Subsequent queries will be faster.

### Error: "Failed to process query: invalid input syntax for type uuid"
**Cause**: Class ID being passed is not a valid UUID format
**Solution**: 
- Verify the class exists in your database
- Check that the URL parameter is correct
- Try navigating to the class from the classes list page

## Environment Variables to Check

In `.env.local`:
```bash
AI_SERVICE_URL=http://localhost:8000
```

In `studygroup-ai-service/.env`:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
GOOGLE_API_KEY=your_gemini_api_key
```

## Testing the Full Flow

1. **Start AI Service**:
   ```powershell
   cd ..\studygroup-ai-service
   .\venv\Scripts\python.exe main.py
   ```

2. **Start Next.js**:
   ```powershell
   cd ..\Studygroup
   npm run dev
   ```

3. **Navigate to a class with documents**:
   - Go to http://localhost:3000
   - Select a class that has uploaded documents
   - Click on "AI Assistant" or navigate to `/classes/[class-id]/ai`

4. **Ask a question**:
   - Type: "What is this course about?"
   - First query may take 10-15 seconds (indexing)
   - Check console for detailed logs

## What the Logs Tell You

### Success Flow:
```
📤 Sending query to AI: {classId: "...", question: "..."}
🤖 Querying AI service: {url: "http://localhost:8000", ...}
📡 AI service response status: 200
✅ AI service response: {answerLength: 245, sourcesCount: 3, ...}
📥 Received result: {success: true, ...}
```

### Error Flow Example:
```
📤 Sending query to AI: {classId: "...", question: "..."}
🤖 Querying AI service: {url: "http://localhost:8000", ...}
📡 AI service response status: 500
❌ AI service error response: {"detail":"Failed to process query: ..."}
📥 Received result: {success: false, error: "..."}
```

## Next Steps If Still Having Issues

1. **Check the exact error message** in the browser console
2. **Check server logs** in the terminal running `npm run dev`
3. **Check AI service logs** in the terminal running `main.py`
4. **Test the AI service** independently using curl/PowerShell
5. **Verify all environment variables** are set correctly
6. **Check class has documents** uploaded and accessible

## Quick Troubleshooting Checklist

- [ ] AI service running on port 8000?
- [ ] Next.js dev server running on port 3000?
- [ ] `.env.local` has `AI_SERVICE_URL=http://localhost:8000`?
- [ ] Class exists and you have access to it?
- [ ] Class has documents uploaded?
- [ ] Documents are successfully stored in Supabase storage?
- [ ] Supabase credentials are correct in AI service `.env`?
- [ ] Google Gemini API key is valid?

## Changes Made to Code

### File: `app/actions/chat.ts`
- Enhanced error handling with specific error messages
- Added detailed logging at each step
- Improved error response parsing from AI service
- Added timeout handling
- Better categorization of different error types

### File: `components/ai/chat-interface.tsx`
- Added detailed console logging
- Enhanced error message display
- Better error information in UI
- More context in error messages

## Still Having Issues?

If you're still getting errors after these fixes:

1. Share the **exact error message** from:
   - Browser console (F12 → Console)
   - Server terminal (`npm run dev`)
   - AI service terminal (`python main.py`)

2. Share the **output** of:
   ```powershell
   curl http://localhost:8000/health -UseBasicParsing
   ```

3. Try a **simple test query** directly to the AI service with a valid class ID

The enhanced logging will now show you exactly where the error is occurring!
