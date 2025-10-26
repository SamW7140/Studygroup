-- Verify and fix documents table schema
DO $$ 
BEGIN
    -- Check if class_id column exists and is properly configured
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'class_id'
    ) THEN
        -- Add class_id column if it doesn't exist
        ALTER TABLE documents 
        ADD COLUMN class_id UUID REFERENCES classes(class_id);
    END IF;

    -- Add not null constraint if it's missing
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'class_id' 
        AND is_nullable = 'YES'
    ) THEN
        -- Make sure all existing rows have a valid class_id first
        -- You might want to handle existing null values differently
        ALTER TABLE documents 
        ALTER COLUMN class_id SET NOT NULL;
    END IF;
END $$;