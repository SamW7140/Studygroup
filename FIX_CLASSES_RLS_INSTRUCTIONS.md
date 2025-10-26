# Fix Classes RLS Policy Issue

## Problem
You're getting the error: **"new row violates row-level security policy for table 'classes'"**

This happens because the `classes` table has Row-Level Security (RLS) enabled but doesn't have any policies that allow professors to create classes.

## Solution
Apply the migration file `supabase/migrations/20251025_fix_classes_rls.sql` to your Supabase database.

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
   - Visit [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste the migration SQL**
   - Open the file: `supabase/migrations/20251025_fix_classes_rls.sql`
   - Copy all the content
   - Paste it into the SQL editor

4. **Run the migration**
   - Click the "Run" button (or press Ctrl/Cmd + Enter)
   - You should see a success message: "Classes RLS policies have been successfully created!"

### Option 2: Using Supabase CLI (If you have it installed)

```powershell
# If you have Supabase CLI installed
cd C:\Users\Lilly\Vault\Projects\Studygroup\Studygroup
npx supabase db push
```

## What This Migration Does

The migration creates 4 RLS policies for the `classes` table:

1. **"Anyone can read classes"** - Allows all users (students and professors) to view available classes
2. **"Professors can create classes"** - Allows only users with `role = 'professor'` to insert new classes
3. **"Professors can update their classes"** - Allows professors to modify classes
4. **"Professors can delete their classes"** - Allows professors to remove classes

## Verify the Fix

After applying the migration:

1. **Check that the user has the professor role:**
   - Go to Supabase Dashboard → Table Editor → Profiles
   - Find your user and confirm the `role` column is set to `'professor'`

2. **Try creating a class again:**
   - Go to your app's classes page
   - Try to create a new class
   - It should now work without the RLS error!

## Additional Notes

### If you still get errors after applying the migration:

1. **Verify the user's role in the database:**
   ```sql
   SELECT id, email, role FROM "Profiles" WHERE email = 'your-email@example.com';
   ```
   The `role` should be `'professor'`, not `'student'`.

2. **Check if RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'classes' AND schemaname = 'public';
   ```
   The `rowsecurity` column should be `true`.

3. **Verify policies exist:**
   ```sql
   SELECT tablename, policyname, cmd 
   FROM pg_policies 
   WHERE tablename = 'classes';
   ```
   You should see 4 policies listed.

### If you need to manually change a user's role:

```sql
-- Run this in Supabase SQL Editor
UPDATE "Profiles" 
SET role = 'professor' 
WHERE email = 'your-email@example.com';
```

## Understanding the Error

The error occurs because:
1. RLS is enabled on the `classes` table (for security)
2. No policies were defined to allow INSERT operations
3. Even though your app checks if the user is a professor, the database itself enforces its own security rules
4. Without a policy that explicitly allows professors to insert, all INSERT operations are blocked

The migration we created adds the necessary policy that checks if the user is a professor before allowing them to create a class.

## Prevention

In the future, whenever you enable RLS on a table, make sure to:
1. Create policies for all operations you need (SELECT, INSERT, UPDATE, DELETE)
2. Test with different user roles to ensure access works as expected
3. Use `auth.uid()` in policies to reference the current user
4. Join with the `Profiles` table to check user roles

## Need Help?

If you continue to experience issues:
1. Check the Supabase logs for more detailed error messages
2. Verify your `.env.local` has the correct Supabase credentials
3. Ensure the user is properly authenticated
4. Check that the `handle_new_user` trigger properly sets the role when users sign up
