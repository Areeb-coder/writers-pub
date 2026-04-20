-- Add missing columns for plagiarism check to drafts table
ALTER TABLE drafts 
ADD COLUMN IF NOT EXISTS plagiarism_score INTEGER,
ADD COLUMN IF NOT EXISTS last_plagiarism_check TIMESTAMPTZ;
