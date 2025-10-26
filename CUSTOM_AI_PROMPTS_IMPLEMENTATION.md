# Custom AI System Prompts Feature - Implementation Summary

## Overview
This feature allows professors to customize the AI assistant's system prompt for their classes, giving them full control over how the AI behaves and responds to student questions.

## Implementation Date
October 26, 2025

## Architecture

### Database Layer
**File:** `supabase/migrations/20251026_add_system_prompt_to_classes.sql`

- Added `system_prompt` TEXT column to `classes` table
- Set default prompt for backward compatibility
- Added length constraint (max 2000 characters)
- Updated RLS policies for professor access
- Created index for performance optimization

### Backend (Python AI Service)
**Modified Files:**
1. `rag/chain.py` - RAGChain class
   - Added optional `system_prompt` parameter to `query()` method
   - Uses custom prompt when provided, falls back to DEFAULT_SYSTEM_PROMPT
   - Added logging for custom prompt usage

2. `main.py` - FastAPI application
   - Updated `QueryRequest` model to include optional `system_prompt` field
   - Modified `/query` endpoint to accept and pass system_prompt to RAG chain
   - Added max length validation (2000 characters)

### Frontend (Next.js)
**Modified Files:**
1. `app/actions/ai-query.ts`
   - Fetches `system_prompt` from classes table
   - Passes system_prompt to AI service when available

2. `app/actions/classes.ts`
   - Added `updateClassSystemPrompt()` - Updates class system prompt (professors only)
   - Added `getClassSystemPrompt()` - Retrieves current system prompt
   - Both functions include authorization checks

**New Files:**
1. `app/(dashboard)/classes/[id]/settings/page.tsx`
   - Settings page for class configuration
   - Only accessible to professors
   - Displays system prompt editor

2. `components/classes/system-prompt-editor.tsx`
   - Client component for editing system prompts
   - Features:
     - Real-time character counter (2000 char limit)
     - Save and reset functionality
     - Example prompts for different teaching styles
     - Guidelines for writing effective prompts
     - Success/error feedback
     - Unsaved changes warning

3. `app/(dashboard)/classes/[id]/page.tsx` (modified)
   - Added Settings button for professors
   - Links to class settings page

## Features

### For Professors:
1. **Access Settings:** Click "Settings" button on class page
2. **Edit System Prompt:** Use rich textarea editor with guidelines
3. **View Examples:** Expandable section with teaching style examples
4. **Character Limit:** Visual feedback for 2000 character limit
5. **Save Changes:** Instant save with success feedback
6. **Reset to Default:** Quick reset to standard academic assistant prompt

### For Students:
- No visible changes - they benefit from customized AI behavior
- AI responses reflect professor's chosen style and constraints

### Default System Prompt:
```
You are a helpful AI teaching assistant for a university course.
Use the following context from class materials to answer the student's question.
If you cannot find the answer in the context, say so honestly.
Be concise and accurate in your response.
```

## Example Use Cases

### 1. Strict Academic Style
Professor wants formal, scholarly responses with proper citations.

### 2. Friendly Tutor Style
Professor wants approachable, encouraging responses using simple language.

### 3. Socratic Method
Professor wants AI to guide students through questions rather than giving direct answers.

### 4. Language-Specific
Professor can specify responses in a particular language or format.

### 5. Subject-Specific Constraints
- Math: "Always show step-by-step solutions"
- Programming: "Provide code examples but avoid complete solutions"
- Literature: "Reference specific page numbers and quotes"

## Security & Validation

1. **Authentication:** All endpoints require authenticated user
2. **Authorization:** Only professors can view/edit system prompts
3. **Input Validation:**
   - Max length: 2000 characters (enforced at DB, API, and UI levels)
   - SQL injection prevention via parameterized queries
4. **RLS Policies:** Database-level access control

## Testing Checklist

- [ ] Run database migration on Supabase
- [ ] Restart AI service to load updated code
- [ ] Test as professor:
  - [ ] Navigate to class settings
  - [ ] Edit and save system prompt
  - [ ] Verify character limit enforcement
  - [ ] Test reset to default
  - [ ] Ask AI a question and verify custom behavior
- [ ] Test as student:
  - [ ] Verify settings button is hidden
  - [ ] Cannot access /settings URL directly
  - [ ] AI responses reflect custom prompt
- [ ] Test edge cases:
  - [ ] Very long prompts (>2000 chars)
  - [ ] Empty prompt
  - [ ] Special characters in prompt

## Deployment Steps

### 1. Database Migration
```bash
# Connect to Supabase project
supabase db push

# Or run migration manually in Supabase SQL editor
```

### 2. AI Service Update
```bash
cd ../studygroup-ai-service
# Changes are already in place
# Just restart the service
python main.py
```

### 3. Frontend Update
```bash
# In the Studygroup directory
npm run dev
```

## API Changes

### AI Service Endpoint
**POST** `/query`

Request body now accepts optional `system_prompt`:
```json
{
  "class_id": "uuid",
  "question": "string",
  "user_id": "uuid",
  "system_prompt": "optional string (max 2000 chars)"
}
```

## Future Enhancements

1. **Prompt Templates Library:** Curated collection of prompts for different subjects
2. **A/B Testing:** Compare effectiveness of different prompts
3. **Analytics:** Track how custom prompts affect student engagement
4. **Version History:** Track changes to prompts over time
5. **Prompt Sharing:** Allow professors to share successful prompts
6. **AI Suggestions:** Use AI to suggest improvements to system prompts
7. **Per-Document Prompts:** Different prompts for different document types

## Files Modified

### Database
- `supabase/migrations/20251026_add_system_prompt_to_classes.sql`

### Backend (Outside Workspace)
- `../studygroup-ai-service/rag/chain.py`
- `../studygroup-ai-service/main.py`

### Frontend
- `app/actions/ai-query.ts`
- `app/actions/classes.ts`
- `app/(dashboard)/classes/[id]/page.tsx`
- `app/(dashboard)/classes/[id]/settings/page.tsx` (new)
- `components/classes/system-prompt-editor.tsx` (new)

## Known Limitations

1. TypeScript errors will persist until database migration is run
2. AI service is outside workspace (located in parent directory)
3. System prompt changes don't invalidate vector store cache
4. No versioning/history of prompt changes yet

## Support

For issues or questions:
1. Check that database migration was successfully applied
2. Verify AI service is running and updated
3. Check browser console for frontend errors
4. Review server logs for backend errors

---

**Status:** ✅ Implementation Complete - Ready for Testing
**Priority:** High - Core feature for professor control
**Risk Level:** Low - Isolated feature with proper authorization
