# User Authentication Setup

## Overview

The authentication system is now set up with support for two user roles:
- **Students** 🎓
- **Professors** 👨‍🏫

## How to Create Test Users

### Method 1: Use the Signup Page

1. Start your Next.js dev server:
   ```powershell
   npm run dev
   ```

2. Go to: http://localhost:3000/auth/signup

3. Create test accounts:

**Test Professor:**
- Full Name: Dr. Sarah Johnson
- Username: drjohnson
- Email: professor@test.com
- Password: test123
- Role: Professor

**Test Student:**
- Full Name: Alex Chen
- Username: alexchen
- Email: student@test.com
- Password: test123
- Role: Student

### Method 2: Use Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User**
4. Enter email and password
5. After creating, go to **Table Editor** → **Profiles**
6. Update the user's profile with:
   - `role`: 'professor' or 'student'
   - `full_name`: Their name
   - `username`: Their username

### Method 3: Run SQL in Supabase

Run this in your Supabase SQL Editor:

```sql
-- First, create the migration to add role support
-- Copy from: supabase/migrations/20251025_add_user_roles.sql

-- Then you can manually insert profiles (after creating auth users)
-- Note: You should create auth users through the auth.users table or dashboard first
```

## Pages Available

### Public Pages (No Auth Required)
- `/auth/login` - Sign in page
- `/auth/signup` - Sign up page with role selection

### Protected Pages (Auth Required)
- `/` - Main dashboard
- `/classes` - All class pages
- `/docs` - Document pages

## Features

### Authentication Flow
1. **Sign Up**: Users choose their role (student/professor) and create an account
2. **Profile Creation**: A profile is automatically created with their role
3. **Sign In**: Users can log in with email/password
4. **Protected Routes**: Middleware redirects unauthenticated users to login

### User Profile Component
Use the `<UserProfile />` component to show user info:

```tsx
import { UserProfile } from '@/components/auth/user-profile'

export default function Page() {
  return (
    <div>
      <UserProfile />
      {/* Rest of your page */}
    </div>
  )
}
```

Shows:
- User's full name
- Role badge (🎓 Student or 👨‍🏫 Professor)
- Email
- Username
- Sign Out button

### Server Actions
Available in `app/actions/auth.ts`:

```typescript
// Sign out the current user
await signOut()

// Get current user's profile
const user = await getCurrentUser()
// Returns: { id, email, username, full_name, role }
```

## Database Schema Updates

The `Profiles` table now has:
- `id` - UUID (matches auth.users.id)
- `email` - User's email
- `username` - Unique username
- `full_name` - Display name
- `role` - 'student' | 'professor' | 'admin'
- `created_at` - Timestamp

### Row Level Security (RLS)
- Users can read their own profile
- Users can update their own profile
- Anyone can create a profile (for signup)

## Testing the Setup

1. **Start the dev server:**
   ```powershell
   npm run dev
   ```

2. **Create a professor account:**
   - Go to http://localhost:3000/auth/signup
   - Select "Professor" role
   - Fill in details and sign up

3. **Create a student account:**
   - Sign out
   - Go to http://localhost:3000/auth/signup
   - Select "Student" role
   - Fill in details and sign up

4. **Test the flow:**
   - Sign in as professor
   - Check the dashboard shows professor badge
   - Sign out
   - Sign in as student
   - Check the dashboard shows student badge

## Next Steps

### For Professors:
- Create classes
- Upload course materials
- View student questions

### For Students:
- Enroll in classes
- View class materials
- Ask AI questions about documents

## Troubleshooting

### "User already registered"
- Email is already in use
- Try a different email or use the login page

### Profile not showing role
- Run the migration: `supabase/migrations/20251025_add_user_roles.sql`
- Check the `Profiles` table has a `role` column

### Redirecting to login immediately
- Check your `.env.local` has the correct Supabase keys
- Check middleware is working correctly

### Sign out not working
- Clear your browser cookies
- Try in an incognito window

## Migration Required

**Before testing, run the migration!**

Go to your Supabase Dashboard:
1. SQL Editor → New Query
2. Copy the contents of `supabase/migrations/20251025_add_user_roles.sql`
3. Run the query
4. Verify the `Profiles` table has new columns

Or use Supabase CLI:
```powershell
# If you have Supabase CLI installed
supabase db push
```

## Security Notes

- Passwords must be at least 6 characters
- Emails must be valid
- Usernames are stored but not enforced as unique (you may want to add this)
- Service role key is needed for AI service (already configured)
- Anon key is used for frontend (already configured)

---

**Ready to test!** 🎉

Create your test users and start testing the authentication flow!
