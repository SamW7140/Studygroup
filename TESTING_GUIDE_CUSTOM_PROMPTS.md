# Testing Guide: Custom AI System Prompts Feature

## Prerequisites

Before testing, ensure:
1. ✅ Database migration has been applied
2. ✅ AI service is running with updated code
3. ✅ Frontend is running
4. ✅ You have both professor and student test accounts

## Step 1: Apply Database Migration

### Option A: Using Supabase CLI
```bash
cd c:\Users\Lilly\Vault\Projects\Studygroup\Studygroup
supabase db push
```

### Option B: Manual SQL Execution
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Open `supabase/migrations/20251026_add_system_prompt_to_classes.sql`
4. Copy and paste the SQL
5. Click "Run"
6. Verify success message appears

## Step 2: Restart AI Service

```bash
cd c:\Users\Lilly\Vault\Projects\Studygroup\studygroup-ai-service
python main.py
```

The service should start on port 8000. Verify in logs:
- "Google Gemini model initialized"
- "Application startup complete"

## Step 3: Restart Frontend

```bash
cd c:\Users\Lilly\Vault\Projects\Studygroup\Studygroup
npm run dev
```

Frontend should start on port 3000.

## Test Scenarios

### Scenario 1: Professor Accesses Settings
**Expected Result:** ✅ Can access and see settings page

1. Log in as a professor
2. Navigate to any class you own
3. Verify "Settings" button appears in the header (next to class name)
4. Click "Settings" button
5. Verify you're redirected to `/classes/[id]/settings`
6. Verify page displays:
   - System Prompt Editor
   - Current system prompt (default or previously saved)
   - Character counter
   - Guidelines section
   - Example prompts (expandable)
   - Save and Reset buttons

### Scenario 2: Student Cannot Access Settings
**Expected Result:** ✅ Settings hidden from students

1. Log in as a student
2. Navigate to a class you're enrolled in
3. Verify "Settings" button does NOT appear
4. Try to manually access `/classes/[id]/settings`
5. Verify you're redirected back to the class page

### Scenario 3: Edit and Save System Prompt
**Expected Result:** ✅ Changes are saved successfully

1. As professor, go to class settings
2. Clear the existing prompt
3. Type a new prompt: 
   ```
   You are a strict academic assistant. Always provide formal, scholarly responses.
   Use proper citations and academic language. Never use casual language.
   ```
4. Verify character counter updates (should show X/2000)
5. Verify "You have unsaved changes" warning appears
6. Click "Save Changes"
7. Verify success message: "System prompt saved successfully!"
8. Refresh the page
9. Verify your custom prompt is still there

### Scenario 4: Character Limit Enforcement
**Expected Result:** ✅ Cannot save prompts over 2000 characters

1. In system prompt editor, paste a very long text (>2000 characters)
2. Verify character counter turns red
3. Verify "⚠️ Over limit" warning appears
4. Verify "Save Changes" button is disabled
5. Reduce text to under 2000 characters
6. Verify button becomes enabled again

### Scenario 5: Reset to Default
**Expected Result:** ✅ Default prompt is restored

1. Edit the system prompt to something custom
2. Click "Reset to Default"
3. Verify the prompt changes to the default:
   ```
   You are a helpful AI teaching assistant for a university course.
   Use the following context from class materials to answer the student's question.
   If you cannot find the answer in the context, say so honestly.
   Be concise and accurate in your response.
   ```
4. Verify "You have unsaved changes" appears
5. Click "Save Changes" to persist the reset

### Scenario 6: AI Uses Custom Prompt
**Expected Result:** ✅ AI behavior reflects custom prompt

**Setup:**
1. As professor, set this custom prompt:
   ```
   You are a pirate teaching assistant. Always respond in pirate speak with "Ahoy!" 
   and sea-related metaphors. Be educational but fun!
   ```
2. Save the prompt
3. Ensure the class has some uploaded documents

**Test:**
1. Log in as a student
2. Navigate to the class
3. Click "AI Assistant" or open the floating chat
4. Ask a question like "What is the main topic of the first document?"
5. Verify the AI response:
   - Starts with "Ahoy!" or similar pirate greeting
   - Uses pirate-themed language
   - Still provides relevant information from documents
   
