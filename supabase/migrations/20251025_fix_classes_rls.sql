-- Fix RLS policies for classes table to allow professors to create classes

-- Enable RLS on classes table if not already enabled
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can read classes" ON classes;
DROP POLICY IF EXISTS "Professors can create classes" ON classes;
DROP POLICY IF EXISTS "Professors can update their classes" ON classes;
DROP POLICY IF EXISTS "Professors can delete their classes" ON classes;

-- Allow everyone to read classes (students need to see available classes)
CREATE POLICY "Anyone can read classes" ON classes
  FOR SELECT
  USING (true);

-- Allow professors to create classes
CREATE POLICY "Professors can create classes" ON classes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Profiles"
      WHERE id = auth.uid()
      AND role = 'professor'
    )
  );

-- Allow professors to update their own classes
CREATE POLICY "Professors can update their classes" ON classes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Profiles"
      WHERE id = auth.uid()
      AND role = 'professor'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Profiles"
      WHERE id = auth.uid()
      AND role = 'professor'
    )
  );

-- Allow professors to delete their own classes
CREATE POLICY "Professors can delete their classes" ON classes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Profiles"
      WHERE id = auth.uid()
      AND role = 'professor'
    )
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Classes RLS policies have been successfully created!';
END $$;
