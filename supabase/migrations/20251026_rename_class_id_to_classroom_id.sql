-- Fix documents table constraints
BEGIN;

-- Drop any existing indexes
DROP INDEX IF EXISTS documents_class_id_idx;
DROP INDEX IF EXISTS documents_classroom_id_idx;

-- Drop any existing foreign key constraints
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_class_id_fkey;
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_classroom_id_fkey;

-- Re-add the foreign key constraint
ALTER TABLE documents 
ADD CONSTRAINT documents_classroom_id_fkey 
FOREIGN KEY (classroom_id) 
REFERENCES classes(class_id);

-- Re-create the index with new name
CREATE INDEX documents_classroom_id_idx ON documents(classroom_id);

COMMIT;