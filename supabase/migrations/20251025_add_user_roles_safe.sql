-- Safe version of migration with existence checks
-- Run this in Supabase SQL Editor

-- Add role column to Profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE "Profiles" ADD COLUMN role TEXT DEFAULT 'student' CHECK (role IN ('student', 'professor', 'admin'));
  END IF;
END $$;

-- Add full_name column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE "Profiles" ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- Add email column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE "Profiles" ADD COLUMN email TEXT UNIQUE;
  END IF;
END $$;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON "Profiles" (email);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS profiles_role_idx ON "Profiles" (role);

-- Enable RLS
ALTER TABLE "Profiles" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON "Profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON "Profiles";
DROP POLICY IF EXISTS "Anyone can create profile" ON "Profiles";

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON "Profiles"
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON "Profiles"
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow anyone to insert a profile (for registration)
CREATE POLICY "Anyone can create profile" ON "Profiles"
  FOR INSERT
  WITH CHECK (true);

-- Create a trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."Profiles" (id, email, username, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully! User roles and authentication setup is ready.';
END $$;
