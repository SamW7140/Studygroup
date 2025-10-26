-- Add class_code column to classes table
-- This allows professors to share a unique code with students for easy enrollment

-- Add the class_code column
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS class_code VARCHAR(10) UNIQUE;

-- Create an index on class_code for faster lookups
CREATE INDEX IF NOT EXISTS classes_class_code_idx ON classes(class_code);

-- Function to generate a unique 6-character alphanumeric class code
CREATE OR REPLACE FUNCTION generate_class_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excludes confusing chars like 0, O, I, 1
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM classes WHERE class_code = result) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate class_code on insert
CREATE OR REPLACE FUNCTION set_class_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.class_code IS NULL THEN
    NEW.class_code := generate_class_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_class_code ON classes;

-- Create the trigger
CREATE TRIGGER trigger_set_class_code
  BEFORE INSERT ON classes
  FOR EACH ROW
  EXECUTE FUNCTION set_class_code();

-- Generate codes for existing classes (if any)
UPDATE classes
SET class_code = generate_class_code()
WHERE class_code IS NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Class code column and generation function have been successfully created!';
END $$;
