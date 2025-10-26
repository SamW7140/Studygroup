-- Add role column to Profiles table
ALTER TABLE "Profiles" 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('student', 'professor', 'admin'));

-- Add full_name and email columns for better user management
ALTER TABLE "Profiles" 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON "Profiles" (email);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS profiles_role_idx ON "Profiles" (role);

-- Update RLS policies to allow users to read their own profile
ALTER TABLE "Profiles" ENABLE ROW LEVEL SECURITY;

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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
