-- Allow professors to read all profiles (needed for class rosters)
CREATE POLICY "Professors can read all profiles" ON "Profiles"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Profiles" p
      WHERE p.id = auth.uid() AND p.role = 'professor'
    )
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Professors can now read all student profiles for class rosters!';
END $$;
