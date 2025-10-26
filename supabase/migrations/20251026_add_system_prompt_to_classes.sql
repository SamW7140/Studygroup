-- Add system_prompt column to classes table
-- This allows professors to customize the AI assistant's behavior for their class

-- Add the system_prompt column with a default value
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS system_prompt TEXT;

-- Set a sensible default system prompt for existing and new classes
UPDATE classes
SET system_prompt = 'You are a helpful AI teaching assistant for a university course.
Use the following context from class materials to answer the student''s question.
If you cannot find the answer in the context, say so honestly.
Be concise and accurate in your response.'
WHERE system_prompt IS NULL;

-- Add a check constraint to limit prompt length (max 2000 characters)
ALTER TABLE classes
ADD CONSTRAINT system_prompt_length_check 
CHECK (system_prompt IS NULL OR length(system_prompt) <= 2000);

-- Create an index for faster queries (optional, but good practice)
CREATE INDEX IF NOT EXISTS classes_system_prompt_idx ON classes(class_id) 
WHERE system_prompt IS NOT NULL;

-- Update RLS policies to allow professors to update system_prompt
-- First, check if the policy exists and drop it if needed
DROP POLICY IF EXISTS "Professors can update their classes" ON classes;

-- Recreate the policy to include system_prompt updates
-- Note: Adjust this based on your actual RLS policy structure
-- This assumes you have a way to identify class ownership via professor_id
DO $$
BEGIN
  -- Only create update policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'classes' 
    AND policyname = 'Professors can update their classes'
  ) THEN
    CREATE POLICY "Professors can update their classes"
    ON classes
    FOR UPDATE
    TO authenticated
    USING (
      professor_id = auth.uid()
      OR 
      EXISTS (
        SELECT 1 FROM "Profiles"
        WHERE id = auth.uid() AND role = 'professor'
      )
    )
    WITH CHECK (
      professor_id = auth.uid()
      OR 
      EXISTS (
        SELECT 1 FROM "Profiles"
        WHERE id = auth.uid() AND role = 'professor'
      )
    );
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ system_prompt column added to classes table successfully!';
  RAISE NOTICE '   - Default prompt set for all classes';
  RAISE NOTICE '   - Length constraint: max 2000 characters';
  RAISE NOTICE '   - RLS policies updated for professor access';
END $$;