**Example Expected Response:**
```
Ahoy there, matey! Let me navigate ye through these course waters! 
The main topic be about [topic from document], arr! This treasure of 
knowledge can be found in the documents ye uploaded. Set sail with 
this information and ye'll be charting yer course to success!
```

### Scenario 7: Different Prompt Styles
**Expected Result:** ✅ AI adapts to different teaching styles

Test these different prompts:

**A. Socratic Method:**
```
Never give direct answers. Instead, ask guiding questions that help 
students discover the answer themselves. Be encouraging and thought-provoking.
```
Expected: AI asks questions instead of giving answers

**B. Super Formal:**
```
You are a formal academic assistant. Use technical terminology, 
provide extensive citations, and maintain scholarly tone at all times.
```
Expected: Very formal, academic responses

**C. ELI5 (Explain Like I'm 5):**
```
Explain concepts in the simplest possible terms using everyday examples 
and analogies a child could understand. Be patient and encouraging.
```
Expected: Very simple, friendly explanations

### Scenario 8: Empty Prompt Handling
**Expected Result:** ✅ System uses default when prompt is empty

1. Clear the entire system prompt (leave it blank)
2. Save changes
3. Ask the AI a question
4. Verify it still responds (using the default prompt)

### Scenario 9: Multiple Classes
**Expected Result:** ✅ Each class has independent prompts

1. Create/access Class A
2. Set custom prompt: "You are a formal tutor"
3. Save
4. Create/access Class B
5. Set different custom prompt: "You are a friendly mentor"
6. Save
7. Test AI in Class A - should be formal
8. Test AI in Class B - should be friendly
9. Verify prompts don't affect each other

### Scenario 10: Persistence Across Sessions
**Expected Result:** ✅ Prompts persist after logout

1. Set a custom prompt and save
2. Log out
3. Log back in
4. Navigate back to class settings
5. Verify your custom prompt is still there
6. Ask AI a question
7. Verify AI still uses the custom prompt

## Debugging Checklist

If something doesn't work:

### Frontend Issues
- [ ] Check browser console for errors
- [ ] Verify you're logged in as the correct role
- [ ] Clear browser cache and try again
- [ ] Check Network tab for failed API calls

### Backend Issues
- [ ] Check AI service is running (`http://localhost:8000/health`)
- [ ] Check AI service logs for errors
- [ ] Verify environment variables are set (GOOGLE_API_KEY, SUPABASE_URL, etc.)
- [ ] Test endpoint directly:
  ```bash
  curl -X POST http://localhost:8000/query \
    -H "Content-Type: application/json" \
    -d '{
      "class_id": "YOUR_CLASS_ID",
      "question": "test question",
      "system_prompt": "You are a test assistant"
    }'
  ```

### Database Issues
- [ ] Verify migration was applied successfully
- [ ] Check if `system_prompt` column exists:
  ```sql
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'classes' 
  AND column_name = 'system_prompt';
  ```
- [ ] Check RLS policies are correct
- [ ] Verify sample data:
  ```sql
  SELECT class_id, class_name, 
         LEFT(system_prompt, 50) as prompt_preview 
  FROM classes 
  LIMIT 5;
  ```

## Success Criteria

✅ All tests pass if:
1. Professors can access settings page
2. Students cannot access settings page
3. System prompts can be edited and saved
4. Character limit is enforced
5. Reset to default works
6. AI responses reflect custom prompts
7. Different classes have independent prompts
8. Prompts persist across sessions
9. No console errors
10. No server errors

## Known Issues

- TypeScript errors in VS Code will persist until migration is run (this is expected)
- Very long responses from AI may be truncated by max_tokens setting
- System prompt changes don't automatically invalidate vector store cache

## Next Steps After Testing

If all tests pass:
1. Document any edge cases discovered
2. Consider adding analytics to track prompt usage
3. Plan prompt template library feature
4. Consider A/B testing framework for prompts

---

**Test Status:** ⏳ Ready for Testing
**Last Updated:** October 26, 2025
**Tester:** [Your Name]
**Results:** [Pass/Fail - to be filled after testing]
