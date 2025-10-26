# Quick Start: Applying Class Code Feature

## Step 1: Apply Database Migration

Run the SQL migration in your Supabase database:

### Option A: Using Supabase CLI
```bash
cd supabase
supabase db push
```

### Option B: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase/migrations/20251025_add_class_code.sql`
5. Click **Run** to execute the migration

## Step 2: Verify Migration

Run this query in the SQL Editor to verify:
```sql
-- Check if class_code column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'classes' AND column_name = 'class_code';

-- Check if codes were generated for existing classes
SELECT class_id, class_name, class_code
FROM classes;
```

## Step 3: Test the Application

### As a Professor:
1. Log in as a professor
2. Go to the Classes page
3. Click "Create New Class"
4. Enter a class name and submit
5. **Verify**: A 6-character class code should be displayed (e.g., "ABC123")
6. Click the "Copy" button to copy the code
7. Navigate to the class detail page
8. **Verify**: The class code is displayed in a blue info box

### As a Student:
1. Log in as a student
2. Go to the Classes page
3. Click "Join Class with Code"
4. Enter the class code from the professor
5. Click "Join Class"
6. **Verify**: Success message appears and the class is added to your list
7. Try joining the same class again
8. **Verify**: Error message "You are already enrolled in this class"

## Troubleshooting

### Migration fails with "column already exists"
The migration uses `IF NOT EXISTS`, so it should be safe to run multiple times. If you get an error:
```sql
-- Check current state
SELECT * FROM classes LIMIT 1;
```

### Class code is NULL after creating a class
1. Verify the trigger was created:
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'classes';
```

2. Manually generate codes:
```sql
UPDATE classes SET class_code = generate_class_code() WHERE class_code IS NULL;
```

### Students can't join with code
1. Check the code is correct (case-insensitive, 6 characters)
2. Verify the enrollment policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'class_enrollments';
```

## File Summary

**New Files:**
- `supabase/migrations/20251025_add_class_code.sql` - Database migration
- `components/classes/join-class-form.tsx` - Student join form
- `components/classes/class-code-display.tsx` - Professor code display
- `CLASS_CODE_IMPLEMENTATION.md` - Full documentation

**Modified Files:**
- `lib/supabase/types.ts` - Added class_code field
- `app/actions/classes.ts` - Return class_code in responses
- `app/actions/enrollments.ts` - Added enrollByClassCode function
- `components/classes/create-class-form.tsx` - Display code after creation
- `app/(dashboard)/classes/page.tsx` - Added join form for students
- `app/(dashboard)/classes/[id]/page.tsx` - Display code for professors

## Next Steps

After verifying everything works:
1. Share class codes with students through your preferred method (email, LMS, etc.)
2. Monitor enrollment using the class roster
3. Consider adding the optional enhancements listed in `CLASS_CODE_IMPLEMENTATION.md`

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the Supabase logs in the dashboard
3. Verify all RLS policies are in place from previous migrations
4. Ensure users have the correct roles (professor/student)
