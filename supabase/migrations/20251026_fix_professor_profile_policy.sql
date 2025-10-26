-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Professors can read all profiles" ON "Profiles";

-- Create a better policy that uses auth.jwt() to check role without recursion
-- This checks the role from the JWT token metadata instead of querying the table
CREATE POLICY "Professors can read all profiles" ON "Profiles"
  FOR SELECT
  USING (
    auth.uid() = id  -- Users can still read their own profile
    OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'professor'  -- Or if they're a professor
  );

-- Alternative simpler approach: Just allow all authenticated users to read profiles
-- This is simpler and works for most educational platforms
DROP POLICY IF EXISTS "Professors can read all profiles" ON "Profiles";
CREATE POLICY "Authenticated users can read all profiles" ON "Profiles"
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Fixed profile read policy - all authenticated users can now read profiles!';
END $$;
