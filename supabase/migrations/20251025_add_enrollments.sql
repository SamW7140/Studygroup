-- Migration to add class enrollments table
-- Run this after the document storage migration

-- Create enrollments table
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "Profiles"(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS enrollments_class_id_idx ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS enrollments_user_id_idx ON class_enrollments(user_id);

-- Enable RLS
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;

-- Allow users to see enrollments for their classes
CREATE POLICY "Users can see class enrollments" ON class_enrollments
  FOR SELECT
  USING (true);

-- Allow users to enroll themselves
CREATE POLICY "Users can enroll in classes" ON class_enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to unenroll themselves
CREATE POLICY "Users can unenroll from classes" ON class_enrollments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add professor_id to classes table (optional, for tracking class creator)
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS professor_id UUID REFERENCES "Profiles"(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS classes_professor_id_idx ON classes(professor_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Enrollment system migration completed!';
END $$;
